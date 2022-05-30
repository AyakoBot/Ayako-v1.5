const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  perm: 8n,
  type: 0,
  setupRequired: false,
  finished: true,
  category: ['auto-moderation'],
  helpCategory: 'mod',
  async mmrEmbed(msg, res) {
    const embed = new Builders.UnsafeEmbedBuilder().setDescription(
      msg.client.ch.stp(msg.lan.description, { prefix: msg.client.constants.standard.prefix }),
    );
    for (let i = 0; i < res.length; i += 1) {
      const r = res[i];
      const punishment = r.punishment ? msg.language.autopunish[r.punishment] : msg.language.none;
      embed.addFields({
        name: `${msg.language.number}: \`${r.id}\` | ${
          r.active
            ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
            : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`
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
    const embed = new Builders.UnsafeEmbedBuilder();
    embed.addFields(
      {
        name: `${msg.lanSettings.active}\u200b`,
        value: r.active
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: '\u200b',
        value: msg.lan.punishmentSettings,
        inline: false,
      },
      {
        name: '\u200b',
        value: msg.client.ch.stp(msg.lan.edit.warnamount.name, {
          warnamount: r.warnamount ? r.warnamount : '--',
        }),
        inline: false,
      },
      {
        name: `${msg.lan.punishment}\u200b`,
        value: r.punishment ? msg.language.autopunish[r.punishment] : msg.language.none,
        inline: false,
      },
      {
        name: `${msg.lan.duration}\u200b`,
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
        name: `${msg.lan.addroles}\u200b`,
        value: `${
          r.addroles && r.addroles.length ? r.addroles.map((id) => ` <@&${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: `${msg.lan.removeroles}\u200b`,
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
        name: `${msg.lan.confirmationreq}\u200b`,
        value: r.confirmationreq
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: `${msg.lan.punishmentawaittime}\u200b`,
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
    const active = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const warnamount = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.warnamount.name)
      .setLabel(
        msg.client.ch
          .stp(msg.lan.edit.warnamount.name, { warnamount: r.warnamount ? r.warnamount : '--' })
          .replace(/\**/g, ''),
      )
      .setStyle(Discord.ButtonStyle.Secondary);
    const punishment = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.punishment.name)
      .setLabel(msg.lan.punishment)
      .setStyle(r.isvarying ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Secondary);
    const duration = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.duration.name)
      .setLabel(msg.lan.edit.duration.name)
      .setStyle(Discord.ButtonStyle.Primary);
    const addroles = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.addroles.name)
      .setLabel(msg.lan.addroles)
      .setStyle(Discord.ButtonStyle.Primary);
    const removeroles = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.removeroles.name)
      .setLabel(msg.lan.removeroles)
      .setStyle(Discord.ButtonStyle.Primary);
    const confirmationreq = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.confirmationreq.name)
      .setLabel(msg.lan.confirmationreq)
      .setStyle(r.confirmationreq ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Secondary);
    const punishmentawaittime = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.punishmentawaittime.name)
      .setLabel(msg.lan.punishmentawaittime)
      .setStyle(r.isvarying ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Secondary);

    return [
      [active],
      [warnamount, punishment, duration],
      [addroles, removeroles],
      [confirmationreq, punishmentawaittime],
    ];
  },
};
