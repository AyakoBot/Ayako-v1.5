const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  perm: 268435456n,
  type: 2,
  setupRequired: false,
  finished: true,
  category: ['automation'],
  childOf: 'reactionsettings',
  noArrows: true,
  canBe1Row: true,
  mmrEmbed: (msg, rows) => {
    const embed = new Builders.UnsafeEmbedBuilder();

    rows.forEach((row) => {
      let emote;
      if (Number.isNaN(Number(row.emoteid))) {
        emote = row.emoteid;
      } else {
        emote = msg.client.emojis.cache.get(row.emoteid);
      }

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
    const embed = new Builders.UnsafeEmbedBuilder();

    let emote;
    if (Number.isNaN(+r.emoteid)) {
      emote = r.emoteid;
    } else {
      emote = msg.client.emojis.cache.get(r.emoteid);
    }

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
    const active = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);

    const emoteid = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.emoteid.name)
      .setLabel(msg.lan.emoteid)
      .setStyle(Discord.ButtonStyle.Primary);

    const roles = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.roles.name)
      .setLabel(msg.lan.roles)
      .setStyle(Discord.ButtonStyle.Primary);

    return [[active], [emoteid], [roles]];
  },
  manualResGetter: async (msg) => {
    if (!msg.args[2]) {
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

    const res = await msg.client.ch.query(
      `SELECT * FROM rrreactions WHERE messagelink = $1 AND guildid = $2;`,
      [baseRes.rows[0].messagelink, msg.guild.id],
    );

    if (res && res.rowCount) return res;
    return null;
  },
  doMoreThings: async (msg, insertedValues, assigner, newRes, oldRes) => {
    if (!newRes.rows || !oldRes.rows) return;

    const [, , message] = await linkToIDs(msg, newRes.rows[0].messagelink);

    const newRow = newRes.rows[0];
    const oldRow = oldRes.rows[0];

    if (message) {
      if (newRow.active === false && oldRow.active === true) {
        message.reactions.cache
          .get(oldRow.emoteid)
          ?.remove()
          .catch(() => {});
      }

      if (oldRow.emoteid !== newRow.emoteid) {
        message.reactions.cache
          .get(oldRow.emoteid)
          ?.remove()
          .catch(() => {});

        message.react(newRow.emoteid).catch(() => {});
      }

      if (newRow.active === true && oldRow.active === false) {
        message.react(newRow.emoteid).catch(() => {});
      }
    }
  },
};

const linkToIDs = async (msg, link) => {
  const [, , , guildid, channelid, messageid] = link.split(/\/+/);

  const guild = msg.client.guilds.cache.get(guildid);
  const channel = guild ? guild.channels.cache.get(channelid) : null;
  const message = channel ? await channel.messages.fetch(messageid).catch(() => {}) : null;

  return [guild, channel, message];
};
