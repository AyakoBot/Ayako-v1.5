const Discord = require('discord.js');
const moment = require('moment');
const Builders = require('@discordjs/builders');
require('moment-duration-format');

module.exports = {
  perm: null,
  type: 2,
  setupRequired: false,
  finished: true,
  category: ['moderation'],
  async mmrEmbed(msg, res) {
    res.sort((a, b) => a.uniquetimestamp - b.uniquetimestamp);
    const embed = new Builders.UnsafeEmbedBuilder();
    for (let i = 0; i < res.length; i += 1) {
      const r = res[i];

      embed.addFields({
        name: `${msg.language.number}: \`${r.id}\` | ${
          r.active
            ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
            : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`
        }`,
        value: `${msg.lan.roleid}: <@&${r.roleid}>\n${msg.lan.perms}: ${
          r.perms
            ? `[\`${BigInt(r.perms)}\`](${msg.client.ch.stp(
                msg.client.constants.standard.permissionsViewer,
                {
                  permission: `${BigInt(r.perms)}`,
                },
              )} "${msg.lan.clickview}")`
            : msg.language.none
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
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.roleid,
        value: `<@&${r.roleid}>`,
        inline: false,
      },
      {
        name: msg.lan.perms,
        value: r.perms
          ? `\`${msg.client.ch.permCalc(r.perms, msg.language).join('`, `')}\``
          : msg.language.none,
        inline: false,
      },
      {
        name: msg.lan.mutedurationdefault,
        value: r.mutedurationdefault
          ? `\`${moment
              .duration(r.mutedurationdefault * 60 * 1000)
              .format(
                `Y [${msg.language.time.years}], M [${msg.language.time.months}], W [${msg.language.time.weeks}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
                { trim: 'all' },
              )}\``
          : msg.language.none,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.whitelistedcommands,
        value: `${
          r.whitelistedcommands && r.whitelistedcommands.length
            ? r.whitelistedcommands.map((cmd) => ` \`${cmd}\``)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.blacklistedcommands,
        value: `${
          r.blacklistedcommands && r.blacklistedcommands.length
            ? r.blacklistedcommands.map((cmd) => ` \`${cmd}\``)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.whitelistedusers,
        value: `${
          r.whitelistedusers && r.whitelistedusers.length
            ? r.whitelistedusers.map((id) => ` <@${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.blacklistedusers,
        value: `${
          r.blacklistedusers && r.blacklistedusers.length
            ? r.blacklistedusers.map((id) => ` <@${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.whitelistedroles,
        value: `${
          r.whitelistedroles && r.whitelistedroles.length
            ? r.whitelistedroles.map((id) => ` <@&${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.blacklistedroles,
        value: `${
          r.blacklistedroles && r.blacklistedroles.length
            ? r.blacklistedroles.map((id) => ` <@&${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
    );
    return embed;
  },
  buttons(msg, r) {
    const active = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);

    const roleid = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.roleid.name)
      .setLabel(msg.lan.roleid)
      .setStyle(Discord.ButtonStyle.Secondary);

    const perms = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.perms.name)
      .setLabel(msg.lan.perms)
      .setStyle(r.perms ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Secondary);

    const mutedurationdefault = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.mutedurationdefault.name)
      .setLabel(msg.lan.mutedurationdefault)
      .setStyle(Discord.ButtonStyle.Secondary);

    const whitelistedcommands = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.whitelistedcommands.name)
      .setLabel(msg.lan.whitelistedcommands)
      .setStyle(Discord.ButtonStyle.Primary);

    const blacklistedcommands = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.blacklistedcommands.name)
      .setLabel(msg.lan.blacklistedcommands)
      .setStyle(Discord.ButtonStyle.Primary);

    const whitelistedusers = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.whitelistedusers.name)
      .setLabel(msg.lan.whitelistedusers)
      .setStyle(Discord.ButtonStyle.Primary);

    const blacklistedusers = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.blacklistedusers.name)
      .setLabel(msg.lan.blacklistedusers)
      .setStyle(Discord.ButtonStyle.Primary);

    const whitelistedroles = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.whitelistedroles.name)
      .setLabel(msg.lan.whitelistedroles)
      .setStyle(Discord.ButtonStyle.Primary);

    const blacklistedroles = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.blacklistedroles.name)
      .setLabel(msg.lan.blacklistedroles)
      .setStyle(Discord.ButtonStyle.Primary);

    return [
      [active, roleid, perms, mutedurationdefault],
      [whitelistedcommands, blacklistedcommands],
      [whitelistedusers, blacklistedusers],
      [whitelistedroles, blacklistedroles],
    ];
  },
};
