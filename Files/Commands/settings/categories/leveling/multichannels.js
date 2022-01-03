const Discord = require('discord.js');

module.exports = {
  perm: 32n,
  type: 2,
  finished: true,
  setupRequired: false,
  multiplier: [
    0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9,
    2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8,
    3.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0,
  ],
  childOf: 'leveling',
  category: ['automation'],
  mmrEmbed(msg, res) {
    const embed = new Discord.MessageEmbed();
    for (let i = 0; i < res.length; i += 1) {
      const r = res[i];

      embed.addFields({
        name: `${msg.language.number}: \`${r.id}\` | ${r.multiplier ? r.multiplier : '1.0'}x`,
        value: `${msg.language.affected}: ${
          r.channels && r.channels.length
            ? `${r.channels.length} ${msg.language.Channels}`
            : msg.language.none
        }`,
        inline: true,
      });
    }
    return embed;
  },
  displayEmbed(msg, r) {
    const embed = new Discord.MessageEmbed().addFields(
      {
        name: msg.lan.channels,
        value: `${r.channels?.length ? r.channels.map((id) => ` <@&${id}>`) : msg.language.none}`,
        inline: false,
      },
      {
        name: msg.lan.multiplier,
        value: `${r.multiplier}`,
        inline: false,
      },
    );
    return embed;
  },
  buttons(msg) {
    const channels = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.channels.name)
      .setLabel(msg.lan.channels)
      .setStyle('PRIMARY');

    const multiplier = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.multiplier.name)
      .setLabel(msg.lan.multiplier.replace(/\*/g, ''))
      .setStyle('SECONDARY');

    return [[channels, multiplier]];
  },
};
