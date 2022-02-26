const Discord = require('discord.js');

module.exports = {
  name: 'avatar',
  aliases: ['av', 'pfp'],
  perm: null,
  dm: true,
  takesFirstArg: false,
  type: 'info',
  async execute(msg) {
    const user = msg.args[0]
      ? await msg.client.users.fetch(msg.args[0].replace(/\D+/g, ''))
      : msg.author;

    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.client.ch.stp(msg.lan.avatarOf, { user }),
        iconURL: msg.client.constants.standard.image,
        url: msg.client.ch.displayAvatarURL(user),
      })
      .setImage(msg.client.ch.displayAvatarURL(user))
      .setTimestamp()
      .setColor(msg.client.ch.colorSelector(msg.guild ? msg.guild.me : null))
      .setFooter({ text: msg.client.ch.stp(msg.language.requestedBy, { user: msg.author }) });
    msg.client.ch.reply(msg, { embeds: [embed] });
  },
};
