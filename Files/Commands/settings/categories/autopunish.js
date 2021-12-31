const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  perm: 8n,
  type: 0,
  setupRequired: false,
  finished: true,
  async mmrEmbed(msg, res) {
    const embed = new Discord.MessageEmbed().setDescription(
      msg.client.ch.stp(msg.lan.description, { prefix: msg.client.constants.standard.prefix }),
    );
    for (let i = 0; i < res.length; i += 1) {
      const r = res[i];
      const punishment = msg.language.autopunish[r.punishment];
      embed.addFields({
        name: `${msg.language.number}: \`${r.id}\` | ${
          r.active
            ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
            : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`
        }`,
        value: `${msg.lan.punishment}: ${punishment}\n${msg.lan.requiredWarns} ${
          r.warnamount ? r.warnamount : msg.language.none
        }`,
        inline: true,
      });
    }
    return embed;
  },
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
        name: '\u200b',
        value: msg.lan.punishmentSettings,
        inline: false,
      },
      {
        name: '\u200b',
        value: msg.client.ch.stp(msg.lan.warnamount, { warns: r.warnamount ? r.warnamount : '--' }),
        inline: false,
      },
      {
        name: msg.lan.punishment,
        value: msg.language.autopunish[r.punishment],
        inline: false,
      },
      {
        name: msg.lan.duration,
        value: moment
          .duration(+r.duration)
          .format(
            `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
            { trim: 'all' },
          )
          ? moment
              .duration(+r.duration)
              .format(
                `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
                { trim: 'all' },
              )
          : msg.language.none,
        inline: false,
      },
      {
        name: '\u200b',
        value: msg.lan.roleSettings,
        inline: false,
      },
      {
        name: msg.lan.addroles,
        value: `${
          r.addroles && r.addroles.length ? r.addroles.map((id) => ` <@&${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.removeroles,
        value: `${
          r.removeroles && r.removeroles.length
            ? r.removeroles.map((id) => ` <@&${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: '\u200b',
        value: msg.lan.confirmationSettings,
        inline: false,
      },
      {
        name: msg.lan.confirmationreq,
        value: r.confirmationreq
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: msg.lan.punishmentawaittime,
        value: moment
          .duration(+r.punishmentawaittime)
          .format(
            `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
            { trim: 'all' },
          )
          ? moment
              .duration(+r.punishmentawaittime)
              .format(
                `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
                { trim: 'all' },
              )
          : msg.language.none,
        inline: true,
      },
    );
    return embed;
  },
  buttons(msg, r) {
    const active = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? 'SUCCESS' : 'DANGER');
    const warnamount = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.warnamount.name)
      .setLabel(
        msg.client.ch
          .stp(msg.lan.edit.warnamount.name, { warns: r.warnamount ? r.warnamount : '--' })
          .replace(/\**/g, ''),
      )
      .setStyle('SECONDARY');
    const punishment = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.punishment.name)
      .setLabel(msg.lan.punishment)
      .setStyle(r.isvarying ? 'SUCCESS' : 'SECONDARY');
    const duration = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.duration.name)
      .setLabel(msg.lan.edit.duration.name)
      .setStyle('PRIMARY');
    const addroles = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.addroles.name)
      .setLabel(msg.lan.addroles)
      .setStyle('PRIMARY');
    const removeroles = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.removeroles.name)
      .setLabel(msg.lan.removeroles)
      .setStyle('PRIMARY');
    const confirmationreq = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.confirmationreq.name)
      .setLabel(msg.lan.confirmationreq)
      .setStyle(r.confirmationreq ? 'SUCCESS' : 'SECONDARY');
    const punishmentawaittime = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.punishmentawaittime.name)
      .setLabel(msg.lan.punishmentawaittime)
      .setStyle(r.isvarying ? 'SUCCESS' : 'SECONDARY');

    return [
      [active],
      [warnamount, punishment, duration],
      [addroles, removeroles],
      [confirmationreq, punishmentawaittime],
    ];
  },
};
