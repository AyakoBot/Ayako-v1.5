const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  async execute(invite) {
    const { client } = invite;
    const { ch } = client;
    const Constants = client.constants;
    const { guild } = invite;
    client.invites.set(guild.id, await client.ch.getErisInvites(guild));
    const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
    if (res && res.rowCount > 0) {
      const channels = res.rows[0].inviteevents
        ?.map((id) =>
          typeof client.channels.cache.get(id)?.send === 'function'
            ? client.channels.cache.get(id)
            : null,
        )
        .filter((c) => c !== null);
      if (channels && channels.length) {
        const language = await ch.languageSelector(guild);
        const lan = language.inviteDelete;
        const con = Constants.inviteDelete;
        const audits = await invite.guild.fetchAuditLogs({ limit: 10, type: 42 });
        let entry;
        if (audits && audits.entries) {
          entry = audits.entries.sort((a, b) => b.id - a.id);
          entry = entry.first();
        }
        let link = invite.url;
        if (invite.inviter) link = ch.stp(con.author.link, { user: invite.inviter });
        const embed = new Discord.MessageEmbed()
          .setAuthor({
            name: lan.author.name,
            iconURL: con.author.image,
            url: link,
          })
          .setColor(con.color)
          .setTimestamp();
        if (entry) {
          embed.setDescription(ch.stp(lan.description, { user: entry.executor }));
          if (entry.reason) embed.addField(language.reason, entry.reason);
        } else if (invite.inviter)
          embed.setDescription(ch.stp(lan.description, { user: invite.inviter }));
        else embed.setDescription(lan.descriptionNoUser);
        if (invite.channel)
          embed.addField(
            lan.channel,
            `${invite.channel} / \`${invite.channel.name}\` / \`${invite.channel.id}\``,
            false,
          );
        if (invite.expiresTimestamp)
          embed.addField(
            lan.expires,
            `\`${new Date(invite.expiresTimestamp).toUTCString()}\`\n(\`${ch.stp(
              language.time.timeIn,
              {
                time: moment
                  .duration(invite.expiresTimestamp - Date.now())
                  .format(
                    `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                  ),
              },
            )}\`)`,
            false,
          );
        if (invite.maxAge)
          embed.addField(
            lan.age,
            moment
              .duration(invite.maxAge * 1000)
              .format(
                `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
              ),
            true,
          );
        if (invite.maxUses) embed.addField(lan.uses, invite.maxUses, true);
        if (invite.targetUser)
          embed.addField(
            lan.targetedUser,
            `${invite.targetUser} / \`${invite.targetUser.username}\` / \`${invite.targetUser.id}\``,
            true,
          );
        if (invite.url) embed.addField(lan.url, `${invite.url}`, true);
        if (invite.uses) embed.addField(lan.used, invite.uses, true);
        if (invite.createdTimestamp)
          embed.addField(
            lan.expires,
            `\`${new Date(invite.createdTimestamp).toUTCString()}\`\n(\`${ch.stp(
              language.time.timeIn,
              {
                time: moment
                  .duration(invite.createdTimestamp - Date.now())
                  .format(
                    `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                  ),
              },
            )}\`)`,
            false,
          );
        ch.send(channels, { embeds: [embed] });
      }
    }
  },
};
