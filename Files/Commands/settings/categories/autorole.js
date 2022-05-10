const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  perm: 268435456n,
  type: 2,
  finished: true,
  category: ['automation'],
  helpCategory: 'roles',
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
        name: `${msg.lan.botroleid}`,
        value: `${
          r.botroleid && r.botroleid.length
            ? r.botroleid.map((id) => ` <@&${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: `${msg.lan.userroleid}`,
        value: `${
          r.userroleid && r.userroleid.length
            ? r.userroleid.map((id) => ` <@&${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: `${msg.lan.allroleid}`,
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
      .setCustomId(msg.lan.edit.botroleid.name)
      .setLabel(msg.lan.botroleid)
      .setStyle(Discord.ButtonStyle.Primary);
    const user = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.userroleid.name)
      .setLabel(msg.lan.userroleid)
      .setStyle(Discord.ButtonStyle.Primary);
    const all = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.allroleid.name)
      .setLabel(msg.lan.allroleid)
      .setStyle(Discord.ButtonStyle.Primary);
    return [[active], [bot, user, all]];
  },
};
