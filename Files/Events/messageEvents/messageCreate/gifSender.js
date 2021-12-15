
const Discord = require('discord.js');
const isImageUrl = require('is-image-url');
const Tenor = require('../../../BaseClient/tenor');

module.exports = {
  async execute(msg) {
    if (!msg.channel || msg.channel.type === 'DM' || !msg.author || msg.author.bot) return;
    if (msg.embeds) {
      if (
        msg.content.toLowerCase().includes('https://tenor.com/view/') ||
        msg.content.toLowerCase().includes('.gif')
      ) {
        const res = await msg.client.ch.query('SELECT * FROM gifposter WHERE guildid = $1;', [
          msg.guild.id,
        ]);
        if (res && res.rowCount > 0) {
          const r = res.rows[0];
          if (r.active === false) return;
          const Gif = [];
          msg.embeds.forEach((embeds) => {
            if (embeds.url.toLowerCase().includes('https://tenor.com/view/'))
              Gif.push(Tenor.getGif(embeds.url)[0].media[0].gif.url);
            else Gif.push(embeds.url);
            msg.content = msg.content.replace(embeds.url, '');
          });
          await Promise.All(Gif);
          Gif.forEach(async (gif) => {
            const embed = new Discord.MessageEmbed()
              .setColor(msg.client.ch.colorSelector(msg.guild ? msg.guild.me : null))
              .setAuthor(
                msg.author.tag,
                msg.client.ch.displayAvatarURL(msg.author),
                msg.client.constants.standard.invite,
              );
            if (msg.content.length) embed.setDescription(msg.content);
            if (isImageUrl(gif)) {
              if (r.size === 'big') embed.setImage(gif);
              else embed.setThumbnail(gif);
            }
            if (
              embed.url ||
              (embed.thumbnail && embed.thumbnail.url) ||
              (embed.image && embed.image.url)
            ) {
              const reference = await msg.fetchReference().catch(() => {});
              let ping = false;
              if (reference) {
                const filter = msg.mentions.users.filter((u) => u.id === reference.author.id);
                if (filter.first()) ping = true;
              }
              msg.delete().catch(() => {});
              if (!msg.reference) return msg.client.ch.send(msg.channel, embed);
              if (msg.reference.channelID !== msg.channel.id)
                return msg.client.ch.send(msg.channel, embed);
              return msg.client.ch.send(msg.channel, {
                embed,
                reply: {
                  messageReference: msg.reference.messageID,
                  failIfNotExists: false,
                },
                allowedMentions: {
                  repliedUser: ping,
                },
              });
            }
            return null;
          });
        }
      }
    }
  },
};
