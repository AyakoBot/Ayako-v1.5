const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  perm: 32n,
  type: 0,
  finished: true,
  category: ['automation'],
  displayEmbed(msg, r) {
    const embed = new Builders.UnsafeEmbedBuilder().addFields(
      {
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.roles,
        value: `${
          r.roles && r.roles.length ? r.roles.map((id) => ` <#${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.users,
        value: `${
          r.users && r.users.length ? r.users.map((id) => ` <#${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.channelid,
        value: r.channelid ? `<#${r.channelid}>` : msg.language.none,
        inline: false,
      },
      {
        name: msg.lan.repeatreminder,
        value: `${moment
          .duration(r.repeatreminder * 60000)
          .format(
            `h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
          )}`,
        inline: false,
      },
    );
    return embed;
  },
  buttons(msg, r) {
    const active = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const roles = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.roles.name)
      .setLabel(msg.lan.roles)
      .setStyle(Discord.ButtonStyle.Primary);
    const users = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.users.name)
      .setLabel(msg.lan.users)
      .setStyle(Discord.ButtonStyle.Primary);
    const channel = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.channelid.name)
      .setLabel(msg.lan.channelid)
      .setStyle(Discord.ButtonStyle.Primary);
    const repeatreminder = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.repeatreminder.name)
      .setLabel(msg.lan.repeatreminder)
      .setStyle(Discord.ButtonStyle.Secondary);
    return [[active], [roles, users, channel], [repeatreminder]];
  },
};
