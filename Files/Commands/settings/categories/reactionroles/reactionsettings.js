const Discord = require('discord.js');

module.exports = {
  perm: 268435456n,
  type: 2,
  setupRequired: false,
  finished: true,
  category: ['automation'],
  childOf: 'reactionroles',
  displayParentOnly: true,
  mmrEmbed: (msg, rows) => {
    const embed = new Discord.UnsafeEmbed();

    rows.forEach((row) => {
      embed.addFields({
        name: row.name,
        value: `${
          row.active
            ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
            : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`
        } ${row.messagelink}`,
        inline: true,
      });
    });

    return embed;
  },
  displayEmbed: (msg, r) => {
    const embed = new Discord.UnsafeEmbed();

    embed.addFields(
      {
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.name,
        value: r.name,
        inline: false,
      },
      {
        name: msg.lan.messagelink,
        value: r.messagelink,
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
  buttons: (msg, r) => {
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
  doMoreThings: async (msg, insertedValues, changedKey, res, oldRes) => {
    if (res?.rows?.rowCount === oldRes?.rows?.rowCount) {
      res.rows.forEach((newRow) => {
        const oldRow =
          oldRes.rows[res.rows.findIndex((r) => r.uniquetimestamp === newRow.uniquetimestamp)];

        if (newRow.messagelink !== oldRow.messagelink) {
          msg.client.ch.query(`UPDATE rrbuttons SET messagelink = $1 WHERE messagelink = $2;`, [
            newRow.messagelink,
            oldRow.messagelink,
          ]);

          msg.client.ch.query(`UPDATE rrreactions SET messagelink = $1 WHERE messagelink = $2;`, [
            newRow.messagelink,
            oldRow.messagelink,
          ]);
        }
      });
    }
  },
  manualResGetter: async (msg) => {
    if (!msg.args[2]) {
      const res = await msg.client.ch.query(`SELECT * FROM rrsettings WHERE guildid = $1;`, [
        msg.guild.id,
      ]);
      if (res && res.rowCount) return res;
      return null;
    }

    const baseRes = await msg.client.ch.query(
      `SELECT * FROM rrsettings WHERE guildid = $1 AND messagelink = $2;`,
      [msg.guild.id, msg.args[2]],
    );

    if (!baseRes || !baseRes.rowCount) return null;
    return baseRes;
  },
};
