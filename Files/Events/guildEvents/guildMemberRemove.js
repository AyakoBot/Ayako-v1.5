const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  async execute(member) {
    const { client } = member;
    const { user } = member;
    const { guild } = member;
    const { ch } = client;
    const Constants = client.constants;
    const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
    if (res && res.rowCount > 0) {
      const channels = res.rows[0].guildmemberevents
        ?.map((id) =>
          typeof client.channels.cache.get(id)?.send === 'function'
            ? client.channels.cache.get(id)
            : null,
        )
        .filter((c) => c !== null);
      if (channels && channels.length) {
        const language = await ch.languageSelector(guild);
        const lan = language.guildMemberRemove;
        const con = Constants.guildMemberRemove;
        let audit = await guild.fetchAuditLogs({ limit: 5, type: 20 }).catch(() => {});
        let entry;
        if (audit && audit.entries) {
          audit = audit.entries.filter((e) => e.target.id === user.id);
          entry = audit.sort((a, b) => b.id - a.id);
          entry = entry.first();
        }
        const embed = new Discord.MessageEmbed()
          .setColor(con.color)
          .setThumbnail(ch.displayAvatarURL(user))
          .setTimestamp();
        const roles = member.roles.cache.sort((a, b) => b.position - a.position);
        const letters = 27 * roles.size;
        const maxFieldSize = 1024;
        if (roles.size > 0) {
          if (letters > maxFieldSize) {
            const chunks = chunker(roles, 37);
            for (let i = 0; i < chunks.length; i += 1) {
              if (i === 0) embed.addField(language.roles, chunks[i]);
              else embed.addField('\u200b', chunks[i]);
            }
          } else embed.addField(language.roles, roles.map((r) => `${r}`).join(' | '));
        }
        if (entry && entry.id && +ch.getUnix(entry.id) > Date.now() - 1000) {
          embed
            .setDescription(
              ch.stp(lan.descriptionKicked, { user: entry.executor, target: entry.target }),
            )
            .setAuthor(
              lan.author.nameKick,
              con.author.kickImage,
              ch.stp(con.author.link, { user }),
            );
        } else {
          embed
            .setDescription(ch.stp(lan.descriptionLeft, { user }))
            .setAuthor(
              lan.author.nameLeave,
              con.author.leaveImage,
              ch.stp(con.author.link, { user }),
            );
        }
        embed.addField(
          language.joinedAt,
          `\`${new Date(member.joinedTimestamp).toUTCString()}\`\n(\`${ch.stp(
            language.time.timeAgo,
            {
              time: moment
                .duration(Date.now() - member.joinedTimestamp)
                .format(
                  `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                ),
            },
          )}\`)`,
        );
        ch.send(channels, embed);
      }
    }
  },
};

function chunker(arr, len) {
  let chunks = [];
  let i = 0;
  while (i < arr.length) chunks.push(arr.slice(i, (i += len)));
  chunks = chunks.map((o) => o);
  return chunks;
}
