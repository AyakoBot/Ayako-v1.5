const Builders = require('@discordjs/builders');

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
        let entry;
        if (guild.me.permissions.has(128n)) {
          let audit = await guild.fetchAuditLogs({ limit: 5, type: 20 }).catch(() => {});
          if (audit && audit.entries) {
            audit = audit.entries.filter((e) => e.target.id === user.id);
            entry = audit.sort((a, b) => b.id - a.id);
            entry = entry.first();
          }
        }
        const embed = new Builders.UnsafeEmbedBuilder()
          .setColor(con.color)
          .setThumbnail(user.displayAvatarURL({ size: 4096 }));
        const roles = member.roles.cache.sort((a, b) => b.position - a.position);
        const letters = 27 * roles.size;
        const maxFieldSize = 1024;
        if (roles.size > 0) {
          if (letters > maxFieldSize) {
            const chunks = chunker(roles, 37);
            for (let i = 0; i < chunks.length; i += 1) {
              if (i === 0) embed.addFields({ name: language.roles, value: chunks[i] });
              else embed.addFields({ name: '\u200b', value: chunks[i] });
            }
          } else {
            embed.addFields({
              name: language.roles,
              value: roles.map((r) => `${r}`).join(' | '),
              inline: false,
            });
          }
        }
        if (entry && entry.id && +ch.getUnix(entry.id) > Date.now() - 1000) {
          embed
            .setDescription(
              ch.stp(lan.descriptionKicked, { user: entry.executor, target: entry.target }),
            )
            .setAuthor({
              name: lan.author.nameKick,
              iconURL: con.author.kickImage,
              url: ch.stp(con.author.link, { user }),
            });
        } else {
          embed.setDescription(ch.stp(lan.descriptionLeft, { user })).setAuthor({
            name: lan.author.nameLeave,
            iconURL: con.author.leaveImage,
            url: ch.stp(con.author.link, { user }),
          });
        }

        if (member.joinedTimestamp) {
          embed.addFields({
            name: language.joinedAt,
            value: `<t:${`${member.joinedTimestamp}`.slice(
              0,
              -3,
            )}> <t:${`${member.joinedTimestamp}`.slice(0, -3)}:R>\n(\`${ch.stp(
              language.time.timeAgo,
              {
                time: moment
                  .duration(Math.abs(Date.now() - member.joinedTimestamp))
                  .format(
                    `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                  ),
              },
            )}\`)`,
          });
        }
        ch.send(channels, { embeds: [embed] }, 5000);
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
