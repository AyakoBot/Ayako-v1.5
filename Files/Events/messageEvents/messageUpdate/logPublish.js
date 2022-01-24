const Discord = require('discord.js');
const client = require('../../../BaseClient/DiscordClient');

module.exports = {
  async execute(oldMsg, newMsg) {
    if (oldMsg?.channel?.type !== 'GUILD_NEWS' || newMsg.channel.type !== 'GUILD_NEWS') return;
    if (!oldMsg.author || newMsg.author) return;
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
        const embed = new Discord.MessageEmbed()
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
            embed.addField(language.content, chunks.first);
            embed.addField('\u200b', chunks.last);
          } else embed.addField(language.content, newMsg.content);
        }
        if (newMsg.embeds) {
          newMsg.embeds.forEach((embeds) => {
            if (embeds.title) embed.addField(language.title, embeds.title);
            else if (embeds.description) embed.addField(language.description, embeds.description);
            else embed.addField(language.unknownEmbed, '\u200b');
          });
        }

        let paths = [];
        let files = [];
        if (newMsg.attachments.size > 0) {
          const urls = newMsg.attachments.map((attachment) => attachment.url);
          paths = await ch.downloader(newMsg, urls, 'message');
          if (paths.length === 1) {
            const name = await ch.getName(paths[0]);
            embed.setImage(`attachment://${name}`);
            files = paths;
          } else {
            files = paths;
          }
        }
        ch.send(channels, { embeds: [embed], files });
      }
    }
  },
};
