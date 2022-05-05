const Builders = require('@discordjs/builders');

module.exports = {
  async execute(oldMember, newMember) {
    const client = oldMember ? oldMember.client : newMember.client;
    const { ch } = client;
    const Constants = client.constants;
    const member = newMember;
    const { user } = member;
    const { guild } = member;
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
        const con = Constants.guildMemberUpdate;
        const embed = new Builders.UnsafeEmbedBuilder().setTimestamp().setColor(con.color);
        if (oldMember && member.nickname !== oldMember.nickname) {
          const lan = language.guildMemberUpdateNickname;
          embed.setAuthor({
            name: lan.author.name,
            iconURL: con.author.image,
            url: ch.stp(con.author.link, { user }),
          });

          let entry;
          if (guild.members.cache.get(client.user.id).permissions.has(128n)) {
            const audit = await guild.fetchAuditLogs({ limit: 5, type: 24 });
            if (audit && audit.entries) {
              entry = audit.entries.filter((e) => e.target.id === user.id);
              entry = entry.sort((a, b) => b.id - a.id);
              entry = entry.first();
            }
          }

          if (entry) {
            if (entry.executor.id === user.id) {
              embed.setDescription(ch.stp(lan.descriptionNoUser, { user: entry.executor }));
            } else {
              embed.setDescription(
                ch.stp(lan.descriptionUser, { user: entry.executor, target: entry.target }),
              );
            }
          } else embed.setDescription(ch.stp(lan.descriptionNoAudit, { user }));
          embed.addFields({
            name: language.nickname,
            value: `${language.before}: \`${
              oldMember.nickname ? oldMember.nickname : user.username
            }\`\n${language.after}: \`${member.nickname ? member.nickname : user.username}\``,
          });
          ch.send(channels, { embeds: [embed] }, 5000);
          return;
        }
        if (
          oldMember &&
          oldMember.pending &&
          !member.pending &&
          guild.features.includes('COMMUNITY')
        ) {
          const lan = language.guildMemberUpdateVerify;
          embed.setAuthor({
            name: lan.author.name,
            iconURL: con.author.image,
            url: ch.stp(con.author.link, { user }),
          });
          embed.setDescription(ch.stp(lan.description, { user }));
          ch.send(channels, { embeds: [embed] }, 5000);
          return;
        }
        let entry;
        if (guild.members.cache.get(client.user.id).permissions.has(128n)) {
          const audit = await guild.fetchAuditLogs({ limit: 10, type: 25 }).catch(() => {});
          if (audit && audit.entries) {
            entry = audit.entries.filter((e) => e.target.id === user.id);
            entry = entry.first();
          }
        }
        if (entry) {
          if (Date.now() - (entry.id / 4194304 + 1420070400000) < 3000) {
            const added = [];
            const removed = [];
            if (entry.changes) {
              for (let i = 0; i < entry.changes.length; i += 1) {
                if (entry.changes[i].key === '$add') {
                  entry.changes[i].new.forEach((r) => added.push(r));
                }
                if (entry.changes[i].key === '$remove') {
                  entry.changes[i].new.forEach((r) => removed.push(r));
                }
              }
            }
            const lan = language.guildMemberUpdateRoles;
            if (entry.executor.id === entry.target.id) {
              embed.setDescription(ch.stp(lan.descriptionNoUser, { user: entry.executor }));
            } else {
              embed.setDescription(
                ch.stp(lan.descriptionUser, { user: entry.executor, target: entry.target }),
              );
            }
            embed.addFields({
              name: language.changes,
              value: `${added
                .map((role) => `<:Add:834262756013113354>  <@&${role.id}>`)
                .join('\n')}\n${removed
                .map(
                  (role, i) =>
                    `${
                      i === 0 && added.length !== 0 ? '\n' : ''
                    }\n<:Remove:834262790180306964>  <@&${role.id}>`,
                )
                .join('\n')}`,
            });
            embed.setAuthor({
              name: lan.author.name,
              iconURL: con.author.image,
              url: ch.stp(con.author.link, { user }),
            });
            ch.send(channels, { embeds: [embed] }, 5000);
          }
        }
      }
    }
  },
};
