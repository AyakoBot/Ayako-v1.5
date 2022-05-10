const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  perm: 8192n,
  type: 1,
  setupRequired: false,
  finished: true,
  category: ['automation', 'none'],
  helpCategory: 'util',
  mmrEmbed(msg, res) {
    const embed = new Builders.UnsafeEmbedBuilder();
    for (let i = 0; i < res.length; i += 1) {
      const r = res[i];
      embed.addFields({
        name: `${msg.language.number}: \`${r.id}\` | ${msg.lan.commands}: ${r.commands.map(
          (c) => ` \`${c}\``,
        )} | ${
          r.active
            ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
            : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`
        }`,
        value: `${msg.lan.channels}: ${
          r.channels && r.channels.length ? r.channels.map((c) => ` <#${c}>`) : msg.language.none
        }`,
        inline: true,
      });
    }
    return embed;
  },
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
        name: msg.lan.commands,
        value: `${
          r.commands && r.commands.length ? r.commands.map((id) => ` \`${id}\``) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.channels,
        value: `${
          r.channels && r.channels.length ? r.channels.map((id) => ` <#${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
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
        name: msg.lan.bluserid,
        value: `${
          r.bluserid && r.bluserid.length ? r.bluserid.map((id) => ` <@${id}>`) : msg.language.none
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
      {
        name: msg.lan.blroleid,
        value: `${
          r.blroleid && r.blroleid.length ? r.blroleid.map((id) => ` <@&${id}>`) : msg.language.none
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
    const commands = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.commands.name)
      .setLabel(msg.lan.commands)
      .setStyle(Discord.ButtonStyle.Secondary);
    const channels = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.channels.name)
      .setLabel(msg.lan.channels)
      .setStyle(Discord.ButtonStyle.Secondary);
    const bpuserid = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.bpuserid.name)
      .setLabel(msg.lan.bpuserid)
      .setStyle(Discord.ButtonStyle.Primary);
    const bluserid = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.bluserid.name)
      .setLabel(msg.lan.bluserid)
      .setStyle(Discord.ButtonStyle.Primary);
    const bproleid = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.bproleid.name)
      .setLabel(msg.lan.bproleid)
      .setStyle(Discord.ButtonStyle.Primary);
    const blroleid = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.blroleid.name)
      .setLabel(msg.lan.blroleid)
      .setStyle(Discord.ButtonStyle.Primary);
    return [[active], [commands, channels], [bpuserid, bluserid, bproleid, blroleid]];
  },
};
