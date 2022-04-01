const Discord = require('discord.js');
const moment = require('moment');
const Builders = require('@discordjs/builders');
require('moment-duration-format');

module.exports = {
  perm: null,
  type: 1,
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
        value: `${msg.lan.deletetimeout}: ${moment
          .duration(r.cooldown * 1000)
          .format(`s [${msg.language.time.seconds}]`)}\n${msg.lan.commands}: ${
          r.commands ? `${r.commands.map((o) => `\`${o}\``)}` : msg.language.none
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
        name: msg.lan.commands,
        value: `${r.commands ? r.commands.map((o) => `\`${o}\``) : msg.language.none}`,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.deletecommand,
        value: r.deletecommand
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: msg.lan.deletereply,
        value: r.deletereply
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.deletetimeout,
        value: r.deletetimeout
          ? `\`${moment
              .duration(r.deletetimeout * 1000)
              .format(`s [${msg.language.time.seconds}]`)}\``
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

    const commands = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.commands.name)
      .setLabel(msg.lan.commands)
      .setStyle(Discord.ButtonStyle.Primary);

    const deletecommand = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.deletecommand.name)
      .setLabel(msg.lan.deletecommand)
      .setStyle(r.deletecommand ? Discord.ButtonStyle.Secondary : Discord.ButtonStyle.Danger);

    const deletereply = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.deletereply.name)
      .setLabel(msg.lan.deletereply)
      .setStyle(r.deletereply ? Discord.ButtonStyle.Secondary : Discord.ButtonStyle.Danger);

    const deletetimeout = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.deletetimeout.name)
      .setLabel(msg.lan.deletetimeout)
      .setStyle(Discord.ButtonStyle.Primary);

    return [[active], [commands], [deletecommand, deletereply], [deletetimeout]];
  },
};
