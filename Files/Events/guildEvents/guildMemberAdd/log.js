const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  async execute(member, user) {
    const { client } = user;
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
        const lan = language.guildMemberAddLog;
        const con = Constants.guildMemberAddLog;
        const embed = new Discord.UnsafeEmbed()
          .setTimestamp()
          .addFields({
            name: language.createdAt,
            value: `<t:${`${user.createdTimestamp}`.slice(
              0,
              -3,
            )}> <t:${`${user.createdTimestamp}`.slice(0, -3)}:R>\n(\`${ch.stp(
              language.time.timeAgo,
              {
                time: moment
                  .duration(Date.now() - user.createdTimestamp)
                  .format(
                    `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                  ),
              },
            )}\`)`,
          })
          .setColor(con.color);
        const cachedInvites = client.invites.get(guild.id);

        if (user.bot) {
          const audits = await guild.fetchAuditLogs({ limit: 3, type: 28 });
          let entry;
          if (audits && audits.entries) {
            const audit = audits.entries.filter((a) => a.target.id === user.id);
            entry = audit.sort((a, b) => b.id - a.id);
            entry = entry.first();
          }
          embed.setAuthor({
            name: lan.author.titleBot,
            iconURL: con.author.image,
            url: ch.stp(con.author.link, { user }),
          });
          embed.setThumbnail(user.displayAvatarURL({ size: 4096 }));
          if (entry) {
            embed.setDescription(ch.stp(lan.descriptionBot, { user: entry.executor, bot: user }));
          } else embed.setDescription(ch.stp(lan.descriptionBotNoAudit, { bot: user }));
        } else {
          const newInvites = await client.ch.getErisInvites(guild);

          let usedInvite;
          if (cachedInvites && newInvites) {
            usedInvite = newInvites.find((inv) => cachedInvites.get(inv?.code).uses < inv.uses);
          }
          client.invites.set(guild.id, newInvites);

          embed.setAuthor({
            name: lan.author.titleUser,
            iconURL: con.author.image,
            url: ch.stp(con.author.link, { user }),
          });
          embed.setThumbnail(member.user.displayAvatarURL({ size: 4096 }));
          embed.setDescription(ch.stp(lan.descriptionUser, { user }));
          if (usedInvite) {
            if (usedInvite.uses) {
              embed.addFields({
                name: lan.inviteInfoTitle,
                value: ch.stp(lan.inviteInfoUses, {
                  invite: usedInvite,
                  inviter: usedInvite.inviter?.tag
                    ? usedInvite.inviter
                    : { tag: language.unknown, id: usedInvite.inviter?.id || usedInvite.inviter },
                  mention:
                    guild.id === (usedInvite.inviter?.id || usedInvite.inviter)
                      ? `${usedInvite.inviter}`
                      : usedInvite.inviter?.username,
                }),
              });
            } else {
              embed.addFields({
                name: lan.inviteInfoTitle,
                value: ch.stp(lan.inviteInfo, { invite: usedInvite }),
              });
            }
          }
        }
        ch.send(channels, { embeds: [embed] });
      }
    }
  },
};
