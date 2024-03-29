const Builders = require('@discordjs/builders');

module.exports = {
  async execute(channel) {
    const { guild } = channel;
    const { client } = channel;
    const { ch } = client;
    const Constants = client.constants;
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
        const lan = language.channelDelete;
        const con = Constants.channelDelete;

        let entry;
        if (guild.members.me.permissions.has(128n)) {
          let audit = await guild.fetchAuditLogs({ limit: 5, type: 12 }).catch(() => {});
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
          ch.send(channels, { embeds: [embed] }, 5000);
        } else {
          const embed = new Builders.UnsafeEmbedBuilder()
            .setAuthor({
              name: con.author.title,
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
