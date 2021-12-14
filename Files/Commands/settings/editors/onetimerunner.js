const Discord = require('discord.js');

module.exports = {
  key: ['onetimerunner'],
  requiresInteraction: true,
  dataPreparation() {
    return null;
  },
  buttons(msg) {
    const yes = new Discord.MessageButton()
      .setCustomId('yes')
      .setLabel(msg.language.Yes)
      .setStyle('SUCCESS');
    const no = new Discord.MessageButton()
      .setCustomId('no')
      .setLabel(msg.language.No)
      .setStyle('SECONDARY');
    const back = new Discord.MessageButton()
      .setCustomId('back')
      .setLabel(msg.language.back)
      .setEmoji(msg.client.constants.emotes.back)
      .setStyle('DANGER');
    return [[yes, no], [back]];
  },
  interactionHandler(msgData) {
    const { msg, answer } = msgData;
    const returnEmbed = new Discord.MessageEmbed();

    answer.deferReply();

    // eslint-disable-next-line global-require
    require('../../../Events/guildEvents/guildMemberUpdate/separator').oneTimeRunner(
      msg,
      returnEmbed,
      answer,
    );

    return null;
  },
  getSelected() {
    return 'noSelect';
  },
};
