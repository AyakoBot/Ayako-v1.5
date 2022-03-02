const Discord = require('discord.js');

module.exports = {
  name: 'avatar',
  aliases: ['av', 'pfp', 'spfp', 'sav', 'serveravatar'],
  perm: null,
  dm: true,
  takesFirstArg: false,
  type: 'info',
  async execute(msg) {
    const user = msg.args[0]
      ? await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {})
      : msg.author;

    const isGlobal =
      !msg.content.split(' ')[0].includes(module.exports.aliases[2]) &&
      !msg.content.split(' ')[0].includes(module.exports.aliases[3]) &&
      !msg.content.split(' ')[0].includes(module.exports.aliases[4]);

    if (!isGlobal && msg.channel.type === 'DM') {
      msg.client.ch.error(msg, msg.language.errors.guildCommand);
      return;
    }

    let member;
    if (!isGlobal) {
      member = msg.guild.members.cache.get(user.id);
      if (!member) member = await msg.guild.members.fetch(user.id).catch(() => {});
    }

    if (!isGlobal && !member) {
      msg.client.ch.error(msg, msg.language.errors.memberNotFound);
      return;
    }

    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.client.ch.stp(msg.lan.avatarOf, { user }),
        iconURL: msg.client.constants.standard.image,
        url: msg.client.ch.displayAvatarURL(isGlobal ? user : member),
      })
      .setImage(msg.client.ch.displayAvatarURL(isGlobal ? user : member))
      .setTimestamp()
      .setColor(msg.client.ch.colorSelector(msg.guild ? msg.guild.me : null))
      .setFooter({ text: msg.client.ch.stp(msg.language.requestedBy, { user: msg.author }) });
    msg.client.ch.reply(msg, { embeds: [embed] });
  },
};
