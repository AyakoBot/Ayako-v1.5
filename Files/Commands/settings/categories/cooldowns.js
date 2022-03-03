const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  perm: 8192n,
  type: 1,
  setupRequired: false,
  finished: false,
  category: ['automation'],
  mmrEmbed(msg, res) {
    const embed = new Discord.UnsafeEmbed();
    for (let i = 0; i < res.length; i += 1) {
      const r = res[i];
      embed.addFields([
        {
          name: `${msg.language.number}: \`${r.id}\` | ${msg.language.command}: \`${
            r.command
          }\` | ${
            r.active
              ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
              : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`
          }`,
          value: `${msg.language.cooldown}: ${moment
            .duration(r.cooldown * 1000)
            .format(`s [${msg.language.time.seconds}]`)} `,
          inline: true,
        },
      ]);
    }
    return embed;
  },
  displayEmbed(msg, r) {
    const embed = new Discord.UnsafeEmbed().addFields([
      {
        name: msg.lanSettings.active,
        value: r.active
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
        name: msg.lan.command,
        value: r.command ? `\`${r.command}\`` : msg.language.none,
        inline: true,
      },
      {
        name: msg.lan.cooldown,
        value: r.cooldown ? `\`${r.cooldown} ${msg.language.time.seconds}\`` : msg.language.none,
        inline: true,
      },
      {
        name: msg.language.number,
        value: r.id ? `\`${r.id}\`` : msg.language.none,
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.activechannelid,
        value: `${
          r.activechannelid && r.activechannelid.length
            ? r.activechannelid.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.bpchannelid,
        value: `${
          r.bpchannelid && r.bpchannelid.length
            ? r.bpchannelid.map((id) => ` <#${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.bpuserid,
        value: `${
          r.bpuserid && r.bpuserid.length ? r.bpuserid.map((id) => ` <@${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.bproleid,
        value: `${
          r.bproleid && r.bproleid.length ? r.bproleid.map((id) => ` <@&${id}>`) : msg.language.none
        }`,
        inline: false,
      },
    ]);
    return embed;
  },
  buttons(msg, r) {
    const active = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const command = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.command.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.command.replace(/\*/g, ''), {
          amount: r.command ? `\`${r.command}\`` : '--',
        }),
      )
      .setStyle(Discord.ButtonStyle.Secondary);
    const cooldown = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.cooldown.name)
      .setLabel(
        msg.client.ch.stp(msg.lan.cooldown.replace(/\*/g, ''), {
          amount: r.cooldown ? `${r.cooldown} ${msg.language.time.seconds}` : '--',
        }),
      )
      .setStyle(Discord.ButtonStyle.Secondary);
    const achannel = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.activechannelid.name)
      .setLabel(msg.lan.activechannelid)
      .setStyle(Discord.ButtonStyle.Primary);
    const bchannel = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.bpchannelid.name)
      .setLabel(msg.lan.bpchannelid)
      .setStyle(Discord.ButtonStyle.Primary);
    const user = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.bpuserid.name)
      .setLabel(msg.lan.bpuserid)
      .setStyle(Discord.ButtonStyle.Primary);
    const role = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.bproleid.name)
      .setLabel(msg.lan.bproleid)
      .setStyle(Discord.ButtonStyle.Primary);
    return [[active], [command, cooldown], [achannel, bchannel, user, role]];
  },
};
