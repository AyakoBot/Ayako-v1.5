const Discord = require('discord.js');

module.exports = {
  perm: 32n,
  type: 2,
  finished: true,
  setupRequired: false,
  childOf: 'leveling',
  category: ['automation'],
  mmrEmbed(msg, res) {
    const embed = new Discord.UnsafeEmbed();
    for (let i = 0; i < res.length; i += 1) {
      const r = res[i];

      embed.addFieldss([
        {
          name: `${msg.language.number}: \`${r.id}\` | ${r.level ? r.level : '--'} ${
            msg.language.level
          }`,
          value: `${msg.language.affected}: ${
            r.roles && r.roles.length ? r.roles.length : msg.language.none
          } ${msg.language.roles}`,
          inline: true,
        },
      ]);
    }
    return embed;
  },
  displayEmbed(msg, r) {
    const embed = new Discord.UnsafeEmbed().addFieldss([
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
    ]);
    return embed;
  },
  buttons(msg) {
    const roles = new Discord.Button()
      .setCustomId(msg.lan.edit.roles.name)
      .setLabel(msg.lan.roles)
      .setStyle(Discord.ButtonStyle.Primary);

    const level = new Discord.Button()
      .setCustomId(msg.lan.edit.level.name)
      .setLabel(msg.lan.level.replace(/\*/g, ''))
      .setStyle(Discord.ButtonStyle.Secondary);

    return [[roles, level]];
  },
};
