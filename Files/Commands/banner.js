const Discord = require('discord.js');

module.exports = {
  name: 'banner',
  aliases: ['sbanner', 'serverbanner'],
  perm: null,
  dm: true,
  takesFirstArg: false,
  type: 'info',
  async execute(msg) {
    const user = msg.args[0]
      ? await msg.client.users
          .fetch(msg.args[0].replace(/\D+/g, ''), { force: true })
          .catch(() => {})
      : await msg.client.users.fetch(msg.author.id, { force: true }).catch(() => {});

    const isGlobal =
      !msg.content.split(' ')[0].includes(module.exports.aliases[0]) &&
      !msg.content.split(' ')[0].includes(module.exports.aliases[1]);

    if (!isGlobal && msg.channel.type === 1) {
      msg.client.ch.error(msg, msg.language.errors.guildCommand);
      return;
    }

    let member;
    if (!isGlobal) {
      msg.client.ch.error(msg, msg.language.errors.notAvailableAPI);
      return;
    }

    const embed = new Discord.UnsafeEmbed()
      .setAuthor({
        name: msg.client.ch.stp(msg.lan.bannerOf, { user }),
        iconURL: msg.client.constants.standard.image,
        url: isGlobal ? user.bannerURL({ size: 4096 }) : member.bannerURL({ size: 4096 }),
      })
      .setImage(isGlobal ? user.bannerURL({ size: 4096 }) : member.bannerURL({ size: 4096 }))
      .setTimestamp()
      .setColor(msg.client.ch.colorSelector(msg.guild ? msg.guild.me : null))
      .setFooter({ text: msg.client.ch.stp(msg.language.requestedBy, { user: msg.author }) });
    msg.client.ch.reply(msg, { embeds: [embed] });
  },
};
