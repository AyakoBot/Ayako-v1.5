const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  perm: 268435456n,
  type: 2,
  finished: true,
  category: ['automation'],
  displayEmbed(msg, r) {
    const embed = new Builders.UnsafeEmbedBuilder().addFields(
      {
        name: `${msg.lanSettings.active}`,
        value: `${
          r.active
            ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
            : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`
        }`,
        inline: false,
      },
      {
        name: `${msg.lan.botRole}`,
        value: `${
          r.botroleid && r.botroleid.length
            ? r.botroleid.map((id) => ` <@&${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: `${msg.lan.userRole}`,
        value: `${
          r.userroleid && r.userroleid.length
            ? r.userroleid.map((id) => ` <@&${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: `${msg.lan.allRole}`,
        value: `${
          r.allroleid && r.allroleid.length
            ? r.allroleid.map((id) => ` <@&${id}>`)
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
    const bot = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.botRole.name)
      .setLabel(msg.lan.botRole)
      .setStyle(Discord.ButtonStyle.Primary);
    const user = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.userRole.name)
      .setLabel(msg.lan.userRole)
      .setStyle(Discord.ButtonStyle.Primary);
    const all = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.allRole.name)
      .setLabel(msg.lan.allRole)
      .setStyle(Discord.ButtonStyle.Primary);
    return [[active], [bot, user, all]];
  },
};
