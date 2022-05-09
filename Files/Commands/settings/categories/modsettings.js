const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

const moment = require('moment');
require('moment-duration-format');

module.exports = {
  perm: 32n,
  type: 3,
  finished: true,
  category: ['moderation'],
  helpCategory: 'mod',
  displayEmbed: (msg, r) => {
    const embed = new Builders.UnsafeEmbedBuilder().setDescription(msg.lan.description).addFields(
      {
        name: msg.lan.warns,
        value: r.warns
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: `${msg.lan.warnstime}\u200b`,
        value: moment
          .duration(+r.warnstime)
          .format(
            `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
            { trim: 'all' },
          )
          ? moment
              .duration(+r.warnstime)
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
        name: msg.lan.mutes,
        value: r.mutes
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: `${msg.lan.mutestime}\u200b`,
        value: moment
          .duration(+r.mutestime)
          .format(
            `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
            { trim: 'all' },
          )
          ? moment
              .duration(+r.mutestime)
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
        name: msg.lan.kicks,
        value: r.kicks
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: `${msg.lan.kickstime}\u200b`,
        value: moment
          .duration(+r.kickstime)
          .format(
            `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
            { trim: 'all' },
          )
          ? moment
              .duration(+r.kickstime)
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
        name: msg.lan.channelbans,
        value: r.channelbans
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: `${msg.lan.channelbanstime}\u200b`,
        value: moment
          .duration(+r.channelbanstime)
          .format(
            `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
            { trim: 'all' },
          )
          ? moment
              .duration(+r.channelbanstime)
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
        name: msg.lan.bans,
        value: r.bans
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: `${msg.lan.banstime}\u200b`,
        value: moment
          .duration(+r.banstime)
          .format(
            `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
            { trim: 'all' },
          )
          ? moment
              .duration(+r.banstime)
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
  buttons: (msg, r) => {
    const warns = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.warns.name)
      .setLabel(msg.lan.warns)
      .setStyle(r.warns ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const warnstime = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.warnstime.name)
      .setLabel(msg.lan.warnstime)
      .setStyle(r.warnstime ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const mutes = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.mutes.name)
      .setLabel(msg.lan.mutes)
      .setStyle(r.mutes ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const mutestime = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.mutestime.name)
      .setLabel(msg.lan.mutestime)
      .setStyle(r.mutestime ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const kicks = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.kicks.name)
      .setLabel(msg.lan.kicks)
      .setStyle(r.kicks ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const kickstime = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.kickstime.name)
      .setLabel(msg.lan.kickstime)
      .setStyle(r.kickstime ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const channelbans = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.channelbans.name)
      .setLabel(msg.lan.channelbans)
      .setStyle(r.channelbans ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const channelbanstime = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.channelbanstime.name)
      .setLabel(msg.lan.channelbanstime)
      .setStyle(r.channelbanstime ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const bans = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.bans.name)
      .setLabel(msg.lan.bans)
      .setStyle(r.bans ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const banstime = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.banstime.name)
      .setLabel(msg.lan.banstime)
      .setStyle(r.banstime ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);

    return [
      [warns, warnstime],
      [mutes, mutestime],
      [kicks, kickstime],
      [channelbans, channelbanstime],
      [bans, banstime],
    ];
  },
};
