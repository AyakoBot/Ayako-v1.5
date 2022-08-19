const Builders = require('@discordjs/builders');

module.exports = {
  async execute(data) {
    if (!data.guild) return;
    const { client } = data;
    const { ch } = client;
    const Constants = client.constants;
    const { guild } = data;
    const logChannels = client.logChannels.get(guild.id)?.webhookevents;
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
        const webhooks = await data.fetchWebhooks().catch(() => {});
        const audits = [];
        let auditsDelete;
        if (guild.members.me.permissions.has(128n)) {
          const auditsCreate = await guild.fetchAuditLogs({ limit: 3, type: 50 });
          const auditsUpdate = await guild.fetchAuditLogs({ limit: 3, type: 51 });
          auditsDelete = await guild.fetchAuditLogs({ limit: 3, type: 52 });
          if (auditsCreate && auditsCreate.entries) {
            auditsCreate.entries.forEach((a) => audits.push(a));
          }
          if (auditsUpdate && auditsUpdate.entries) {
            auditsUpdate.entries.forEach((a) => audits.push(a));
          }
        }
        let entry;
        let webhook;
        let files = [];

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
          if (auditsDelete) {
            if (
              (!entry || ch.getUnix(entry.id) < ch.getUnix(auditsDelete.entries.first().id)) &&
              !webhook
            ) {
              entry = auditsDelete.entries.first();
            }
          }
          const embed = new Builders.UnsafeEmbedBuilder();
          if (entry.actionType === 'CREATE') {
            const lan = language.webhookCreate;
            const con = Constants.webhookCreate;
            embed.setColor(con.color);
            embed.setAuthor({
              name: lan.author.name,
              iconURL: con.author.image,
            });
            if (webhook.avatar) embed.setThumbnail(webhook.avatarURL(webhook));
            if (webhook.name) embed.addFields({ name: language.name, value: webhook.name });
            if (webhook.type) {
              embed.addFields({
                name: language.type,
                value: webhook.type === 'Incoming' ? language.incoming : language.channelFollower,
              });
            }
            if (entry.reason) embed.addFields({ name: language.reason, value: entry.reason });
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

            const promises = [];
            [...entry.changes.entries()].forEach((change) => {
              for (let i = 1; i < change.length; i += 1) {
                const { key } = change[i];
                const before = change[i].old;
                const after = change[i].new;

                if (key === 'name') {
                  embed.addFields({
                    name: language.name,
                    value: `${language.before}: \`${before}\`\n${language.after}: \`${after}\``,
                  });
                  changedKey.push(language.name);
                }

                if (key === 'channel_id') {
                  const oldChannel = client.channels.cache.get(before);
                  const newChannel = client.channels.cache.get(after);
                  embed.addFields({
                    name: language.channel,
                    value: `${language.before}: ${
                      oldChannel
                        ? `${oldChannel} / \`${oldChannel.name}\` / \`${oldChannel.id}\``
                        : `${language.unknown} / \`${language.unknown}\` / \`${before}\``
                    }\n${language.after}: ${
                      newChannel
                        ? `${newChannel} / \`${newChannel.name}\` / \`${newChannel.id}\``
                        : `${language.unknown} / \`${language.unknown}\` / \`${after}\``
                    }`,
                  });
                  changedKey.push(language.channel);
                }

                if (key === 'avatar_hash') {
                  promises.push(getBuffer(ch, webhook, embed, language, lan, files));
                }
              }
            });
            files = await Promise.all(promises);

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
                if (key === 'name') embed.addFields({ name: language.name, value: before });
                if (key === 'type') {
                  let type;
                  if (before === 1) type = language.channelFollower;
                  if (before === 0) type = language.incoming;
                  embed.addFields({ name: language.type, value: type });
                }
              }
            });
            if (entry.reason) embed.addFields({ name: language.reason, value: entry.reason });
            embed.setDescription(ch.stp(lan.description, { user: entry.executor, channel: data }));
          }
          if (embed.description) ch.send(channels, { embebs: [embed], files }, 5000);
        }
      }
    }
  },
};

const getBuffer = async (ch, webhook, embed, language, lan, files) => {
  const buffers = await ch.convertImageURLtoBuffer([webhook.avatarURL()]);
  if (buffers.length) {
    embed.setThumbnail(`attachment://${buffers[0].name}`);
    embed.addFields({ name: language.avatar, value: lan.avatar });
    files = buffers;
  }
  return files;
};
