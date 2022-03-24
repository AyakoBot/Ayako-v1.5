const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  key: ['onetimerunner'],
  requiresInteraction: true,
  buttons(msg) {
    const yes = new Discord.UnsafeButtonComponent()
      .setCustomId('yes')
      .setLabel(msg.language.Yes)
      .setStyle(Discord.ButtonStyle.Primary);
    const no = new Discord.UnsafeButtonComponent()
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
    disableComponents(msg, msg.m.embeds[0]);

    require('../../../Events/guildEvents/guildMemberUpdate/separator').oneTimeRunner(
      msg,
      returnEmbed,
      answer,
    );

    return null;
  },
};

const disableComponents = async (msg, embed) => {
  msg.m.components.forEach((componentRow, i) => {
    componentRow.components.forEach((component, j) => {
      msg.m.components[i].components[j].disabled = true;
    });
  });

  await msg.m.edit({ embeds: [embed], components: msg.m.components });
};
