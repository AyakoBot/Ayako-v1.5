const Discord = require('discord.js');

module.exports = {
  perm: 268435456n,
  type: 2,
  finished: true,
  category: ['automation'],
  displayEmbed(msg, r) {
    const embed = new Discord.UnsafeEmbed();

    embed.addFields(...[
      {
        name: msg.lan.stickyrolesactive,
        value: r.stickyrolesactive
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.stickyrolesmode,
        value: r.stickyrolesmode
          ? `${msg.client.constants.emotes.enabled} ${msg.lan.unsticky}`
          : `${msg.client.constants.emotes.disabled} ${msg.lan.sticky}`,
        inline: false,
      },
      {
        name: r.stickyrolesmode ? msg.lan.stickyRoles : msg.lan.notStickyRoles,
        value: `${
          r.roles && r.roles.length ? r.roles.map((id) => ` <@&${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.stickypermsactive,
        value: r.stickypermsactive
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
    ]);
    return embed;
  },
  buttons(msg, r) {
    const stickyrolesactive = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.stickyrolesactive.name)
      .setLabel(msg.lan.stickyrolesactive)
      .setStyle(r.stickyrolesactive ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const stickyrolesmode = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.stickyrolesmode.name)
      .setLabel(msg.lan.stickyrolesmode)
      .setStyle(Discord.ButtonStyle.Secondary);
    const roles = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.roles.name)
      .setLabel(msg.lan.roles)
      .setStyle(Discord.ButtonStyle.Primary);
    const stickypermsactive = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.stickypermsactive.name)
      .setLabel(msg.lan.stickypermsactive)
      .setStyle(r.stickypermsactive ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    return [[stickyrolesactive], [stickyrolesmode, roles], [stickypermsactive]];
  },
};
