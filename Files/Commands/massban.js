const Discord = require('discord.js');

module.exports = {
  name: 'massban',
  perm: 4n,
  dm: false,
  takesFirstArg: true,
  aliases: null,
  type: 'mod',
  async execute(msg) {
    // eslint-disable-next-line global-require,import/no-unresolved
    const args = msg.args[0] === 'ids' ? require('../ids.json').ids : msg.args;
    if (msg.args[0] === 'ids' && !args[0]) return msg.client.ch.reply(msg, msg.lan.noRaidIDs);
    const users = [];
    const failed = [];
    const reason = [];

    await msg.guild.members.fetch().catch(() => {});

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
    else {
      reason.forEach((word) => {
        banreason += ` ${word}`;
      });
    }

    const con = msg.client.constants.commands.massban;
    const uniqueUsers = users.filter((item, pos, self) => self.indexOf(item) === pos);
    const uniqueFails = failed.filter((item, pos, self) => self.indexOf(item) === pos);
    const descS = [];
    const descF = [];

    if (uniqueUsers.length !== 0) {
      const replyEmbed = new Discord.MessageEmbed()
        .setColor(con.success)
        .setDescription(msg.lan.descS)
        .setAuthor({
          name: msg.lan.descSLoading,
          iconURL: msg.client.constants.emotes.loadingLink,
          url: msg.client.constants.standard.invite,
        })
        .setTimestamp();
      const m = await msg.client.ch.reply(msg, { embeds: [replyEmbed] });
      uniqueUsers.forEach(async (user, i) => {
        const ban = await msg.guild.bans
          .create(user, {
            days: 1,
            reason: msg.client.ch.stp(msg.lan.banReason, { user: msg.author, reason: banreason }),
          })
          .catch(() => {
            uniqueUsers.splice(i, 1);
            uniqueFails.push(`${user.id ? user.id : user} ${msg.lan.ohno}`);
          });
        if (ban) {
          descS.push(`<@${user.id ? user.id : user}>`);
          if (`${descS}`.length > 2048)
            replyEmbed.setDescription(
              msg.client.ch.stp(msg.lan.sBannedUsers, { amount: descS.length }),
            );
          else replyEmbed.setDescription(`\u200b${descS.join(' ')}`);
        }
      });
      const editIntervalS = setInterval(async () => {
        if (descS.length !== uniqueUsers.length) await m.edit({ embeds: [replyEmbed] });
      }, 5000);
      const intervalS = setInterval(async () => {
        if (descS.length === uniqueUsers.length) {
          if (`${descS}`.length > 2048)
            replyEmbed.setDescription(
              msg.client.ch.stp(msg.lan.sBannedUsers, { amount: descS.length }),
            );
          else replyEmbed.setDescription(`\u200b${descS.join(' ')}`);
          replyEmbed.setAuthor({
            name: msg.lan.finish,
            iconURL: msg.client.constants.emotes.tickLink,
            url: msg.client.constants.standard.invite,
          });
          clearInterval(intervalS);
          clearInterval(editIntervalS);
          setTimeout(() => {
            clearInterval(interval);
          }, 3600000);
          setTimeout(() => {
            if (!descS.length) m.delete();
            else m.edit({ embeds: [replyEmbed] });
          }, 2000);
        }
      }, 1000);
    }

    if (uniqueFails.length !== 0) {
      const replyEmbed = new Discord.MessageEmbed()
        .setColor(con.fail)
        .setDescription(msg.lan.descF)
        .setAuthor({
          name: msg.lan.descFLoading,
          iconURL: msg.client.constants.emotes.loadingLink,
          url: msg.client.constants.standard.invite,
        })
        .setTimestamp();
      const m = await msg.client.ch.reply(msg, { embeds: [replyEmbed] });

      uniqueFails.forEach(async (fail) => {
        descF.push(`${fail}\n`);
        if (`${descF}`.length > 2048)
          replyEmbed.setDescription(
            msg.client.ch.stp(msg.lan.fBannedUsers, { amount: descF.length }),
          );
        else replyEmbed.setDescription(`\u200b${descF.join('')}`);
      });

      const editintervalF = setInterval(async () => {
        if (descF.length !== uniqueFails.length) await m.edit({ embeds: [replyEmbed] });
      }, 5000);

      const intervalF = setInterval(async () => {
        if (descF.length === uniqueFails.length) {
          if (`${descF}`.length > 2048)
            replyEmbed.setDescription(
              msg.client.ch.stp(msg.lan.fBannedUsers, { amount: descF.length }),
            );
          else replyEmbed.setDescription(`\u200b${descF.join('')}`);
          replyEmbed.setAuthor({
            name: msg.lan.failed,
            iconURL: msg.client.constants.emotes.crossLink,
            url: msg.client.constants.standard.invite,
          });

          clearInterval(intervalF);
          setTimeout(() => {
            clearInterval(interval);
          }, 3600000);

          clearInterval(editintervalF);
          setTimeout(() => {
            if (!descF.length) m.delete();
            else m.edit({ embeds: [replyEmbed] });
          }, 2000);
        }
      }, 1000);
    }

    const interval = setInterval(async () => {
      if (uniqueUsers.length === descS.length && uniqueFails.length === descF.length) {
        const logembed = new Discord.MessageEmbed()
          .setAuthor({
            name: msg.client.ch.stp(msg.lan.log.author, {
              user: msg.author,
              amount: uniqueUsers.length,
            }),
          })
          .setDescription(msg.client.ch.stp(msg.lan.log.desc, { amount: uniqueUsers.length }))
          .addField(msg.language.reason, banreason)
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
        clearInterval(interval);
      }
    }, 1000);
    return null;
  },
};
