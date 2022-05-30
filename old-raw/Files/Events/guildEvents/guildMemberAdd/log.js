const Builders = require('@discordjs/builders');

const moment = require('moment');
require('moment-duration-format');

module.exports = async (member) => {
  const res = await member.client.ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [
    member.guild.id,
  ]);
  if (res && res.rowCount > 0) {
    const channels = res.rows[0].guildmemberevents
      ?.map((id) =>
        typeof member.client.channels.cache.get(id)?.send === 'function'
          ? member.client.channels.cache.get(id)
          : null,
      )
      .filter((c) => c !== null);

    if (channels && channels.length) {
      const language = await member.client.ch.languageSelector(member.guild);
      const lan = language.guildMemberAddLog;
      const con = member.client.constants.guildMemberAddLog;
      const embed = new Builders.UnsafeEmbedBuilder()
        .setTimestamp()
        .addFields({
          name: language.createdAt,
          value: `<t:${`${member.user.createdTimestamp}`.slice(
            0,
            -3,
          )}> <t:${`${member.user.createdTimestamp}`.slice(0, -3)}:R>\n(\`${member.client.ch.stp(
            language.time.timeAgo,
            {
              time: moment
                .duration(Date.now() - member.user.createdTimestamp)
                .format(
                  `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                ),
            },
          )}\`)`,
        })
        .setColor(con.color);

      if (member.user.bot) {
        let entry;
        if (member.guild.members.me.permissions.has(128n)) {
          const audits = await member.guild.fetchAuditLogs({ limit: 3, type: 28 });
          if (audits && audits.entries) {
            const audit = audits.entries.filter((a) => a.target.id === member.user.id);
            entry = audit.sort((a, b) => b.id - a.id);
            entry = entry.first();
          }
        }
        embed.setAuthor({
          name: lan.author.titleBot,
          iconURL: con.author.image,
          url: member.client.ch.stp(con.author.link, { user: member.user }),
        });
        embed.setThumbnail(member.user.displayAvatarURL({ size: 4096 }));
        if (entry) {
          embed.setDescription(
            member.client.ch.stp(lan.descriptionBot, { user: entry.executor, bot: member.user }),
          );
        } else {
          embed.setDescription(
            member.client.ch.stp(lan.descriptionBotNoAudit, { bot: member.user }),
          );
        }
      } else {
        embed.setAuthor({
          name: lan.author.titleUser,
          iconURL: con.author.image,
          url: member.client.ch.stp(con.author.link, { user: member.user }),
        });
        embed.setThumbnail(member.user.displayAvatarURL({ size: 4096 }));
        embed.setDescription(member.client.ch.stp(lan.descriptionUser, { user: member.user }));
      }
      member.client.ch.send(channels, { embeds: [embed] }, 5000);
    }
  }
};
