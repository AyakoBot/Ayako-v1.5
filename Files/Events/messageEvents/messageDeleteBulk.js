const Discord = require('discord.js');

module.exports = {
  async execute(msgs) {
    // eslint-disable-next-line global-require
    const client = require('../../BaseClient/DiscordClient');
    const { ch } = client;
    const Constants = client.constants;
    const { guild } = msgs.first();
    const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
    if (res && res.rowCount > 0) {
      const channels = res.rows[0].messageevents
        ?.map((id) =>
          typeof client.channels.cache.get(id)?.send === 'function'
            ? client.channels.cache.get(id)
            : null,
        )
        .filter((c) => c !== null);
      if (channels && channels.length) {
        const language = await ch.languageSelector(guild);
        const con = Constants.messageDeleteBulk;
        const lan = language.messageDeleteBulk;

        const arr = msgs.map(
          (msg) =>
            `${msg.author.tag} (${msg.author.id}) | ${msg.content}\n${msg.attachments.map(
              (attachment) =>
                `${attachment.description ? attachment.description : ''} ${attachment.url}\n`,
            )}`,
        );

        const path = await ch.txtFileWriter(msgs.first(), arr, 'messageDeleteBulk');
        let audits = await guild.fetchAuditLogs({ limit: 5, type: 73 }).catch(() => {});
        let entry;
        if (audits && audits.entries.size > 0) {
          audits = audits.entries.filter((a) => a.target.id === msgs.first().channel.id);
          entry = audits.sort((a, b) => b.id - a.id);
          entry = entry.first();
        }
        const embed = new Discord.MessageEmbed()
          .setTimestamp()
          .setColor(con.color)
          .setAuthor(
            lan.author.name,
            con.author.image,
            ch.stp(con.author.link, { msg: msgs.first() }),
          );
        if (entry)
          embed.setDescription(
            ch.stp(lan.descriptionWithAudit, {
              user: entry.executor,
              channel: msgs.first().channel,
              amount: msgs.size,
            }),
          );
        else
          embed.setDescription(
            ch.stp(lan.descriptionWithoutAudit, {
              channel: msgs.first().channel,
              amount: msgs.size,
            }),
          );
        if (path) ch.send(channels, { embeds: [embed], files: [path] });
        else ch.send(channels, { embeds: [embed] });
      }
    }
  },
};
