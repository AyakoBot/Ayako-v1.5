const Discord = require('discord.js');

module.exports = {
  perm: 268435456n,
  type: 2,
  setupRequired: false,
  finished: true,
  category: ['automation'],
  mmrEmbed(msg, res) {
    const embed = new Discord.UnsafeEmbed();

    res.rows.forEach((row) => {
      embed.addFields({
        name: row.name,
        value: `${
          row.active
            ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
            : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`
        } ${msg.client.ch.stp(msg.client.constants.standard.discordUrlDB, {
          guildid: row.guildid,
          channelid: row.channelid,
          msgid: row.msgid,
        })}`,
        inline: true,
      });
    });

    return embed;
  },
  displayEmbed(msg, r) {
    const embed = new Discord.UnsafeEmbed();

    embed.addFields(
      {
        name: msg.language.message,
        value: msg.client.ch.stp(msg.client.constants.standard.discordUrlDB, {
          guildid: r.guildid,
          channelid: r.channelid,
          msgid: r.msgid,
        }),
        inline: false,
      },
      {
        name: msg.lan.name,
        value: r.active
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.onlyone,
        value: r.onlyone
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: true,
      },
      {
        name: msg.lan.anyroles,
        value: `${
          r.anyroles && r.anyroles.length ? r.anyroles.map((id) => ` <@&${id}>`) : msg.language.none
        }`,
        inline: false,
      },
    );

    return embed;
  },
  buttons(msg, r) {
    const active = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);

    const name = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.name.name)
      .setLabel(msg.lan.name)
      .setStyle(Discord.ButtonStyle.Primary);

    const messagelink = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.messagelink.name)
      .setLabel(msg.lan.messagelink)
      .setStyle(Discord.ButtonStyle.Primary);

    const onlyone = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.onlyone.name)
      .setLabel(msg.lan.onlyone)
      .setStyle(r.onlyone ? Discord.ButtonStyle.Primary : Discord.ButtonStyle.Secondary);

    const anyroles = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.anyroles.name)
      .setLabel(msg.lan.anyroles)
      .setStyle(Discord.ButtonStyle.Secondary);

    return [[active], [name, messagelink], [onlyone, anyroles]];
  },
};
