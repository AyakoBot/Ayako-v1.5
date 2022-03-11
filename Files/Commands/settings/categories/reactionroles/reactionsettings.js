const Discord = require('discord.js');

module.exports = {
  perm: 268435456n,
  type: 2,
  setupRequired: false,
  finished: true,
  category: ['automation'],
  mmrEmbed(msg, res) {
    const embed = new Discord.UnsafeEmbed();

    res.rows.forEach((row) => {
      embed.addFields({
        name: row.name,
        value: msg.client.ch.stp(msg.client.constants.standard.discordUrlDB, {
          guildid: row.guildid,
          channelid: row.channelid,
          msgid: row.msgid,
        }),
        inline: true,
      });
    });

    return embed;
  },
  displayEmbed(msg, r) {
    const embed = new Discord.UnsafeEmbed();

    embed.addFields({
      name: msg.lanSettings.active,
      value: r.active
        ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
        : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
      inline: false,
    });

    return embed;
  },
  buttons(msg, r) {
    return [[]];
  },
};
