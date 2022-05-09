const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  perm: 32n,
  type: 0,
  finished: true,
  category: ['automation'],
  helpCategory: 'util',
  displayEmbed(msg, r) {
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
        name: msg.lan.approverroleid,
        value: `${
          r.approverroleid && r.approverroleid.length
            ? r.approverroleid.map((id) => ` <@&${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.anon,
        value: r.anon
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.novoteusers,
        value: `${
          r.novoteusers && r.novoteusers.length
            ? r.novoteusers.map((id) => ` <@${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.novoteroles,
        value: `${
          r.novoteroles && r.novoteroles.length
            ? r.novoteroles.map((id) => ` <@&${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.nosendusers,
        value: `${
          r.nosendusers && r.nosendusers.length
            ? r.nosendusers.map((id) => ` <@${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.nosendroles,
        value: `${
          r.nosendroles && r.nosendroles.length
            ? r.nosendroles.map((id) => ` <@&${id}>`)
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
    const channelid = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.channelid.name)
      .setLabel(msg.lan.channelid)
      .setStyle(Discord.ButtonStyle.Primary);
    const anon = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.anon.name)
      .setLabel(msg.lan.anon)
      .setStyle(r.anon ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Secondary);
    const novoteusers = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.novoteusers.name)
      .setLabel(msg.lan.novoteusers)
      .setStyle(Discord.ButtonStyle.Primary);
    const novoteroles = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.novoteroles.name)
      .setLabel(msg.lan.novoteroles)
      .setStyle(Discord.ButtonStyle.Primary);
    const nosendusers = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.nosendusers.name)
      .setLabel(msg.lan.nosendusers)
      .setStyle(Discord.ButtonStyle.Primary);
    const nosendroles = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.nosendroles.name)
      .setLabel(msg.lan.nosendroles)
      .setStyle(Discord.ButtonStyle.Primary);
    const approverroleid = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.approverroleid.name)
      .setLabel(msg.lan.approverroleid)
      .setStyle(Discord.ButtonStyle.Primary);
    return [
      [active],
      [channelid, approverroleid, anon],
      [novoteusers, novoteroles, nosendusers, nosendroles],
    ];
  },
};
