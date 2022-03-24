const Builders = require('@discordjs/builders');
const client = require('../../../BaseClient/DiscordClient');

module.exports = {
  async execute(oldMsg, newMsg) {
    if (!oldMsg || !newMsg || !oldMsg.content || !newMsg.content) return;
    if (oldMsg.content === newMsg.content) return;
    if (oldMsg.pinned !== newMsg.pinned) return;
    const { guild } = oldMsg;
    const { ch } = client;
    const Constants = client.constants;
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
        const con = Constants.messageUpdateLogUpdate;
        const lan = language.messageUpdateLogUpdate;
        const embed = new Builders.UnsafeEmbedBuilder()
          .setColor(con.color)
          .setTimestamp()
          .setAuthor({
            name: lan.author.name,
            iconURL: con.author.image,
            url: newMsg.url,
          })
          .setDescription(
            ch.stp(lan.description, {
              msg: newMsg,
              link: newMsg.url,
            }),
          );
        const maxFieldSize = 1024;
        if (oldMsg.content) {
          const letters = oldMsg.content.length;
          if (letters > maxFieldSize) {
            const chunks = [];
            chunks.first = `${oldMsg.content.substr(0, maxFieldSize - 1)}\u2026`;
            chunks.last = `\u2026${oldMsg.content.substr(maxFieldSize - 1, maxFieldSize * 2)}`;
            embed.addFields({ name: lan.oldContent, value: chunks.first });
            embed.addFields({ name: '\u200b', value: chunks.last });
          } else {
            embed.addFields({ name: lan.oldContent, value: oldMsg.content });
          }
        }
        if (newMsg.content) {
          const letters = newMsg.content.length;
          if (letters > maxFieldSize) {
            const chunks = [];
            chunks.first = `${newMsg.content.substr(0, maxFieldSize - 1)}\u2026`;
            chunks.last = `\u2026${newMsg.content.substr(maxFieldSize - 1, maxFieldSize * 2)}`;
            embed.addFields({ name: lan.newContent, value: chunks.first });
            embed.addFields({ name: '\u200b', value: chunks.last });
          } else {
            embed.addFields({ name: lan.newContent, value: newMsg.content });
          }
        }
        ch.send(channels, { embeds: [embed] });
      }
    }
  },
};
