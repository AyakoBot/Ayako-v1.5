/* eslint-disable no-nested-ternary */

const Discord = require('discord.js');

module.exports = {
  perm: 32n,
  finished: true,
  category: ['none'],
  displayEmbed(msg, r) {
    const small = `${msg.client.constants.emotes.small} ${msg.language.small}`;
    const big = `${msg.client.constants.emotes.big} ${msg.language.big}`;
    if (r.prefix && r.prefix.startsWith('{"') && r.prefix.endsWith('"}')) {
      r.prefix = r.prefix.slice(2, r.prefix.length - 2);
    }
    const embed = new Discord.UnsafeEmbed().addFieldss([
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
        value: `${msg.client.constants.emotes.flags[r.lan]} | ${
          msg.language.languages[r.lan].name
        } | ${msg.language.languages[r.lan].status}`,
        inline: true,
      },
    ]);
    return embed;
  },
  buttons(msg) {
    const prefix = new Discord.Button()
      .setCustomId(msg.lan.edit.prefix.name)
      .setLabel(msg.lan.prefix)
      .setStyle(Discord.ButtonStyle.Primary);
    const interactionsmode = new Discord.Button()
      .setCustomId(msg.lan.edit.interactionsmode.name)
      .setLabel(msg.lan.interactionsmode)
      .setStyle(Discord.ButtonStyle.Secondary);
    const language = new Discord.Button()
      .setCustomId(msg.lan.edit.lan.name)
      .setLabel(msg.lan.lan)
      .setStyle(Discord.ButtonStyle.Secondary);
    return [[prefix, interactionsmode, language]];
  },
};
