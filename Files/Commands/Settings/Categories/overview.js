const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  perm: 32n,
  finished: true,
  category: ['none'],
  helpCategory: 'util',
  displayEmbed(msg, r) {
    const small = `${msg.client.textEmotes.small2}${msg.client.textEmotes.small1} ${msg.language.small}`;
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
          typeof r.interactionsmode !== 'boolean' || r.interactionsmode === true ? small : big
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
        name: `${msg.lan.errorchannel}\u200b`,
        value: `${r.errorchannel ? `<#${r.errorchannel}>` : msg.language.none}`,
        inline: false,
      },
    );
    return embed;
  },
  buttons(msg) {
    const prefix = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.prefix.name)
      .setLabel(msg.lan.prefix)
      .setStyle(Discord.ButtonStyle.Primary);
    const interactionsmode = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.interactionsmode.name)
      .setLabel(msg.lan.interactionsmode)
      .setStyle(Discord.ButtonStyle.Secondary);
    const language = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.lan.name)
      .setLabel(msg.lan.lan)
      .setStyle(Discord.ButtonStyle.Secondary);
    const errorchannel = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.errorchannel.name)
      .setLabel(msg.lan.errorchannel)
      .setStyle(Discord.ButtonStyle.Secondary);
    return [[prefix, interactionsmode, language, errorchannel]];
  },
};
