const Discord = require('discord.js');

module.exports = {
  async execute(channel) {
    const { guild } = channel;
    const { client } = channel;
    const { ch } = client;
    const Constants = client.constants;
    const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
    if (res && res.rowCount > 0) {
      const channels = res.rows[0].channelevents
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
        let audit = await guild.fetchAuditLogs({ limit: 5, type: 12 }).catch(() => {});
        let entry;
        if (audit && audit.entries) {
          audit = audit.entries.filter((e) => e.target.id === channel.id);
          entry = audit.sort((a, b) => b.id - a.id);
          entry = entry.first();
        }
        if (entry && entry.id) {
          const embed = new Discord.MessageEmbed()
            .setAuthor(
              ch.stp(lan.author.title, { type: language.channels[channel.type] }),
              con.author.image,
            )
            .setDescription(
              ch.stp(lan.description.withUser, {
                user: entry.executor,
                channel,
                type: language.channels[channel.type],
              }),
            )
            .setColor(con.color)
            .setTimestamp();
          ch.send(channels, { embeds: [embed] });
        } else {
          const embed = new Discord.MessageEmbed()
            .setAuthor({
              name: con.author.title,
              iconURL: con.author.image,
            })
            .setDescription(lan.description.withoutUser, {
              channel,
              type: language.channels[channel.type],
            })
            .setColor(con.color)
            .setTimestamp();
          ch.send(channels, { embeds: [embed] });
        }
      }
    }
  },
};
