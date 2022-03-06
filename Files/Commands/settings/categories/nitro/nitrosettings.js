const Discord = require('discord.js');

module.exports = {
  perm: 32n,
  type: 2,
  finished: true,
  category: ['automation'],
  childOf: 'nitro',
  displayEmbed(msg, r) {
    const embed = new Discord.UnsafeEmbed().addFields(...[
      {
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.logchannels,
        value: `${
          r.logchannels && r.logchannels.length
            ? r.logchannels.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: `${msg.lan.rolemode}`,
        value: `${r.rolemode ? msg.lan.replace : msg.lan.stack}`,
        inline: true,
      },
    ]);
    return embed;
  },
  buttons(msg, r) {
    const active = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const logchannels = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.logchannels.name)
      .setLabel(msg.lan.logchannels)
      .setStyle(Discord.ButtonStyle.Primary);
    const rolemode = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.rolemode.name)
      .setLabel(msg.lan.rolemode)
      .setStyle(r.rolemode ? Discord.ButtonStyle.Secondary : Discord.ButtonStyle.Primary);
    return [[active, logchannels, rolemode]];
  },
};
