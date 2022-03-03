const Discord = require('discord.js');

module.exports = {
  perm: 32n,
  type: 2,
  setupRequired: false,
  finished: true,
  category: ['automation'],
  mmrEmbed(msg, res) {
    const embed = new Discord.UnsafeEmbed();
    for (let i = 0; i < res.length; i += 1) {
      const r = res[i];
      embed.addFields([
        {
          name: `${msg.language.number}: \`${r.id}\` | ${
            r.active
              ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
              : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`
          }`,
          value: `${msg.language.affected}: ${r.roles ? r.roles.length : 0}\n${
            msg.language.name
          }: ${r.name}`,
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
        name: msg.lan.name,
        value: `${r.name ? `\`${r.name}\`` : '\u200b'}`,
        inline: false,
      },
      {
        name: msg.lan.onlyone,
        value: r.onlyone
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.roles,
        value: `${
          r.roles && r.roles.length ? r.roles.map((id) => ` <@&${id}>`) : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.blacklistedusers,
        value: `${
          r.blacklistedusers && r.blacklistedusers.length
            ? r.blacklistedusers.map((id) => ` <@${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.blacklistedroles,
        value: `${
          r.blacklistedroles && r.blacklistedroles.length
            ? r.blacklistedroles.map((id) => ` <@&${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.whitelistedusers,
        value: `${
          r.whitelistedusers && r.whitelistedusers.length
            ? r.whitelistedusers.map((id) => ` <@${id}>`)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.whitelistedroles,
        value: `${
          r.whitelistedroles && r.whitelistedroles.length
            ? r.whitelistedroles.map((id) => ` <@&${id}>`)
            : msg.language.none
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
    const name = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.name.name)
      .setLabel(msg.lan.name)
      .setStyle(Discord.ButtonStyle.Primary);
    const onlyone = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.onlyone.name)
      .setLabel(msg.lan.onlyone)
      .setStyle(r.onlyone ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);
    const blacklistedusers = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.blacklistedusers.name)
      .setLabel(msg.lan.blacklistedusers)
      .setStyle(Discord.ButtonStyle.Primary);
    const blacklistedroles = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.blacklistedroles.name)
      .setLabel(msg.lan.blacklistedroles)
      .setStyle(Discord.ButtonStyle.Primary);
    const whitelistedusers = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.whitelistedusers.name)
      .setLabel(msg.lan.whitelistedusers)
      .setStyle(Discord.ButtonStyle.Primary);
    const whitelistedroles = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.whitelistedroles.name)
      .setLabel(msg.lan.whitelistedroles)
      .setStyle(Discord.ButtonStyle.Primary);
    const roles = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.roles.name)
      .setLabel(msg.lan.roles)
      .setStyle(Discord.ButtonStyle.Primary);
    return [
      [active],
      [onlyone, name, roles],
      [blacklistedusers, blacklistedroles],
      [whitelistedusers, whitelistedroles],
    ];
  },
};
