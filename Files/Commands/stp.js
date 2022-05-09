const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  name: 'stp',
  perm: null,
  dm: true,
  takesFirstArg: true,
  aliases: [],
  type: 'owner',
  async execute(msg) {
    let returned;

    try {
      returned = msg.client.ch.stp(msg.args.join(' '), { msg });
    } catch (e) {
      returned = e.message;
    }

    const embed = new Builders.UnsafeEmbedBuilder().setDescription(returned).addFields({
      name: '\u200b',
      value: `${msg.language.Examples}: ${msg.client.ch.makeCodeBlock(
        `t!stp {{msg.guild.name}}\nt!stp {{msg.author.username}}\nt!stp {{msg.channel.name}}`,
      )}`,
    });

    const warn = new Builders.UnsafeButtonBuilder()
      .setCustomId('uselessbutton')
      .setLabel(msg.lan.warn)
      .setStyle(Discord.ButtonStyle.Danger)
      .setDisabled(true);

    const link = new Builders.UnsafeButtonBuilder()
      .setURL('https://discord.js.org/#/docs/discord.js/stable/class/Message')
      .setLabel(msg.lan.button)
      .setStyle(Discord.ButtonStyle.Link);

    msg.client.ch.reply(msg, {
      embeds: [embed],
      components: msg.client.ch.buttonRower([warn, link]),
    });
  },
};
