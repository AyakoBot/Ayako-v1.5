const Discord = require('discord.js');

module.exports = {
  perm: 268435456n,
  type: 2,
  finished: true,
  category: ['automation'],
  displayEmbed(msg, r) {
    const embed = new Discord.MessageEmbed();

    embed.addFields(
      {
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.stickymode,
        value: r.stickymode
          ? `${msg.client.constants.emotes.enabled} ${msg.lan.unsticky}`
          : `${msg.client.constants.emotes.disabled} ${msg.lan.sticky}`,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: r.stickymode ? msg.lan.stickyRoles : msg.lan.notStickyRoles,
        value: `${
          r.roles && r.roles.length ? r.roles.map((id) => ` <@&${id}>`) : msg.language.none
        }`,
        inline: false,
      },
    );
    return embed;
  },
  buttons(msg, r) {
    const active = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? 'SUCCESS' : 'DANGER');
    const stickymode = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.stickymode.name)
      .setLabel(msg.lan.stickymode)
      .setStyle('SECONDARY');
    const roles = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.roles.name)
      .setLabel(msg.lan.roles)
      .setStyle('PRIMARY');
    return [[active], [stickymode, roles]];
  },
};
