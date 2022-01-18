const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  perm: 32n,
  type: 0,
  finished: true,
  category: ['auto-moderation'],
  displayEmbed(msg, r) {
    const embed = new Discord.MessageEmbed()
      .addField(
        msg.lanSettings.active,
        `${
          r.active
            ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
            : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`
        }`,
        false,
      )
      .addField(
        msg.lan.punishmenttof,
        r.punishmenttof
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        true,
      )
      .addField(
        msg.lan.punishment,
        `${r.punishment ? `${msg.language.Ban}` : `${msg.language.Kick}`}`,
        true,
      )
      .addField('\u200b', `${msg.lan.debugSettings}`, false)
      .addField(
        msg.lan.posttof,
        `${
          r.posttof
            ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
            : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`
        }`,
        true,
      )
      .addField(
        msg.lan.postchannel,
        `${r.postchannel ? `<#${r.postchannel}>` : msg.language.none}`,
        false,
      )
      .addField(
        msg.lan.pingusers,
        `${
          r.pingusers && r.pingusers.length
            ? r.pingusers.map((id) => ` <@${id}>`)
            : msg.language.none
        }`,
        false,
      )
      .addField(
        msg.lan.pingroles,
        `${
          r.pingroles && r.pingroles.length
            ? r.pingroles.map((id) => ` <@&${id}>`)
            : msg.language.none
        }`,
        false,
      )
      .addField('\u200b', msg.lan.thresholdSettings, false)
      .addField(
        msg.lan.time,
        r.time
          ? moment
              .duration(+r.time)
              .format(`m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`)
          : msg.language.none,
        true,
      )
      .addField(msg.lan.jointhreshold, r.jointhreshold ? r.jointhreshold : msg.language.none, true)
      .addField(
        msg.lan.similaridthreshold,
        r.similaridthreshold ? r.similaridthreshold : msg.language.none,
        true,
      );
    return embed;
  },
  buttons(msg, r) {
    const active = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? 'SUCCESS' : 'DANGER');
    const punishmenttof = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.punishmenttof.name)
      .setLabel(msg.lan.punishmenttof)
      .setStyle(r.punishmenttof ? 'SUCCESS' : 'DANGER');
    const punishment = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.punishment.name)
      .setLabel(msg.lan.punishment)
      .setStyle(r.punishment ? 'SECONDARY' : 'PRIMARY');
    const post = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.posttof.name)
      .setLabel(msg.lan.posttof)
      .setStyle(r.posttof ? 'SUCCESS' : 'SECONDARY');
    const postchannel = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.postchannel.name)
      .setLabel(msg.lan.postchannel)
      .setStyle('PRIMARY');
    const pingusers = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.pingusers.name)
      .setLabel(msg.lan.pingusers)
      .setStyle('SECONDARY');
    const pingroles = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.pingroles.name)
      .setLabel(msg.lan.pingroles)
      .setStyle('SECONDARY');
    const time = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.time.name)
      .setLabel(msg.lan.time)
      .setStyle('PRIMARY');
    const jointhreshold = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.jointhreshold.name)
      .setLabel(msg.lan.jointhreshold)
      .setStyle('PRIMARY');
    const similaridthreshold = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.similaridthreshold.name)
      .setLabel(msg.lan.similaridthreshold)
      .setStyle('PRIMARY');
    return [
      [active],
      [punishmenttof, punishment],
      [post, postchannel, pingusers, pingroles],
      [time, jointhreshold, similaridthreshold],
    ];
  },
};
