const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  key: ['onetimerunner'],
  requiresInteraction: true,
  buttons(msg) {
    const yes = new Builders.UnsafeButtonBuilder()
      .setCustomId('yes')
      .setLabel(msg.language.Yes)
      .setStyle(Discord.ButtonStyle.Primary);
    const no = new Builders.UnsafeButtonBuilder()
      .setCustomId('no')
      .setLabel(msg.language.No)
      .setStyle(Discord.ButtonStyle.Secondary);
    return [[yes, no]];
  },
  interactionHandler(msgData) {
    const { msg, answer } = msgData;
    const returnEmbed = new Builders.UnsafeEmbedBuilder();

    answer.deferReply();
    msg.m.reactions.removeAll().catch(() => {});
    msg.client.ch.disableComponents(msg.m, msg.m.embeds);

    require('../../../Events/guildEvents/guildMemberUpdate/separator').oneTimeRunner(
      msg,
      returnEmbed,
      answer,
    );

    return null;
  },
};
