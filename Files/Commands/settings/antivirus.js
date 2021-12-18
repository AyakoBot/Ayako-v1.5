const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  perm: 32n,
  type: 1,
  displayEmbed(msg, r) {
    const embed = new Discord.MessageEmbed().addFields(
      {
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.language.punishments,
        value:
          `${msg.client.ch.stp(msg.lan.warnafterwarnsamount, {
            amount: r.warnafterwarnsamount ? r.warnafterwarnsamount : '--',
          })}\n` +
          `${msg.client.ch.stp(msg.lan.muteafterwarnsamount, {
            amount: r.muteafterwarnsamount ? r.muteafterwarnsamount : '--',
          })}\n` +
          `${msg.client.ch.stp(msg.lan.kickafterwarnsamount, {
            amount: r.kickafterwarnsamount ? r.kickafterwarnsamount : '--',
          })}\n` +
          `${msg.client.ch.stp(msg.lan.banafterwarnsamount, {
            amount: r.banafterwarnsamount ? r.banafterwarnsamount : '--',
          })}`,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.verbaltof,
        value: r.verbaltof
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: msg.lan.warntof,
        value: r.warntof
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: msg.lan.mutetof,
        value: r.mutetof
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: msg.lan.kicktof,
        value: r.kicktof
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: msg.lan.bantof,
        value: r.bantof
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.delete,
        value: moment
          .duration(+r.delete)
          .format(
            `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
            { trim: 'all' },
          )
          ? moment
              .duration(+r.delete)
              .format(
                `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
                { trim: 'all' },
              )
          : msg.language.none,
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
    const ban = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.bantof.name)
      .setLabel(msg.lan.bantof)
      .setStyle(r.bantof ? 'SUCCESS' : 'DANGER');
    const kick = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.kicktof.name)
      .setLabel(msg.lan.kicktof)
      .setStyle(r.kicktof ? 'SUCCESS' : 'DANGER');
    const mute = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.mutetof.name)
      .setLabel(msg.lan.mutetof)
      .setStyle(r.mutetof ? 'SUCCESS' : 'DANGER');
    const warn = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.warntof.name)
      .setLabel(msg.lan.warntof)
      .setStyle(r.warntof ? 'SUCCESS' : 'DANGER');
    const verbal = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.verbaltof.name)
      .setLabel(msg.lan.verbaltof)
      .setStyle(r.verbaltof ? 'SUCCESS' : 'DANGER');
    const waw = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.warnafterwarnsamount.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.warnafterwarnsamount.replace(/\*/g, ''), {
          amount: r.warnafterwarnsamount ? r.warnafterwarnsamount : '--',
        }),
      )
      .setStyle(!r.readofwarnstof ? 'DANGER' : 'SECONDARY');
    const maw = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.muteafterwarnsamount.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.muteafterwarnsamount.replace(/\*/g, ''), {
          amount: r.muteafterwarnsamount ? r.muteafterwarnsamount : '--',
        }),
      )
      .setStyle(!r.readofwarnstof ? 'DANGER' : 'SECONDARY');
    const kaw = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.kickafterwarnsamount.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.kickafterwarnsamount.replace(/\*/g, ''), {
          amount: r.kickafterwarnsamount ? r.kickafterwarnsamount : '--',
        }),
      )
      .setStyle(!r.readofwarnstof ? 'DANGER' : 'SECONDARY');
    const baw = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.banafterwarnsamount.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.banafterwarnsamount.replace(/\*/g, ''), {
          amount: r.banafterwarnsamount ? r.banafterwarnsamount : '--',
        }),
      )
      .setStyle(!r.readofwarnstof ? 'DANGER' : 'SECONDARY');
    const deleteB = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.delete.name)
      .setLabel(msg.lan.delete)
      .setStyle('SECONDARY');
    return [[active], [verbal, warn, mute, kick, ban], [waw, maw, kaw, baw], [deleteB]];
  },
};
