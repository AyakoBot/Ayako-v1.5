/* eslint-disable no-nested-ternary */

const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  perm: 32n,
  finished: true,
  category: ['none'],
  displayEmbed(msg, r) {
    const small = `${msg.client.textEmotes.small1}${msg.client.textEmotes.small2} ${msg.language.small}`;
    const big = `${msg.client.textEmotes.big} ${msg.language.big}`;
    if (r.prefix && r.prefix.startsWith('{"') && r.prefix.endsWith('"}')) {
      r.prefix = r.prefix.slice(2, r.prefix.length - 2);
    }
    const embed = new Builders.UnsafeEmbedBuilder().addFields(
      {
        name: msg.lan.prefix,
        value: `\`${msg.client.constants.standard.prefix}\` ${r.prefix ? `/ \`${r.prefix}\`` : ''}`,
        inline: true,
      },
      {
        name: msg.lan.interactionsmode,
        value: `${
          r.interactionsmode === false || r.interactionsmode === true
            ? r.interactionsmode === true
              ? small
              : big
            : small
        }`,
        inline: true,
      },
      {
        name: msg.lan.lan,
        value: `${msg.client.textEmotes.flags[r.lan]} | ${msg.language.languages[r.lan].name} | ${
          msg.language.languages[r.lan].status
        }`,
        inline: true,
      },
      {
        name: `${msg.lan.streamroles}\u200b`,
        value: `${
          r.streamroles && r.streamroles.length
            ? r.streamroles.map((id) => ` <@&${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
    );
    return embed;
  },
  buttons(msg) {
    const prefix = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.prefix.name)
      .setLabel(msg.lan.prefix)
      .setStyle(Discord.ButtonStyle.Primary);
    const interactionsmode = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.interactionsmode.name)
      .setLabel(msg.lan.interactionsmode)
      .setStyle(Discord.ButtonStyle.Secondary);
    const language = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.lan.name)
      .setLabel(msg.lan.lan)
      .setStyle(Discord.ButtonStyle.Secondary);
    const streamroles = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.streamroles.name)
      .setLabel(msg.lan.streamroles)
      .setStyle(Discord.ButtonStyle.Secondary);
    return [[prefix, interactionsmode, language, streamroles]];
  },
};
