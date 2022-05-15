const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  perm: 32n,
  type: 2,
  finished: true,
  setupRequired: false,
  childOf: 'leveling',
  category: ['automation'],
  helpCategory: 'leveling',
  mmrEmbed(msg, res) {
    const embed = new Builders.UnsafeEmbedBuilder();
    for (let i = 0; i < res.length; i += 1) {
      const r = res[i];

      embed.addFields({
        name: `${msg.language.number}: \`${r.id}\` | ${r.level ? r.level : '--'} ${
          msg.language.level
        }`,
        value: `${msg.language.affected}: ${
          r.roles && r.roles.length ? r.roles.length : msg.language.none
        } ${msg.language.roles}`,
        inline: true,
      });
    }
    return embed;
  },
  displayEmbed(msg, r) {
    const embed = new Builders.UnsafeEmbedBuilder().addFields(
      {
        name: msg.lan.roles,
        value: `${r.roles?.length ? r.roles.map((id) => ` <@&${id}>`) : msg.language.none}`,
        inline: false,
      },
      {
        name: msg.lan.level,
        value: `${r.level ? r.level : msg.language.none}`,
        inline: false,
      },
    );
    return embed;
  },
  buttons(msg) {
    const roles = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.roles.name)
      .setLabel(msg.lan.roles)
      .setStyle(Discord.ButtonStyle.Primary);

    const level = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.level.name)
      .setLabel(msg.lan.level.replace(/\*/g, ''))
      .setStyle(Discord.ButtonStyle.Secondary);

    return [[roles, level]];
  },
};
