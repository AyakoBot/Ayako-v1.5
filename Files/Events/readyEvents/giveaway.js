const Discord = require('discord.js');

module.exports = {
  async execute() {
    // eslint-disable-next-line global-require
    return;
    const client = require('../../BaseClient/DiscordClient');
    const { ch } = client;
    const Constants = client.constants;
    const res = await ch.query('SELECT * FROM giveawaysettings;');
    if (res && res.rowCount > 0) {
      res.rows.forEach(async (row) => {
        const r = row;
        const guild = client.guilds.cache.get(r.guildid);
        if (guild && guild.id) {
          const language = await ch.languageSelector(guild);
          const channel = client.channels.cache.get(r.channelid);
          if (channel && channel.id) {
            let description;
            if (r.requirement === 'role')
              description = ch.stp(language.ready.giveaway.description.role, {
                desc: r.description,
                role: guild.roles.cache.get(r.reqroleid),
              });
            else if (r.requirement === 'guild') {
              if (r.invitelink)
                description = ch.stp(language.ready.giveaway.description.guild.withInvite, {
                  desc: r.description,
                  servername: client.guilds.cache.get(r.reqserverid)
                    ? client.guilds.cache.get(r.reqserverid).name
                    : language.unknown,
                  invitelink: r.invitelink,
                });
              else
                description = ch.stp(language.ready.giveaway.description.guild.withInvite, {
                  desc: r.description,
                  servername: client.guilds.cache.get(r.reqserverid)
                    ? client.guilds.cache.get(r.reqserverid).name
                    : language.unknown,
                });
            } else description = r.description;
            const { winnercount } = r;
            const { endat } = r;
            const { ended } = r;
            const abort = false;
            const timeLeft = endat - Date.now();
            if (timeLeft <= 0 && ended === false)
              end(r, channel, guild, description, endat, language, winnercount, abort);
            else if (timeLeft > 0 && ended === false)
              /* cron this */ setTimeout(
                () => end(r, channel, guild, description, endat, language, winnercount, abort),
                timeLeft,
              );
          }
        }
      });
    }
    async function end(r, channel, guild, description, endat, language, winnercount, abort) {
      return;
      const msg = await channel.messages.fetch(r.messageid).catch(() => {});
      if (msg && msg.id) {
        const reaction = msg.reactions.cache.find((re) => re.emoji.name === '🎉');
        let users;
        if (reaction) {
          users = await reaction.users.fetch();
          users = users
            .filter((u) => u.bot === false)
            .filter(async (u) => guild.members.fetch(u.id));
          if (r.requirement) {
            if (r.requirement === 'role') {
              const role = guild.roles.cache.get(r.reqroleid);
              if (role && role.id)
                users = users.filter(async (u) =>
                  guild.members.cache.get(u.id).roles.cache.has(role.id),
                );
              else {
                const embed = new Discord.MessageEmbed()
                  .setDescription(description)
                  .setTimestamp(new Date(+endat).toUTCString())
                  .setColor(guild.me.displayHexColor)
                  .setAuthor(
                    language.ready.giveaway.name,
                    Constants.standard.image,
                    Constants.standard.link,
                  )
                  .setFooter(language.ready.giveaway.endedAt)
                  .addField(language.ready.giveaway.roleInaccessible, '\u200b');
                msg.edit(embed).catch(() => {});
                ch.query('UPDATE giveawaysettings SET ended = $1 WHERE messageid = $2;', [
                  true,
                  msg.id,
                ]);
                return;
              }
            }
            if (r.requirement === 'guild') {
              const reqGuild = client.guilds.cache.get(r.reqserverid);
              if (reqGuild && reqGuild.id)
                users = users.filter(async (u) => guild.members.fetch(u.id));
              else {
                const embed = new Discord.MessageEmbed()
                  .setDescription(description)
                  .setTimestamp(new Date(+endat).toUTCString())
                  .setColor(guild.me.displayHexColor)
                  .setAuthor(
                    language.ready.giveaway.name,
                    Constants.standard.image,
                    Constants.standard.link,
                  )
                  .setFooter(language.ready.giveaway.endedAt)
                  .addField(language.ready.giveaway.leftServer, '\u200b');
                msg.edit(embed).catch(() => {});
                ch.query('UPDATE giveawaysettings SET ended = $1 WHERE messageid = $2;', [
                  true,
                  msg.id,
                ]);
                return;
              }
            }
          }
          users = users
            .random(winnercount)
            .filter((u) => u)
            .map((u) => msg.guild.members.fetch(u.id));
        }
        if (abort === false) {
          const embed = new Discord.MessageEmbed()
            .setDescription(description)
            .setTimestamp(new Date(+endat).toUTCString())
            .setColor(guild.me.displayHexColor)
            .setAuthor(
              language.ready.giveaway.name,
              Constants.standard.image,
              Constants.standard.link,
            )
            .setFooter(language.ready.giveaway.endedAt);
          if (users && users.length) {
            embed.addField(
              language.ready.giveaway.winners,
              users.map((w) => `<@${w.id}>`).join(', '),
            );
            const winnerembed = new Discord.MessageEmbed()
              .setColor(guild.me.displayHexColor)
              .setDescription(description)
              .setFooter(language.ready.giveaway.endAt)
              .setTimestamp(new Date(+endat).toUTCString());
            ch.send(
              channel,
              ch.stp(language.ready.giveaway.congraz, { usermap: users.map((w) => `<@${w.id}>`) }),
              winnerembed,
            );
          } else embed.addField(language.ready.giveaway.noparticipants, '\u200b');
          msg.edit(embed).catch(() => {});
        }
        ch.query('UPDATE giveawaysettings SET ended = $1 WHERE messageid = $2;', [
          true,
          r.messageid,
        ]);
      }
    }
  },
};

/*
todo: switch to cron when lag starts

const cron = require('node-cron');
const task = cron.job('1-59 * * * * * *', () => {
	console.log('running a task every second');
	console.log(task);
	console.log(task.start());
	console.log(task.stop());
});
*/
