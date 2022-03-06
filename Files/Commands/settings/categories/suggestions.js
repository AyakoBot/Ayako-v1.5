const Discord = require('discord.js');

module.exports = {
  perm: 32n,
  type: 0,
  finished: false,
  category: ['automation'],
  displayEmbed(msg, r) {
    const embed = new Discord.UnsafeEmbed().addFields(...[
      {
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
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
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.bluserid,
        value: `${
          r.bluserid && r.bluserid.length ? r.bluserid.map((id) => ` <@${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.blroleid,
        value: `${
          r.blroleid && r.blroleid.length ? r.blroleid.map((id) => ` <@&${id}>`) : msg.language.none
        }`,
        inline: false,
      },
    ]);
    return embed;
  },
  buttons(msg, r) {
    const active = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const channelid = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.channelid.name)
      .setLabel(msg.lan.channelid)
      .setStyle(Discord.ButtonStyle.Primary);
    const bluserid = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.bluserid.name)
      .setLabel(msg.lan.bluserid)
      .setStyle(Discord.ButtonStyle.Primary);
    const blroleid = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.blroleid.name)
      .setLabel(msg.lan.blroleid)
      .setStyle(Discord.ButtonStyle.Primary);
    const approverroleid = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.approverroleid.name)
      .setLabel(msg.lan.approverroleid)
      .setStyle(Discord.ButtonStyle.Primary);
    return [[active], [channelid, approverroleid], [blroleid, bluserid]];
  },
};
