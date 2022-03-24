const Builders = require('@discordjs/builders');

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

        const arr = msgs
          .map((msg) => {
            if (msg.author || msg.content || msg.attachments.size) {
              return `${msg.author.tag} (${msg.author.id}) | ${msg.content}\n${msg.attachments.map(
                (attachment) =>
                  `${attachment.description ? attachment.description : ''} ${attachment.url}\n`,
              )}`;
            }
            return null;
          })
          .filter((e) => !!e);

        const attachment = ch.txtFileWriter(arr);
        let entry;
        if (guild.me.permissions.has(128n)) {
          let audits = await guild.fetchAuditLogs({ limit: 5, type: 73 }).catch(() => {});
          if (audits && audits.entries.size > 0) {
            audits = audits.entries.filter((a) => a.target.id === msgs.first().channel.id);
            entry = audits.sort((a, b) => b.id - a.id);
            entry = entry.first();
          }
        }
        const embed = new Builders.UnsafeEmbedBuilder()
          .setTimestamp()
          .setColor(con.color)
          .setAuthor({
            name: lan.author.name,
            iconURL: con.author.image,
            url: ch.stp(con.author.link, { msg: msgs.first() }),
          });
        if (entry) {
          embed.setDescription(
            ch.stp(lan.descriptionWithAudit, {
              user: entry.executor,
              channel: msgs.first().channel,
              amount: msgs.size,
            }),
          );
        } else {
          embed.setDescription(
            ch.stp(lan.descriptionWithoutAudit, {
              channel: msgs.first().channel,
              amount: msgs.size,
            }),
          );
        }
        if (attachment) ch.send(channels, { embeds: [embed], files: [attachment] });
        else ch.send(channels, { embeds: [embed] });
      }
    }
  },
};
