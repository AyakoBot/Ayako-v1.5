const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  perm: 32n,
  type: 3,
  finished: true,
  category: ['moderation'],
  displayEmbed: (msg, r) => {
    const embed = new Discord.MessageEmbed().addFields(
      {
        name: msg.lan.expirewarns,
        value: r.expirewarns
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: `${msg.lan.expirewarnsafter}\u200b`,
        value: moment
          .duration(+r.expirewarnsafter)
          .format(
            `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
            { trim: 'all' },
          )
          ? moment
              .duration(+r.expirewarnsafter)
              .format(
                `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
                { trim: 'all' },
              )
          : msg.language.none,
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.expiremutes,
        value: r.expiremutes
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: `${msg.lan.expiremutesafter}\u200b`,
        value: moment
          .duration(+r.expiremutesafter)
          .format(
            `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
            { trim: 'all' },
          )
          ? moment
              .duration(+r.expiremutesafter)
              .format(
                `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
                { trim: 'all' },
              )
          : msg.language.none,
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.muteban,
        value: r.muteban
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
    );
    return embed;
  },
  buttons: (msg, r) => {
    const expirewarns = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.expirewarns.name)
      .setLabel(msg.lan.expirewarns)
      .setStyle(r.expirewarns ? 'SUCCESS' : 'DANGER');
    const expiremutes = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.expiremutes.name)
      .setLabel(msg.lan.expiremutes)
      .setStyle(r.expiremutes ? 'SUCCESS' : 'DANGER');
    const expirewarnsafter = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.expirewarnsafter.name)
      .setLabel(msg.lan.expirewarnsafter)
      .setStyle(r.expirewarnsafter ? 'SUCCESS' : 'DANGER');
    const expiremutesafter = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.expiremutesafter.name)
      .setLabel(msg.lan.expiremutesafter)
      .setStyle(r.expiremutesafter ? 'SUCCESS' : 'DANGER');
    const muteban = new Discord.MessageButton()
      .setCustomId(msg.lan.edit.muteban.name)
      .setLabel(msg.lan.muteban)
      .setStyle(r.muteban ? 'SUCCESS' : 'DANGER');

    return [[expirewarns, expirewarnsafter], [expiremutes, expiremutesafter], [muteban]];
  },
};
