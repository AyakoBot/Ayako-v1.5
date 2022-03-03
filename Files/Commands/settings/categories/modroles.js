const Discord = require('discord.js');
// TODO: add default mute time when not provided

module.exports = {
  perm: null,
  type: 2,
  setupRequired: false,
  finished: true,
  category: ['moderation'],
  async mmrEmbed(msg, res) {
    res.sort((a, b) => a.uniquetimestamp - b.uniquetimestamp);
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
          value: `${msg.lan.roleid}: <@&${r.roleid}>\n${msg.lan.perms}: ${
            r.perms
              ? `[\`${BigInt(r.perms)}\`](${msg.client.ch.stp(
                  msg.client.constants.standard.permissionsViewer,
                  {
                    permission: `${BigInt(r.perms)}`,
                  },
                )} "${msg.lan.clickview}")`
              : msg.language.none
          }`,
          inline: true,
        },
      ]);
    }
    return embed;
  },
  displayEmbed(msg, r) {
    const embed = new Discord.UnsafeEmbed();
    embed.addFields([
      {
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.constants.emotes.enabled} ${msg.language.enabled}`
          : `${msg.client.constants.emotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.roleid,
        value: `<@&${r.roleid}>`,
        inline: false,
      },
      {
        name: msg.lan.perms,
        value: r.perms
          ? `\`${msg.client.ch.permCalc(r.perms, msg.language).join('`, `')}\``
          : msg.language.none,
        inline: false,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: false,
      },
      {
        name: msg.lan.whitelistedcommands,
        value: `${
          r.whitelistedcommands && r.whitelistedcommands.length
            ? r.whitelistedcommands.map((cmd) => ` \`${cmd}\``)
            : msg.language.none
        }`,
        inline: false,
      },
      {
        name: msg.lan.blacklistedcommands,
        value: `${
          r.blacklistedcommands && r.blacklistedcommands.length
            ? r.blacklistedcommands.map((cmd) => ` \`${cmd}\``)
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
        name: msg.lan.blacklistedusers,
        value: `${
          r.blacklistedusers && r.blacklistedusers.length
            ? r.blacklistedusers.map((id) => ` <@${id}>`)
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
      {
        name: msg.lan.blacklistedroles,
        value: `${
          r.blacklistedroles && r.blacklistedroles.length
            ? r.blacklistedroles.map((id) => ` <@&${id}>`)
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

    const roleid = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.roleid.name)
      .setLabel(msg.lan.roleid)
      .setStyle(Discord.ButtonStyle.Secondary);

    const perms = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.perms.name)
      .setLabel(msg.lan.perms)
      .setStyle(r.perms ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Secondary);

    const whitelistedcommands = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.whitelistedcommands.name)
      .setLabel(msg.lan.whitelistedcommands)
      .setStyle(Discord.ButtonStyle.Primary);

    const blacklistedcommands = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.blacklistedcommands.name)
      .setLabel(msg.lan.blacklistedcommands)
      .setStyle(Discord.ButtonStyle.Primary);

    const whitelistedusers = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.whitelistedusers.name)
      .setLabel(msg.lan.whitelistedusers)
      .setStyle(Discord.ButtonStyle.Primary);

    const blacklistedusers = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.blacklistedusers.name)
      .setLabel(msg.lan.blacklistedusers)
      .setStyle(Discord.ButtonStyle.Primary);

    const whitelistedroles = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.whitelistedroles.name)
      .setLabel(msg.lan.whitelistedroles)
      .setStyle(Discord.ButtonStyle.Primary);

    const blacklistedroles = new Discord.ButtonComponent()
      .setCustomId(msg.lan.edit.blacklistedroles.name)
      .setLabel(msg.lan.blacklistedroles)
      .setStyle(Discord.ButtonStyle.Primary);

    return [
      [active, roleid, perms],
      [whitelistedcommands, blacklistedcommands],
      [whitelistedusers, blacklistedusers],
      [whitelistedroles, blacklistedroles],
    ];
  },
};
