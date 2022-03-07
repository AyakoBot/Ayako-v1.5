const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  perm: 32n,
  type: 0,
  finished: true,
  category: ['auto-moderation'],
  displayEmbed(msg, r) {
    const embed = new Discord.UnsafeEmbed().addFields(
      {
        name: msg.lanSettings.active,
        value: `${
          r.active
            ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
            : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`
        }`,
        inline: false,
      },

      {
        name: msg.lan.punishmenttof,
        value: r.punishmenttof
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },

      {
        name: msg.lan.punishment,
        value: `${r.punishment ? `${msg.language.Ban}` : `${msg.language.Kick}`}`,
        inline: true,
      },

      { name: '\u200b', value: `${msg.lan.debugSettings}`, inline: false },

      {
        name: msg.lan.posttof,
        value: `${
          r.posttof
            ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
            : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`
        }`,
        inline: true,
      },

      {
        name: msg.lan.postchannel,
        value: `${r.postchannel ? `<#${r.postchannel}>` : msg.language.none}`,
        inline: false,
      },

      {
        name: msg.lan.pingusers,
        value: `${
          r.pingusers && r.pingusers.length
            ? r.pingusers.map((id) => ` <@${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },

      {
        name: msg.lan.pingroles,
        value: `${
          r.pingroles && r.pingroles.length
            ? r.pingroles.map((id) => ` <@&${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },

      { name: '\u200b', value: msg.lan.thresholdSettings, inline: false },

      {
        name: msg.lan.time,
        value: r.time
          ? moment
              .duration(+r.time)
              .format(`m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`)
          : msg.language.none,
        inline: true,
      },

      {
        name: msg.lan.jointhreshold,
        value: r.jointhreshold ? r.jointhreshold : msg.language.none,
        inline: true,
      },

      {
        name: msg.lan.similaridthreshold,
        value: r.similaridthreshold ? r.similaridthreshold : msg.language.none,
        inline: true,
      },
    );
    return embed;
  },
  buttons(msg, r) {
    const active = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const punishmenttof = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.punishmenttof.name)
      .setLabel(msg.lan.punishmenttof)
      .setStyle(r.punishmenttof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const punishment = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.punishment.name)
      .setLabel(msg.lan.punishment)
      .setStyle(r.punishment ? Discord.ButtonStyle.Secondary : Discord.ButtonStyle.Primary);
    const post = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.posttof.name)
      .setLabel(msg.lan.posttof)
      .setStyle(r.posttof ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Secondary);
    const postchannel = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.postchannel.name)
      .setLabel(msg.lan.postchannel)
      .setStyle(Discord.ButtonStyle.Primary);
    const pingusers = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.pingusers.name)
      .setLabel(msg.lan.pingusers)
      .setStyle(Discord.ButtonStyle.Secondary);
    const pingroles = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.pingroles.name)
      .setLabel(msg.lan.pingroles)
      .setStyle(Discord.ButtonStyle.Secondary);
    const time = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.time.name)
      .setLabel(msg.lan.time)
      .setStyle(Discord.ButtonStyle.Primary);
    const jointhreshold = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.jointhreshold.name)
      .setLabel(msg.lan.jointhreshold)
      .setStyle(Discord.ButtonStyle.Primary);
    const similaridthreshold = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.similaridthreshold.name)
      .setLabel(msg.lan.similaridthreshold)
      .setStyle(Discord.ButtonStyle.Primary);
    return [
      [active],
      [punishmenttof, punishment],
      [post, postchannel, pingusers, pingroles],
      [time, jointhreshold, similaridthreshold],
    ];
  },
};
