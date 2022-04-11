const Builders = require('@discordjs/builders');
const jobs = require('node-schedule');
const confusables = require('confusables');

module.exports = {
  name: 'massban',
  perm: 4n,
  dm: false,
  takesFirstArg: true,
  aliases: ['namemassban', 'massbannames', 'massbanname'],
  type: 'mod',
  async execute(msg, answer) {
    const args = await getArgs(msg);
    if (!args) return;

    const users = [];
    const failed = [];
    const reason = [];

    args.forEach((rawArg) => {
      const arg = rawArg.toLowerCase();

      if (Number.isNaN(+arg)) {
        if (arg.includes('<@') && arg.includes('>')) {
          const userID = arg.replace(/\D+/g, '');
          const user = msg.client.users.cache.get(userID);

          if (user && user.id) {
            const bannedUser = msg.guild.bans.cache.find(
              (thisBans) => thisBans.user.id === user.id,
            );

            if (bannedUser) {
              failed.push(`${arg} ${msg.lan.already}`);
            } else if (user.id !== msg.author.id) {
              const member = msg.guild.members.cache.get(user.id);

              if (member) {
                if (+msg.member.roles.highest.position > +member.roles.highest.position) {
                  if (+msg.member.roles.highest.position !== +member.roles.highest.position) {
                    if (member.bannable) users.push(user);
                    else failed.push(`${arg} ${msg.lan.iCant}`);
                  } else failed.push(`${arg} ${msg.lan.youCant}`);
                } else failed.push(`${arg} ${msg.lan.youCant}`);
              } else users.push(user);
            } else failed.push(`${arg} ${msg.lan.selfban}`);
          } else users.push(userID);
        } else reason.push(arg);
      } else {
        const user = msg.client.users.cache.get(arg);
        if (user && user.id) {
          const bannedUser = msg.guild.bans.cache.find((thisBans) => thisBans.user.id === arg);

          if (bannedUser) {
            failed.push(`${arg} ${msg.lan.already}`);
          } else if (user.id !== msg.author.id) {
            const member = msg.guild.members.cache.get(user.id);

            if (member) {
              if (+msg.member.roles.highest.position > +member.roles.highest.position) {
                if (+msg.member.roles.highest.position !== +member.roles.highest.position) {
                  if (member.bannable) users.push(user);
                  else failed.push(`${arg} ${msg.lan.iCant}`);
                } else failed.push(`${arg} ${msg.lan.youCant}`);
              } else failed.push(`${arg} ${msg.lan.youCant}`);
            } else users.push(user);
          } else failed.push(`${arg} ${msg.lan.selfban}`);
        } else users.push(arg);
      }
    });

    let banreason = '';
    if (reason.length === 0) banreason = msg.lan.reason;
    else banreason = reason.join(' ');

    if (!users.length && !failed.length) {
      msg.content = `${msg.client.constants.standard.prefix}${module.exports.name}`;
      msg.client.emit('messageCreate', msg);
      return;
    }

    const con = msg.client.constants.commands.massban;
    const uniqueUsers = users.filter((item, pos, self) => self.indexOf(item) === pos);
    const uniqueFails = failed.filter((item, pos, self) => self.indexOf(item) === pos);
    const descS = [];
    const descF = [];

    if (uniqueUsers.length !== 0) {
      const replyEmbed = new Builders.UnsafeEmbedBuilder()
        .setColor(con.success)
        .setDescription(msg.lan.descS)
        .setAuthor({
          name: msg.lan.descSLoading,
          iconURL: msg.client.objectEmotes.loading.link,
          url: msg.client.constants.standard.invite,
        })
        .setTimestamp();

      if (answer) msg.m = await answer.followUp({ embeds: [replyEmbed] });
      else msg.m = await msg.client.ch.reply(msg, { embeds: [replyEmbed] });

      if (!msg.m) {
        msg.m = await answer.fetchReply();
      }

      uniqueUsers.forEach(async (user, i) => {
        const ban = await msg.guild.bans
          .create(user, {
            deleteMessageDays: 1,
            reason: msg.client.ch.stp(msg.lan.banReason, { user: msg.author, reason: banreason }),
          })
          .catch(() => {
            uniqueUsers.splice(i, 1);
            uniqueFails.push(`${user.id ? user.id : user} ${msg.lan.ohno}`);
          });
        if (ban) {
          descS.push(`<@${user.id ? user.id : user}>`);
          if (`${descS}`.length > 2048) {
            replyEmbed.setDescription(
              msg.client.ch.stp(msg.lan.sBannedUsers, { amount: descS.length }),
            );
          } else replyEmbed.setDescription(`\u200b${descS.join(' ')}`);
        }
      });
      const editIntervalS = jobs.scheduleJob('*/5 * * * * *', () => {
        if (descS.length !== uniqueUsers.length) msg.m.edit({ embeds: [replyEmbed] });
      });

      const intervalS = jobs.scheduleJob('*/1 * * * * *', () => {
        if (descS.length === uniqueUsers.length) {
          if (`${descS}`.length > 2048) {
            replyEmbed.setDescription(
              msg.client.ch.stp(msg.lan.sBannedUsers, { amount: descS.length }),
            );
          } else replyEmbed.setDescription(`\u200b${descS.join(' ')}`);
          replyEmbed.setAuthor({
            name: msg.lan.finish,
            iconURL: msg.client.objectEmotes.tick.link,
            url: msg.client.constants.standard.invite,
          });
          intervalS.cancel();
          editIntervalS.cancel();
          jobs.scheduleJob(new Date(Date.now() + 3600000), () => {
            interval.cancel();
          });
          jobs.scheduleJob(new Date(Date.now() + 2000), () => {
            if (!descS.length) msg.m.delete();
            else msg.m.edit({ embeds: [replyEmbed] });
          });
        }
      });
    }

    if (uniqueFails.length !== 0) {
      const replyEmbed = new Builders.UnsafeEmbedBuilder()
        .setColor(con.fail)
        .setDescription(msg.lan.descF)
        .setAuthor({
          name: msg.lan.descFLoading,
          iconURL: msg.client.objectEmotes.loading.link,
          url: msg.client.constants.standard.invite,
        })
        .setTimestamp();
      const m = await msg.client.ch.reply(msg, { embeds: [replyEmbed] });

      uniqueFails.forEach(async (fail) => {
        descF.push(`${fail}\n`);
        if (`${descF}`.length > 2048) {
          replyEmbed.setDescription(
            msg.client.ch.stp(msg.lan.fBannedUsers, { amount: descF.length }),
          );
        } else replyEmbed.setDescription(`\u200b${descF.join('')}`);
      });

      const editintervalF = jobs.scheduleJob('*/5 * * * * *', () => {
        if (descF.length !== uniqueFails.length) m.edit({ embeds: [replyEmbed] });
      });

      const intervalF = jobs.scheduleJob('*/1 * * * * *', () => {
        if (descF.length === uniqueFails.length) {
          if (`${descF}`.length > 2048) {
            replyEmbed.setDescription(
              msg.client.ch.stp(msg.lan.fBannedUsers, { amount: descF.length }),
            );
          } else replyEmbed.setDescription(`\u200b${descF.join('')}`);
          replyEmbed.setAuthor({
            name: msg.lan.failed,
            iconURL: msg.client.objectEmotes.cross.link,
            url: msg.client.constants.standard.invite,
          });

          intervalF.cancel();
          editintervalF.cancel();

          jobs.scheduleJob(new Date(Date.now() + 3600000), () => {
            interval.cancel();
          });
          jobs.scheduleJob(new Date(Date.now() + 2000), () => {
            if (!descF.length) m.delete();
            else m.edit({ embeds: [replyEmbed] });
          });
        }
      });
    }

    const interval = jobs.scheduleJob('*/1 * * * * *', () => {
      if (uniqueUsers.length === descS.length && uniqueFails.length === descF.length) {
        const logembed = new Builders.UnsafeEmbedBuilder()
          .setAuthor({
            name: msg.client.ch.stp(msg.lan.log.desc, { amount: uniqueUsers.length }),
            iconURL: msg.client.constants.guildBanAdd.author.image,
            url: msg.client.constants.standard.invite,
          })
          .setDescription(
            msg.client.ch.stp(msg.lan.log.author, {
              user: msg.author,
              amount: uniqueUsers.length,
            }),
          )
          .addFields({ name: msg.language.reason, value: banreason })
          .setColor(con.log.color)
          .setTimestamp();

        const arr = uniqueUsers.map(
          (user) => `ID: ${user.id ? user.id : user} | Tag: ${user.tag ? user.tag : 'Unknown'}`,
        );
        const attachment = msg.client.ch.txtFileWriter(arr);
        if (msg.logchannels && msg.logchannels.length !== 0 && uniqueUsers.length !== 0) {
          if (attachment) {
            msg.logchannels.forEach((c) => {
              msg.client.ch.send(c, {
                embeds: [logembed],
                files: [attachment],
              });
            });
          } else msg.logchannels.forEach((c) => msg.client.ch.send(c, { embeds: [logembed] }));
        }
        interval.cancel();
      }
    });
  },
};

const getArgs = async (msg) => {
  const result = await require('../Events/messageEvents/messageCreate/commandHandler').prefix(msg);
  const [, prefix] = result;
  const commandName = msg.content
    .replace(/\\n/g, ' ')
    .slice(prefix.length)
    .split(/ +/)
    .shift()
    .toLowerCase();

  await msg.guild.members.fetch().catch(() => {});

  if (commandName === module.exports.name) return msg.args;

  const usernameToFind = msg.args.slice(0).join(' ');

  const members = msg.guild.members.cache.filter(
    (m) =>
      confusables.remove(m.user.username.toLowerCase()) ===
      confusables.remove(usernameToFind.toLowerCase()),
  );

  if (!members.size) {
    msg.client.ch.error(msg, msg.lan.noUsernameFound);
    return null;
  }

  return members.map((m) => m.user.id);
};
