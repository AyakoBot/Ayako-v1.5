const Discord = require('discord.js');

module.exports = {
  perm: 268435456n,
  type: 2,
  setupRequired: false,
  finished: true,
  category: ['automation'],
  childOf: 'reactionroles',
  noArrows: true,
  mmrEmbed: (msg, rows) => {
    const embed = new Discord.UnsafeEmbed();

    rows.forEach((row) => {
      const emote = msg.client.emojis.cache.get(row.emoteid);

      embed.addFields({
        name: `${emote || msg.client.textEmotes.warning}`,
        value: `${msg.language.affected}: ${row.roles ? row.roles.length : '0'} ${
          msg.language.roles
        }`,
        inline: true,
      });
    });

    return embed;
  },
  displayEmbed: (msg, r) => {
    const embed = new Discord.UnsafeEmbed();
    const emote = msg.client.emojis.cache.get(r.emoteid);

    embed.addFields(
      {
        name: msg.lanSettings.active,
        value: r.active
          ? `${msg.client.textEmotes.enabled} ${msg.language.enabled}`
          : `${msg.client.textEmotes.disabled} ${msg.language.disabled}`,
        inline: false,
      },
      {
        name: msg.lan.emoteid,
        value: `${emote || msg.language.none}`,
        inline: true,
      },
      {
        name: msg.lan.roles,
        value: `${
          r.roles && r.roles.length ? r.roles.map((id) => ` <@&${id}>`) : msg.language.none
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

    const emoteid = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.emoteid.name)
      .setLabel(msg.lan.emoteid)
      .setStyle(Discord.ButtonStyle.Primary);

    const roles = new Discord.UnsafeButtonComponent()
      .setCustomId(msg.lan.edit.roles.name)
      .setLabel(msg.lan.roles)
      .setStyle(Discord.ButtonStyle.Primary);

    return [[active], [emoteid], [roles]];
  },
  manualResGetter: async (msg) => {
    if (!msg.args[3]) {
      const res = await msg.client.ch.query(`SELECT * FROM rrreactions WHERE guildid = $1;`, [
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

    const res = await msg.client.ch.query(`SELECT * FROM rrreactions WHERE messagelink = $1;`, [
      baseRes.rows[0].messagelink,
    ]);

    return res;
  },
};
