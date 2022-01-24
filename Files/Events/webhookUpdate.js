const Discord = require('discord.js');

module.exports = {
  async execute(data) {
    if (!data.guild) return;
    const { client } = data;
    const { ch } = client;
    const Constants = client.constants;
    const { guild } = data;
    const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
    if (res && res.rowCount > 0) {
      const channels = res.rows[0].webhookevents
        ?.map((id) =>
          typeof client.channels.cache.get(id)?.send === 'function'
            ? client.channels.cache.get(id)
            : null,
        )
        .filter((c) => c !== null);
      if (channels && channels.length) {
        const language = await ch.languageSelector(guild);
        const webhooks = await data.fetchWebhooks().catch(() => {});
        const audits = [];
        const auditsCreate = await guild.fetchAuditLogs({ limit: 3, type: 50 });
        const auditsUpdate = await guild.fetchAuditLogs({ limit: 3, type: 51 });
        const auditsDelete = await guild.fetchAuditLogs({ limit: 3, type: 52 });
        if (auditsCreate && auditsCreate.entries)
          auditsCreate.entries.forEach((a) => audits.push(a));
        if (auditsUpdate && auditsUpdate.entries)
          auditsUpdate.entries.forEach((a) => audits.push(a));
        let entry;
        let webhook;
        if (audits.length) {
          audits.sort((a, b) => a.id - b.id);
          webhooks.forEach((w) =>
            audits.forEach((a) => {
              if (w.id === a.target.id) {
                entry = a;
                webhook = w;
              }
            }),
          );
          if (auditsDelete) auditsDelete.entries.sort((a, b) => b.id - a.id);
          if (auditsDelete)
            if (
              (!entry || ch.getUnix(entry.id) < ch.getUnix(auditsDelete.entries.first().id)) &&
              !webhook
            )
              entry = auditsDelete.entries.first();
          const embed = new Discord.MessageEmbed();
          if (entry.actionType === 'CREATE') {
            const lan = language.webhookCreate;
            const con = Constants.webhookCreate;
            embed.setColor(con.color);
            embed.setAuthor({
              name: lan.author.name,
              iconURL: con.author.image,
            });
            if (webhook.avatar) embed.setThumbnail(ch.avatarURL(webhook));
            if (webhook.name) embed.addField(language.name, webhook.name);
            if (webhook.type)
              embed.addField(
                language.type,
                webhook.type === 'Incoming' ? language.incoming : language.channelFollower,
              );
            if (entry.reason) embed.addField(language.reason, entry.reason);
            embed.setDescription(
              ch.stp(lan.description, { user: entry.executor, channel: data, webhook }),
            );
          }
          if (entry.actionType === 'UPDATE') {
            const lan = language.webhookUpdate;
            const con = Constants.webhookUpdate;
            const changedKey = [];
            embed.setColor(con.color);
            embed.setAuthor({
              name: lan.author.name,
              iconURL: con.author.image,
            });

            const download = async () => {
              const [path] = await ch.downloader(webhook, [ch.avatarURL(webhook)], 'webhook');
              if (path) {
                const name = await ch.getName(path);
                embed.attachFiles([path]);
                embed.setThumbnail(`attachment://${name}`);
                embed.addField(language.avatar, lan.avatar);
              }
            };
            const promises = [];
            [...entry.changes.entries()].forEach((change) => {
              for (let i = 1; i < change.length; i += 1) {
                const { key } = change[i];
                const before = change[i].old;
                const after = change[i].new;
                if (key === 'name') {
                  embed.addField(
                    language.name,
                    `${language.before}: \`${before}\`\n${language.after}: \`${after}\``,
                  );
                  changedKey.push(language.name);
                }
                if (key === 'channel_id') {
                  const oldChannel = client.channels.cache.get(before);
                  const newChannel = client.channels.cache.get(after);
                  embed.addField(
                    language.channel,
                    `${language.before}: ${
                      oldChannel
                        ? `${oldChannel} / \`${oldChannel.name}\` / \`${oldChannel.id}\``
                        : `${language.unknown} / \`${language.unknown}\` / \`${before}\``
                    }\n${language.after}: ${
                      newChannel
                        ? `${newChannel} / \`${newChannel.name}\` / \`${newChannel.id}\``
                        : `${language.unknown} / \`${language.unknown}\` / \`${after}\``
                    }`,
                  );
                  changedKey.push(language.channel);
                }
                if (key === 'avatar_hash') {
                  webhook.wanted = 'avatar';
                  promises.push(download());
                }
              }
            });
            await Promise.all(promises);
            embed.setDescription(
              ch.stp(lan.description, { user: entry.executor, channel: data, webhook }) +
                changedKey.map((o) => ` \`${o}\``),
            );
          }
          if (entry.actionType === 'DELETE') {
            const lan = language.webhookDelete;
            const con = Constants.webhookDelete;
            embed.setColor(con.color);
            embed.setAuthor({
              name: lan.author.name,
              iconURL: con.author.image,
            });
            [...entry.changes.entries()].forEach((change) => {
              for (let i = 1; i < change.length; i += 1) {
                const { key } = change[i];
                const before = change[i].old;
                if (key === 'name') embed.addField(language.name, before);
                if (key === 'type') {
                  let type;
                  if (before === 1) type = language.channelFollower;
                  if (before === 0) type = language.incoming;
                  embed.addField(language.type, type);
                }
              }
            });
            if (entry.reason) embed.addField(language.reason, entry.reason);
            embed.setDescription(ch.stp(lan.description, { user: entry.executor, channel: data }));
          }
          if (embed.description) ch.send(channels, embed);
        }
      }
    }
  },
};
