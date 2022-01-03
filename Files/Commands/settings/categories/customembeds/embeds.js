const Discord = require('discord.js');

module.exports = {
  perm: 32n,
  type: 0,
  finished: true,
  setupRequired: false,
  childOf: 'customembeds',
  category: ['none'],
  mmrEmbed(msg, res) {
    const embed = new Discord.MessageEmbed();
    for (let i = 0; i < res.length; i += 1) {
      const r = res[i];

      embed.addFields({
        name: `${msg.language.number}: \`${r.id}\``,
        value: `${msg.language.name}:\n${r.name}`,
        inline: true,
      });
    }
    return embed;
  },
  displayEmbed(msg, r) {
    const embed = new Discord.MessageEmbed().setDescription(
      `${msg.client.ch.stp(msg.lan.totalLimit, {
        maxLimit: msg.client.constants.customembeds.total,
      })}\n\n${msg.client.constants.customembeds.limits.totalOf.map(
        (key) =>
          `${msg.client.ch.stp(msg.lan.limit, {
            name: msg.lan.edit[key].name,
            limit: msg.client.constants.customembeds.limits.fields[key],
          })}`,
      )}`,
    );
    Object.values(msg.lan.edit).forEach((key) => {
      embed.addField(key.name, key.answers);
    });
    return embed;
  },
  buttons(msg) {
    return [[]];
  },
};
