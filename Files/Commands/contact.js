const Discord = require('discord.js');

module.exports = {
  name: 'contact',
  cooldown: 10000,
  perm: null,
  dm: true,
  takesFirstArg: true,
  aliases: null,
  execute(msg) {
    const tta = msg.args.slice(0).join(' ');
    const SuggestEmbed = new Discord.UnsafeEmbed()
      .setAuthor({
        name: `${msg.author.tag} / ${msg.author.id} / ${msg.guild.name}`,
        iconURL: msg.author.displayAvatarURL({ size: 4096 }),
      })
      .setDescription(tta)
      .addFields({ name: '\u200B', value: `${msg.url}` });
    msg.attachments.map((o) => o);
    msg.attachments.forEach((o) => {
      SuggestEmbed.addFields({ name: 'Attachment', value: `${o.url}` });
    });
    msg.client.ch.send(msg.client.channels.cache.get('745080980431175792'), {
      embeds: [SuggestEmbed],
    });
    const suggestReplyEmbed = new Discord.UnsafeEmbed()
      .setAuthor({
        name: msg.lan.thanks.thanks,
        iconURL: msg.client.constants.standard.image,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(msg.lan.thanks.desc)
      .addFields({ name: msg.lan.thanks.field, value: '\u200B' })
      .setTimestamp()
      .setColor(msg.client.ch.colorSelector(msg.guild ? msg.guild.me : null));
    msg.client.ch.reply(msg, { embeds: [suggestReplyEmbed] });
  },
};
