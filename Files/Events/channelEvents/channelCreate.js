const Builders = require('@discordjs/builders');

module.exports = {
  async execute(channel) {
    if (channel.type === 1 || channel.type === 3) return;
    const { client } = channel;
    const { ch } = client;
    const Constants = client.constants;
    const { guild } = channel;
    const logChannels = client.logChannels.get(guild.id)?.channelevents;
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
        const lan = language.channelCreate;
        const con = Constants.channelCreate;

        let entry;
        if (guild.members.me.permissions.has(128n)) {
          let audit = await guild.fetchAuditLogs({ limit: 5, type: 10 }).catch(() => {});
          if (audit && audit.entries) {
            audit = audit.entries.filter((e) => e.target.id === channel.id);
            entry = audit.sort((a, b) => b.id - a.id);
            entry = entry.first();
          }
        }

        if (entry && entry.id) {
          const embed = new Builders.UnsafeEmbedBuilder()
            .setAuthor({
              name: ch.stp(lan.author.title, { type: language.channelTypes[channel.type] }),
              iconURL: con.author.image,
              url: ch.stp(con.author.link, { channel }),
            })
            .setDescription(
              ch.stp(lan.description.withUser, {
                user: entry.executor,
                channel,
                type: language.channelTypes[channel.type],
              }),
            )
            .setColor(con.color)
            .setTimestamp();
          channel.permissionOverwrites = channel.permissionOverwrites.cache.map((o) => o);
          for (let i = 0; channel.permissionOverwrites.length > i; i += 1) {
            const perm = channel.permissionOverwrites[i];
            let enable;
            let disable;
            if (perm.type === 'member') {
              disable = `<@${perm.id}>`;
              enable = `<@${perm.id}>`;
            } else if (perm.type === 'role') {
              disable = `<@&${perm.id}>`;
              enable = `<@&${perm.id}>`;
            } else {
              disable = `${language.unknown} ${perm}`;
              enable = `${language.unknown} ${perm}`;
            }
            for (let j = 0; perm.deny.toArray().length > j; j += 1) {
              disable += `${client.textEmotes.disable} \`${
                language.permissions[perm.deny.toArray()[j]]
              }\`\n`;
            }
            for (let j = 0; perm.allow.toArray().length > j; j += 1) {
              enable += `${client.textEmotes.enable} \`${
                language.permissions[perm.allow.toArray()[j]]
              }\`\n`;
            }
            if (disable.includes('`')) {
              embed.addFields({
                name: `${language.permissions.deniedPermissionsFor} ${
                  perm.type === 'member' ? language.member : language.role
                }`,
                value: disable,
              });
            }
            if (enable.includes('`')) {
              embed.addFields({
                name: `${language.permissions.grantedPermissionFor} ${
                  perm.type === 'member' ? language.member : language.role
                }`,
                value: enable,
              });
            }
          }
          for (let i = 0; entry.changes.length > i; i += 1) {
            let before = entry.changes[i].old;
            let after = entry.changes[i].new;
            if (before === undefined) before = language.none;
            if (after === undefined) after = language.none;
            if (entry.changes[i].key === 'type') {
              if (entry.changes[i].old === 0) entry.changes[i].old = language.channelTypes.text;
              else if (entry.changes[i].old === 2) {
                entry.changes[i].old = language.channelTypes.voice;
              } else if (entry.changes[i].old === 5) {
                entry.changes[i].old = language.channelTypes.news;
              } else entry.changes[i].old = language.unknown;
              if (entry.changes[i].new === 0) entry.changes[i].new = language.channelTypes.text;
              else if (entry.changes[i].new === 2) {
                entry.changes[i].new = language.channelTypes.voice;
              } else if (entry.changes[i].new === 5) {
                entry.changes[i].new = language.channelTypes.news;
              } else entry.changes[i].new = language.unknown;
            }
            if (Array.isArray(before)) {
              before = before.map((e) => `${e}\n`);
            }
            if (Array.isArray(after)) {
              after = after.map((e) => `${e}\n`);
            }
            if (entry.changes[i].key !== 'permission_overwrites') {
              embed.addFields({
                name: `${language[entry.changes[i].key.toLowerCase()]}\u200b`,
                value: `${language.before}: \`${before}\`\n${language.after}: \`${after}\``,
              });
            }
          }
          ch.send(channels, { embeds: [embed] }, 5000);
        } else {
          const embed = new Builders.UnsafeEmbedBuilder()
            .setAuthor({
              name: con.author.title,
              url: ch.stp(con.author.link, { channel }),
              iconURL: con.author.image,
            })
            .setDescription(lan.description.withoutUser, {
              channel,
              type: language.channelTypes[channel.type],
            })
            .setColor(con.color)
            .setTimestamp();
          ch.send(channels, { embeds: [embed] }, 5000);
        }
      }
    }
  },
};
