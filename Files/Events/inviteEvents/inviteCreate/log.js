const Builders = require('@discordjs/builders');

const moment = require('moment');
require('moment-duration-format');

module.exports = {
  async execute(invite) {
    const { client } = invite;
    const { ch } = client;
    const Constants = client.constants;
    const { guild } = invite;
    client.invites.set(guild.id, invite);
    const logChannels = client.logChannels.get(invite.guild.id)?.inviteevents;
    if (logChannels?.length) {
      const channels = logChannels
        ?.map((id) =>
          typeof client.channels.cache.get(id)?.send === 'function'
            ? client.channels.cache.get(id)
            : null,
        )
        .filter((c) => c !== null);
      if (channels && channels.length) {
        const language = await ch.languageSelector(guild);
        const lan = language.inviteCreate;
        const con = Constants.inviteCreate;
        let entry;
        if (guild.members.me.permissions.has(128n)) {
          const audits = await invite.guild.fetchAuditLogs({ limit: 10, type: 40 });
          if (audits && audits.entries) {
            const audit = audits.entries.filter((a) => a.target && a.target.code === invite.code);
            entry = audit.sort((a, b) => b.id - a.id);
            entry = entry.first();
          }
        }
        let link = invite.url;
        if (invite.inviter) link = ch.stp(con.author.link, { user: invite.inviter });
        const embed = new Builders.UnsafeEmbedBuilder()
          .setAuthor({
            name: lan.author.name,
            iconURL: con.author.image,
            url: link,
          })
          .setColor(con.color)
          .setTimestamp();
        if (entry) {
          embed.setDescription(ch.stp(lan.description, { user: entry.executor }));
          if (entry.reason) embed.addFields({ name: language.reason, value: entry.reason });
        } else if (invite.inviter) {
          embed.setDescription(ch.stp(lan.description, { user: invite.inviter }));
        } else embed.setDescription(lan.descriptionNoUser);
        if (invite.channel) {
          embed.addFields({
            name: lan.channel,
            value: `${invite.channel} / \`${invite.channel.name}\` / \`${invite.channel.id}\``,
            inline: false,
          });
        }
        if (invite.expiresTimestamp) {
          embed.addFields({
            name: lan.expires,
            value: `<t:${String(invite.expiresTimestamp).slice(0, -3)}> (<t:${String(
              invite.expiresTimestamp,
            ).slice(0, -3)}:R>) \n(\`${ch.stp(language.time.timeIn, {
              time: moment
                .duration(Math.abs(Date.now() - invite.expiresTimestamp))
                .format(
                  `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                ),
            })}\`)`,
            inline: false,
          });
        }
        if (invite.maxAge) {
          embed.addFields({
            name: lan.age,
            value: moment
              .duration(invite.maxAge * 1000)
              .format(
                `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
              ),
            inline: true,
          });
        }
        if (invite.maxUses) {
          embed.addFields({ name: lan.uses, value: `\u200B${invite.maxUses}`, inline: true });
        }
        if (invite.targetUser) {
          embed.addFields({
            name: lan.targetedUser,
            value: `${invite.targetUser} / \`${invite.targetUser.username}\` / \`${invite.targetUser.id}\``,
            inline: true,
          });
        }
        if (invite.url) embed.addFields({ name: lan.url, value: `${invite.url}`, inline: true });
        ch.send(channels, { embeds: [embed] }, 5000);
      }
    }
  },
};
