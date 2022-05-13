const Builders = require('@discordjs/builders');
const Discord = require('discord.js');

module.exports = {
  perm: 32n,
  type: 1,
  finished: true,
  category: ['automation'],
  helpCategory: 'util',
  tutorial: 'https://youtu.be/NysN4BjXhA4',
  tutorialNote: true,
  async displayEmbed(msg, r) {
    const customEmbed = await embedName(msg, r);

    const embed = new Builders.UnsafeEmbedBuilder().addFields(
      {
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.channelid,
        value: `${r.channelid ? `<#${r.channelid}>` : msg.language.none}`,
        inline: false,
      },
      {
        name: msg.lan.pingusers,
        value: `${
          r.pingusers && r.pingusers.length
            ? r.pingusers.map((id) => ` <@${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.pingroles,
        value: `${
          r.pingroles && r.pingroles.length
            ? r.pingroles.map((id) => ` <@&${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.embed,
        value: customEmbed ? customEmbed.name : msg.language.default,
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
    const channelid = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.channelid.name)
      .setLabel(msg.lan.channelid)
      .setStyle(Discord.ButtonStyle.Primary);
    const pingusers = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.pingusers.name)
      .setLabel(msg.lan.pingusers)
      .setStyle(Discord.ButtonStyle.Primary);
    const pingroles = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.pingroles.name)
      .setLabel(msg.lan.pingroles)
      .setStyle(Discord.ButtonStyle.Primary);
    const embed = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.embed.name)
      .setLabel(msg.lan.embed)
      .setStyle(Discord.ButtonStyle.Primary);
    return [[active], [channelid], [pingusers, pingroles], [embed]];
  },
};

const embedName = async (msg, r) => {
  const res = await msg.client.ch.query(
    'SELECT * FROM customembeds WHERE uniquetimestamp = $1 AND guildid = $2;',
    [r.embed, msg.guild.id],
  );

  if (res && res.rowCount) return res.rows[0];
  return null;
};
