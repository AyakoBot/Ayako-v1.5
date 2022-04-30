const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  perm: 268435456n,
  type: 2,
  setupRequired: false,
  finished: true,
  category: ['automation'],
  childOf: 'reactionsettings',
  displayParentOnly: true,
  mmrEmbed: (msg, rows) => {
    const embed = new Builders.UnsafeEmbedBuilder();

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
    const embed = new Builders.UnsafeEmbedBuilder();

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
    const active = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.active.name)
      .setLabel(msg.lanSettings.active)
      .setStyle(r.active ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Danger);

    const name = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.name.name)
      .setLabel(msg.lan.name)
      .setStyle(Discord.ButtonStyle.Primary);

    const messagelink = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.messagelink.name)
      .setLabel(msg.lan.messagelink)
      .setStyle(Discord.ButtonStyle.Primary);

    const onlyone = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.onlyone.name)
      .setLabel(msg.lan.onlyone)
      .setStyle(r.onlyone ? Discord.ButtonStyle.Primary : Discord.ButtonStyle.Secondary);

    const anyroles = new Builders.UnsafeButtonBuilder()
      .setCustomId(msg.lan.edit.anyroles.name)
      .setLabel(msg.lan.anyroles)
      .setStyle(Discord.ButtonStyle.Secondary);

    return [[active], [name, messagelink], [onlyone, anyroles]];
  },
  doMoreThings: async (msg, insertedValues, changedKey, res, oldRes) => {
    if (!oldRes || !oldRes.rowCount || !res || !res.rowCount) return;

    const nR = res.rows[0];
    const oR = oldRes.rows[oldRes.rows.findIndex((r) => r.uniquetimestamp === nR.uniquetimestamp)];

    await switchMsgReactions(msg, oR, nR);
    await switchMsgButtons(msg, oR, nR);

    if (oR.messagelink !== nR.messagelink) {
      msg.client.ch.query(`UPDATE rrbuttons SET messagelink = $1 WHERE messagelink = $2;`, [
        nR.messagelink,
        oR.messagelink,
      ]);

      msg.client.ch.query(`UPDATE rrreactions SET messagelink = $1 WHERE messagelink = $2;`, [
        nR.messagelink,
        oR.messagelink,
      ]);
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

const switchMsgReactions = async (msg, oldRow, newRow) => {
  const oldReactionRows = await getReactionRows(msg, oldRow);

  const [, , oldMessage] = await linkToIDs(msg, oldRow.messagelink);

  if (oldMessage && oldMessage.reactions) {
    oldMessage.reactions.removeAll().catch(() => {});
  }

  oldReactionRows.forEach(async (row) => {
    const [, , newMessage] = await linkToIDs(msg, newRow.messagelink);

    if (newMessage) {
      newMessage.react(row.emoteid).catch(() => {});
    }
  });
};

const switchMsgButtons = async (msg, oldRow, newRow) => {
  const [, , oldMessage] = await linkToIDs(msg, oldRow.messagelink);
  if (
    oldMessage &&
    oldMessage.components?.length &&
    oldMessage.author &&
    oldMessage.author.id === msg.client.user.id
  ) {
    oldMessage.edit({ components: [] }).catch(() => {});
  }

  const newRows = await getButtonRows(msg, oldRow);

  const [, , message] = await linkToIDs(msg, newRow.messagelink);
  if (!message || !message.author || message.author.id !== msg.client.user.id) return;

  const buttons = newRows
    .map((row) => {
      if (!row.active || !newRow.active) return null;

      const button = new Builders.UnsafeButtonBuilder().setCustomId(
        `rrbuttons_${row.uniquetimestamp}`,
      );

      if (row.buttontext) button.setLabel(row.buttontext);
      else button.setLabel('\u200b');

      if (row.emoteid) {
        const emote = msg.client.emojis.cache.get(row.emoteid);
        if (emote) button.setEmoji(emote);
      }
      button.setStyle(Discord.ButtonStyle.Secondary);

      return button;
    })
    .filter((b) => !!b);

  const actionRows = [];
  let useIndex = 0;
  buttons.forEach((b, i) => {
    if (i >= 24 || useIndex > 4) return;

    if (actionRows[useIndex]?.length === 5) {
      actionRows.push([b]);
      useIndex += 1;
    } else {
      if (!actionRows[useIndex]) actionRows[useIndex] = [];
      actionRows[useIndex].push(b);
    }
  });

  const newMsg = {
    components: msg.client.ch.buttonRower(actionRows),
    content: message.content?.length ? message.content : undefined,
    embeds: message.embeds,
  };

  message.edit(newMsg).catch(() => {});
};

const getReactionRows = async (msg, r) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM rrreactions WHERE messagelink = $1 AND guildid = $2;`,
    [r.messagelink, msg.guild.id],
  );

  if (res && res.rowCount) return res.rows;
  return [];
};

const getButtonRows = async (msg, r) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM rrbuttons WHERE messagelink = $1 AND guildid = $2;`,
    [r.messagelink, msg.guild.id],
  );

  if (res && res.rowCount) return res.rows;
  return [];
};

const linkToIDs = async (msg, link) => {
  const [, , , guildid, channelid, messageid] = link.split(/\/+/);

  const guild = msg.client.guilds.cache.get(guildid);
  const channel = guild ? guild.channels.cache.get(channelid) : null;
  const message = channel ? await channel.messages.fetch(messageid).catch(() => {}) : null;

  return [guild, channel, message];
};
