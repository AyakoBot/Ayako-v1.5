const Discord = require('discord.js');

module.exports = {
  key: ['onetimerunner'],
  requiresInteraction: true,
  buttons(msg) {
    const yes = new Discord.MessageButton()
      .setCustomId('yes')
      .setLabel(msg.language.Yes)
      .setStyle('SUCCESS');
    const no = new Discord.MessageButton()
      .setCustomId('no')
      .setLabel(msg.language.No)
      .setStyle('SECONDARY');
    return [[yes, no]];
  },
  interactionHandler(msgData) {
    const { msg, answer } = msgData;
    const returnEmbed = new Discord.MessageEmbed();

    answer.deferReply();

    require('../../../Events/guildEvents/guildMemberUpdate/separator').oneTimeRunner(
      msg,
      returnEmbed,
      answer,
    );

    return null;
  },
};
