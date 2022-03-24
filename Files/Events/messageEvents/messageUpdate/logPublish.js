const Builders = require('@discordjs/builders');
const client = require('../../../BaseClient/DiscordClient');

module.exports = {
  async execute(oldMsg, newMsg) {
    if (oldMsg?.channel?.type !== 5 || newMsg?.channel?.type !== 5) return;
    if (!oldMsg?.author || !newMsg?.author) return;
    if (oldMsg?.crosspostable === newMsg?.crosspostable) return;
    const { ch } = client;
    const Constants = client.constants;
    const { guild } = newMsg;
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
        const con = Constants.messageUpdateLogPublish;
        const lan = language.messageUpdateLogPublish;
        const embed = new Builders.UnsafeEmbedBuilder()
          .setColor(con.color)
          .setTimestamp()
          .setAuthor({
            name: lan.author.name,
            iconURL: con.author.image,
            url: con.author.link,
          })
          .setDescription(
            ch.stp(lan.description, {
              msg: newMsg,
              link: ch.stp(con.author.link, { msg: newMsg }),
            }),
          );
        const maxFieldSize = 1024;
        if (newMsg.content) {
          const letters = newMsg.content.length;
          if (letters > maxFieldSize) {
            const chunks = [];
            chunks.first = `${newMsg.content.substr(0, maxFieldSize - 1)}\u2026`;
            chunks.last = `\u2026${newMsg.content.substr(maxFieldSize - 1, maxFieldSize * 2)}`;
            embed.addFields({ name: language.content, value: chunks.first });
            embed.addFields({ name: '\u200b', value: chunks.last });
          } else embed.addFields({ name: language.content, value: newMsg.content });
        }
        if (newMsg.embeds) {
          newMsg.embeds.forEach((embeds) => {
            if (embeds.title) embed.addFields({ name: language.title, value: embeds.title });
            else if (embeds.description) {
              embed.addFields({ name: language.description, value: embeds.description });
            } else embed.addFields({ name: language.unknownEmbed, value: '\u200b' });
          });
        }

        let buffers = [];
        let files = [];
        if (newMsg.attachments.size > 0) {
          if (newMsg.attachments.size > 0) {
            const urls = newMsg.attachments.map((attachment) => attachment.url);
            buffers = await ch.convertImageURLtoBuffer(urls);
          }
          if (buffers.length === 1) {
            embed.setImage(`attachment://${buffers[0].name}`);
            files = buffers;
          } else {
            files = buffers;
          }
        }
        ch.send(channels, { embeds: [embed], files });
      }
    }
  },
};
