const Builders = require('@discordjs/builders');

const jobs = require('node-schedule');
const StringSimilarity = require('string-similarity');
const ChannelRules = require('../../../BaseClient/Other Client Files/Classes/ChannelRules');

const guildCooldown = new Set();
const lastMessageGuild = new Map();

const globalCooldown = new Set();
const lastMessageGlobal = new Map();

module.exports = {
  execute: async (msg) => {
    if (!msg.author || msg.author.bot || msg.channel.type === 1 || !msg.guild) return;

    const language = await msg.client.ch.languageSelector(msg.guild);

    globalLeveling(msg);
    guildLeveling(msg, language);
    if (msg.author.id === '318453143476371456' && msg.content === 'ayo') {
      debug(msg, language);
    }
  },
};

const globalLeveling = async (msg) => {
  if (globalCooldown.has(msg.author.id)) return;

  const lastMessage = lastMessageGlobal.get(msg.author.id);
  if (lastMessage && StringSimilarity.compareTwoStrings(msg.content, lastMessage) > 0.9) return;
  lastMessageGlobal.set(msg.author.id, msg.content);

  globalCooldown.add(msg.author.id);

  const date = new Date(Date.now() + 60000);
  jobs.scheduleJob(date, () => {
    globalCooldown.delete(msg.author.id);
  });

  const res = await msg.client.ch.query(`SELECT * FROM level WHERE type = $1 AND userid = $2;`, [
    'global',
    msg.author.id,
  ]);
  if (res && res.rowCount) {
    updateLevels(msg, null, { row: res.rows[0] }, 10, 'global', 1);
  } else {
    insertLevels(msg, 'global', 10, 1);
  }
};

const guildLeveling = async (msg, language) => {
  if (msg.guild.id === '108176345204264960' && msg.content.split(/\s+/g).length < 2) return;

  const isEnabled = await checkEnabled(msg);
  if (isEnabled === false) return;

  const rows = isEnabled?.rows[0];
  if (rows) {
    if (rows.ignoreprefixes && rows.prefixes?.length) {
      const startsWith = rows.prefixes.some((w) =>
        msg.content.toLowerCase().startsWith(w.toLowerCase()),
      );
      if (startsWith) return;
    }

    if (!rows.wlusers || !rows.wlusers.includes(msg.author.id)) {
      if (rows.blusers && rows.blusers?.includes(msg.author.id)) return;
      if (rows.blroles && msg.member.roles.cache.some((r) => rows.blroles.includes(r.id))) return;

      if (!rows.wlroles || !msg.member.roles.cache.some((r) => rows.wlroles.includes(r.id))) {
        if (rows.blchannels && rows.blchannels.includes(msg.channel.id)) return;
        if (
          rows.wlchannels &&
          rows.wlchannels.length &&
          !rows.wlchannels.includes(msg.channel.id)
        ) {
          return;
        }
      }
    }
  }

  const rulesRows = await getRulesRes(msg);
  if (rulesRows && rulesRows.length) {
    const passesRules = checkPass(msg, rulesRows);
    if (!passesRules) return;
  }

  if (guildCooldown.has(msg.author.id)) return;

  const lastMessage = lastMessageGuild.get(msg.author.id);
  if (lastMessage && StringSimilarity.compareTwoStrings(msg.content, lastMessage) > 0.9) return;
  lastMessageGuild.set(msg.author.id, msg.content);

  guildCooldown.add(msg.author.id);

  const date = new Date(Date.now() + 60000);
  jobs.scheduleJob(date, () => {
    guildCooldown.delete(msg.author.id);
  });

  const res = await msg.client.ch.query(
    `SELECT * FROM level WHERE type = $1 AND userid = $2 AND guildid = $3;`,
    ['guild', msg.author.id, msg.guild.id],
  );

  if (res && res.rowCount) {
    updateLevels(
      msg,
      rows,
      { row: res.rows[0], language },
      rows ? Number(rows.xppermsg) - 10 : 15,
      'guild',
      rows ? Number(rows.xpmultiplier) : 1,
    );
  } else {
    insertLevels(
      msg,
      'guild',
      rows ? Number(rows.xppermsg) - 10 : 15,
      rows ? Number(rows.xpmultiplier) : 1,
    );
  }
};

const insertLevels = (msg, type, baseXP, xpMultiplier) => {
  const xp = Math.floor(Math.random() * baseXP + 10) * xpMultiplier;

  msg.client.ch.query(
    `INSERT INTO level (type, userid, xp, level, guildid) VALUES ($1, $2, $3, $4, $5);`,
    [type, msg.author.id, xp, 0, type === 'guild' ? msg.guild.id : 1],
  );
};

const updateLevels = async (msg, row, lvlupObj, baseXP, type, xpMultiplier) => {
  if (row) {
    const roleMultiplier = await getRoleMultiplier(msg);
    const channelMultiplier = await getChannelMultiplier(msg);

    if (roleMultiplier) xpMultiplier = roleMultiplier;
    if (channelMultiplier) xpMultiplier = channelMultiplier;
  }

  const newXp = Math.floor(Math.random() * baseXP + 10) * xpMultiplier;
  const oldLevel = Number(lvlupObj.row.level);
  const oldXp = Number(lvlupObj.row.xp);
  const xp = oldXp + newXp;
  let newLevel = oldLevel;
  const neededXP =
    (5 / 6) * (newLevel + 1) * (2 * (newLevel + 1) * (newLevel + 1) + 27 * (newLevel + 1) + 91);

  if (xp >= neededXP) {
    newLevel += 1;
    if (row) {
      levelUp(
        msg,
        {
          oldXp,
          newXp: xp,
          newLevel,
          oldLevel,
        },
        lvlupObj,
        row,
      );
    }
  }

  if (type === 'guild') {
    msg.client.ch.query(
      `UPDATE level SET level = $1, xp = $2 WHERE type = $3 AND userid = $4 AND guildid = $5;`,
      [newLevel, xp, type, msg.author.id, msg.guild.id],
    );
  } else {
    msg.client.ch.query(`UPDATE level SET level = $1, xp = $2 WHERE type = $3 AND userid = $4;`, [
      newLevel,
      xp,
      type,
      msg.author.id,
    ]);
  }
};

const checkEnabled = async (msg) => {
  const res = await msg.client.ch.query(`SELECT * FROM leveling WHERE guildid = $1;`, [
    msg.guild.id,
  ]);

  if (res && res.rowCount) {
    if (res.rows[0].active === false) return false;
    return res;
  }
  return null;
};

const levelUp = async (msg, levelData, { row, language }, settingsrow) => {
  switch (Number(settingsrow?.lvlupmode)) {
    case 1: {
      await doEmbed(msg, row, language, levelData, settingsrow);
      break;
    }
    case 2: {
      await doReact(msg, settingsrow, levelData, language);
      break;
    }
    default: {
      break;
    }
  }

  roleAssign(msg, settingsrow.rolemode, levelData.newLevel);
};

const roleAssign = async (msg, rolemode, newLevel) => {
  const res = await msg.client.ch.query(`SELECT * FROM levelingroles WHERE guildid = $1;`, [
    msg.guild.id,
  ]);

  if (!res || !res.rowCount) return;
  const { rows } = res;

  let add = [];
  let rem = [];

  switch (Number(rolemode)) {
    case 0: {
      // stack
      const thisLevelsRows = rows.filter((r) => Number(r.level) <= Number(newLevel));
      thisLevelsRows.forEach((r) => {
        const roleMap = r.roles
          ?.map((roleid) => {
            if (!msg.member.roles.cache.has(roleid)) return roleid;
            return null;
          })
          .filter((req) => !!req);

        if (roleMap?.length) {
          add = [...new Set([...add, ...roleMap])];
        }
      });
      break;
    }
    case 1: {
      // replace
      const thisLevelsAndBelowRows = rows.filter((r) => Number(r.level) <= Number(newLevel));

      thisLevelsAndBelowRows.forEach((r) => {
        const remr = [];
        const addr = [];
        r.roles?.forEach((roleid) => {
          if (Number(r.level) < Number(newLevel) && msg.member.roles.cache.has(roleid)) {
            if (msg.guild.roles.cache.get(roleid)) remr.push(roleid);
          }

          if (Number(r.level) === Number(newLevel) && !msg.member.roles.cache.has(roleid)) {
            if (msg.guild.roles.cache.get(roleid)) addr.push(roleid);
          }
        });

        if (addr.length) {
          add = [...new Set([...add, ...addr])];
        }

        if (remr.length) {
          rem = [...new Set([...rem, ...remr])];
        }
      });
      break;
    }
    default: {
      break;
    }
  }

  if (add.length) {
    await msg.member.roles.add(add).catch(() => {});
  }

  if (rem.length) {
    await msg.member.roles.remove(rem, 'Leveling').catch(() => {});
  }
};

const doReact = async (msg, row, levelData, language) => {
  const reactions = [];

  if (row?.lvlupemotes?.length) {
    row.lvlupemotes.forEach((emoteID) => {
      const emote = msg.client.emojis.cache.get(emoteID);
      if (emote) reactions.push(emote);
    });
  } else {
    msg.client.objectEmotes.levelupemotes.forEach((emote) =>
      reactions.push(emote.id || emote.name),
    );
  }

  if (levelData.newLevel === 1) {
    infoEmbed(msg, reactions, language);
  }

  const promises = reactions.map((emote) => msg.react(emote).catch(() => {}));
  await Promise.all(promises);

  const date = new Date(Date.now() + 10000);
  jobs.scheduleJob(date, () => {
    msg.reactions.removeAll().catch(() => {});
  });
};

const doEmbed = async (msg, settinsgrow, language, levelData, row) => {
  const getDefaultEmbed = () => ({
    author: {
      name: msg.client.ch.stp(language.leveling.author, { msg, level: levelData.newLevel }),
    },
    color: msg.client.ch.colorSelector(msg.member),
  });

  let embed;

  const options = [
    ['msg', msg],
    ['user', msg.author],
    ['newLevel', levelData.newLevel],
    ['oldLevel', levelData.oldLevel],
    ['newXP', levelData.newXp],
    ['oldXP', levelData.oldXp],
  ];

  if (!row?.embed) embed = msg.client.ch.dynamicToEmbed(getDefaultEmbed(), options);
  else {
    const res = await msg.client.ch.query(
      `SELECT * FROM customembeds WHERE uniquetimestamp = $1 AND guildid = $2;`,
      [row.embed, msg.guild.id],
    );

    if (res && res.rowCount) {
      const partialEmbed = msg.client.ch.getDiscordEmbed(res.rows[0]);
      embed = msg.client.ch.dynamicToEmbed(partialEmbed, options);
    } else {
      embed = msg.client.ch.dynamicToEmbed(getDefaultEmbed(), options);
    }
  }

  send(msg, { embeds: [embed] }, settinsgrow);
};

const send = async (msg, payload, row) => {
  const channelIDs =
    row.lvlupchannels && row.lvlupchannels.length ? row.lvlupchannels : [msg.channel.id];

  const channels = channelIDs.map((ch) => msg.guild.channels.cache.get(ch));
  const msgs = await Promise.all(channels.map((c) => c.send(payload).catch(() => {})));

  if (row.lvlupdeltimeout) {
    const date = new Date(Date.now() + row.lvlupdeltimeoutF);
    jobs.scheduleJob(date, () => {
      Promise.all(msgs.map((m) => m.delete()));
    });
  }
};

const getRulesRes = async (msg) => {
  const res = await msg.client.ch.query(`SELECT * FROM levelingruleschannels WHERE guildid = $1;`, [
    msg.guild.id,
  ]);

  if (res && res.rowCount) {
    const rows = res.rows.filter((r) => r.channels?.includes(msg.channel.id));
    return rows;
  }
  return null;
};

const checkPass = (msg, rows) => {
  const passes = rows.map((row) => {
    if (!row.rules) return true;
    const rules = new ChannelRules(row.rules, 10).toArray();
    const appliedRules = {};

    rules.forEach((uppercaseKey) => {
      const key = uppercaseKey.toLowerCase();
      appliedRules[key] = row[key];
    });

    const willLevel = [];

    Object.entries(appliedRules).forEach(([key, num]) => {
      switch (key) {
        case 'has_least_attachments': {
          if (msg.attachments.size < num) willLevel.push(false);
          break;
        }
        case 'has_most_attachments': {
          if (msg.attachments.size > num) willLevel.push(false);
          break;
        }
        case 'has_least_characters': {
          if (msg.content.length < num) willLevel.push(false);
          break;
        }
        case 'has_most_characters': {
          if (msg.content.length > num) willLevel.push(false);
          break;
        }
        case 'has_least_words': {
          if (msg.content.split(' ').length < num) willLevel.push(false);
          break;
        }
        case 'has_most_words': {
          if (msg.content.split(' ').length > num) willLevel.push(false);
          break;
        }
        case 'mentions_least_users': {
          if (msg.mentions.users.size < num) willLevel.push(false);
          break;
        }
        case 'mentions_most_users': {
          if (msg.mentions.users.size > num) willLevel.push(false);
          break;
        }
        case 'mentions_least_roles': {
          if (msg.mentions.roles.size < num) willLevel.push(false);
          break;
        }
        case 'mentions_most_roles': {
          if (msg.mentions.roles.size > num) willLevel.push(false);
          break;
        }
        case 'mentions_least_channels': {
          if (msg.mentions.channels.size < num) willLevel.push(false);
          break;
        }
        case 'mentions_most_channels': {
          if (msg.mentions.channels.size > num) willLevel.push(false);
          break;
        }
        case 'has_least_links': {
          if (
            (msg.content.match(
              /(http|https):\/\/(?:[a-z0-9]+(?:[-][a-z0-9]+)*\.)+[a-z]{2,}(?::\d+)?(?:\/\S*)?/gi,
            )?.length || null) < num
          ) {
            willLevel.push(false);
          }
          break;
        }
        case 'has_most_links': {
          if (
            (msg.content.match(
              /(http|https):\/\/(?:[a-z0-9]+(?:[-][a-z0-9]+)*\.)+[a-z]{2,}(?::\d+)?(?:\/\S*)?/gi,
            )?.length || null) > num
          ) {
            willLevel.push(false);
          }
          break;
        }
        case 'has_least_emotes': {
          if ((msg.content.match(/<(a)?:[a-zA-Z0-9_]+:[0-9]+>/gi)?.length || null) < num) {
            willLevel.push(false);
          }
          break;
        }
        case 'has_most_emotes': {
          if ((msg.content.match(/<(a)?:[a-zA-Z0-9_]+:[0-9]+>/gi)?.length || null) > num) {
            willLevel.push(false);
          }
          break;
        }
        case 'has_least_mentions': {
          if (
            msg.mentions.users.size + msg.mentions.channels.size + msg.mentions.roles.size <
            num
          ) {
            willLevel.push(false);
          }
          break;
        }
        case 'has_most_mentions': {
          if (
            msg.mentions.users.size + msg.mentions.channels.size + msg.mentions.roles.size >
            num
          ) {
            willLevel.push(false);
          }
          break;
        }
        default: {
          willLevel.push(true);
          break;
        }
      }
      willLevel.push(true);
    });
    if (willLevel.includes(false)) return false;
    return true;
  });

  if (passes.includes(false)) return false;
  return true;
};

const debug = async (msg, lang) => {
  const res = await msg.client.ch.query(`SELECT * FROM level WHERE type = $1 AND userid = $2;`, [
    'guild',
    msg.author.id,
  ]);

  const res2 = await msg.client.ch.query(`SELECT * FROM leveling WHERE guildid = $1;`, [
    msg.guild.id,
  ]);

  levelUp(
    msg,
    {
      oldXp: 100,
      newXp: 150,
      newLevel: 4,
      oldLevel: 3,
    },
    { res, language: lang },
    res2.rows[0],
  );
};

const getRoleMultiplier = async (msg) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM levelingmultiplierroles WHERE guildid = $1 ORDER BY multiplier DESC;`,
    [msg.guild.id],
  );

  if (res && res.rowCount) {
    const rows = res.rows.filter((row) =>
      msg.member.roles.cache.some((r) => row.roles?.includes(r.id)),
    );
    if (!rows || !rows.length) return null;
    const [row] = rows;
    return Number(row.multiplier);
  }
  return null;
};

const getChannelMultiplier = async (msg) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM levelingmultiplierchannels WHERE guildid = $1 ORDER BY multiplier DESC;`,
    [msg.guild.id],
  );

  if (res && res.rowCount) {
    const rows = res.rows.filter((row) => row.channels?.includes(msg.channel.id));
    if (!rows || !rows.length) return null;
    const [row] = rows;
    return Number(row.multiplier);
  }
  return null;
};

const infoEmbed = (msg, reactions, language) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setColor(msg.client.ch.colorSelector(msg.guild.members.me))
    .setDescription(
      msg.client.ch.stp(language.leveling.description, {
        reactions: reactions.map((r) => msg.client.emojis.cache.get(r) || r).join(''),
      }),
    );

  msg.client.ch.reply(msg, { embeds: [embed] }).then((m) => {
    const date = new Date(Date.now() + 30000);
    jobs.scheduleJob(date, () => {
      m.delete().catch(() => {});
    });
  });
};
