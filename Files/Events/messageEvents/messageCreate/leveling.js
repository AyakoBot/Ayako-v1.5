const Discord = require('discord.js');
const StringSimilarity = require('string-similarity');
const ChannelRules = require('../../../BaseClient/Other Client Files/ChannelRules');

const guildCooldown = new Set();
const lastMessageGuild = new Map();

const globalCooldown = new Set();
const lastMessageGlobal = new Map();

/*
TODO: 
ruleschannels
*/

module.exports = {
  async execute(msg) {
    if (!msg.author || msg.author.bot || msg.channel.type === 'DM') return;

    const language = await msg.client.ch.languageSelector(msg.guild);

    globalLeveling(msg);
    guildLeveling(msg, language);
  },
};

const globalLeveling = async (msg) => {
  if (globalCooldown.has(msg.author.id)) return;

  const lastMessage = lastMessageGlobal.get(msg.author.id);
  if (StringSimilarity.compareTwoStrings(msg.content, lastMessage) > 0.9) return;
  lastMessageGlobal.set(msg.author.id, msg.content);

  globalCooldown.add(msg.author.id);
  setTimeout(() => {
    globalCooldown.delete(msg.author.id);
  }, 10000);

  const res = await msg.client.ch.query(`SELECT * FROM level WHERE type = $1 AND userid = $2;`, [
    'global',
    msg.author.id,
  ]);
  if (res && res.rowCount) {
    updateLevels(msg, res.rows[0], null, 10, 'global', 1);
  } else {
    insertLevels(msg, 'global', 10, 1);
  }
};

const guildLeveling = async (msg, language) => {
  const isEnabled = await checkEnabled(msg);
  if (isEnabled === false) return;

  const rows = isEnabled.rows[0];
  if (!rows.wlusers || !rows.wlusers.includes(msg.author.id)) {
    if (rows.blusers && rows.blusers?.includes(msg.author.id)) return;
    if (rows.blroles && msg.member.roles.cache.some((r) => rows.blroles.includes(r.id))) return;

    if (!rows.wlroles || !msg.member.roles.cache.some((r) => rows.wlroles.includes(r.id))) {
      if (rows.blchannels && rows.blchannels.includes(msg.channel.id)) return;
      if (rows.wlchannels && rows.wlchannels.length && !rows.wlchannels.includes(msg.channel.id)) {
        return;
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
  if (StringSimilarity.compareTwoStrings(msg.content, lastMessage) > 0.9) return;
  lastMessageGuild.set(msg.author.id, msg.content);

  guildCooldown.add(msg.author.id);
  setTimeout(() => {
    guildCooldown.delete(msg.author.id);
  }, 10000);

  const res = await msg.client.ch.query(`SELECT * FROM level WHERE type = $1 AND userid = $2;`, [
    'guild',
    msg.author.id,
  ]);

  if (res && res.rowCount) {
    updateLevels(
      msg,
      res.rows[0],
      { res, language },
      Number(rows.xppermsg) - 10,
      'guild',
      Number(rows.xpmultiplier),
    );
  } else {
    insertLevels(msg, 'guild', Number(rows.xppermsg) - 10, Number(rows.xpmultiplier));
  }
};

const insertLevels = (msg, type, baseXP, xpMultiplier) => {
  const xp = Math.floor(Math.random() * xpMultiplier + baseXP);

  msg.client.ch.query(
    `INSERT INTO levels (type, userid, xp, level, guildid) VALUES ($1, $2, $3, $4, $5);`,
    [type, msg.author.id, xp, 0, type === 'guild' ? msg.guild.id : null],
  );
};

const updateLevels = (msg, row, lvlupObj, baseXP, type, xpMultiplier) => {
  const newXp = Math.floor(Math.random() * xpMultiplier + baseXP);
  const oldLevel = Number(row.level);
  const oldXp = Number(row.xp);
  const xp = oldXp + newXp;
  let newLevel = oldLevel;
  const neededXP =
    (5 / 6) * (newLevel + 1) * (2 * (newLevel + 1) * (newLevel + 1) + 27 * (newLevel + 1) + 91);

  if (xp >= neededXP && lvlupObj) {
    newLevel += 1;
    levelUp(msg, { oldXp, newXp: xp, newLevel, oldLevel }, lvlupObj);
  }

  msg.client.ch.query(
    `UPDATE levels SET level = $1, xp = $2 WHERE type = $3 AND userid = $4 AND guildid = $5;`,
    [newLevel, xp, type, msg.author.id, type === 'guild' ? msg.guild.id : null],
  );

  if (xp >= neededXP) newLevel += 1;
};

const checkEnabled = async (msg) => {
  const res = await msg.client.ch.query(`SELECT * FROM leveling WHERE guildid = $1;`, [
    msg.guild.id,
  ]);

  if (res && res.rowCount) {
    if (res.rows[0].active === false) return false;
  }
  return res;
};

const levelUp = async (msg, levelData, { res, language }) => {
  switch (Number(res.rows[0].lvlupmode)) {
    default: {
      break;
    }
    case 1: {
      await doEmbed(msg, res, language, levelData);
      break;
    }
    case 2: {
      doReact(msg, res);
      break;
    }
  }

  roleAssign(msg, res.rows[0].rolemode, levelData.newLevel);
};

const roleAssign = async (msg, rolemode, newLevel) => {
  const res = await msg.client.ch.query(`SELECT * FROM levelingroles WHERE guildid = $1;`, [
    msg.guild.id,
  ]);

  if (!res || !res.rowCount) return;
  const { rows } = res;
  let promises = [];

  switch (Number(rolemode)) {
    default: {
      break;
    }
    case 0: {
      // stack
      const thisLevelsRoleIDs = rows.find((r) => r.level === Number(newLevel));
      promises = thisLevelsRoleIDs
        .map((r) => {
          const roleMap = r
            .map((roleid) => {
              if (!msg.member.roles.cache.has(roleid)) return roleid;
              return null;
            })
            .filter((req) => !!req);

          if (roleMap.length) {
            return msg.author.roles.add([roleMap]).catch(() => {});
          }
          return null;
        })
        .filter((r) => !!r);
      break;
    }
    case 1: {
      // replace
      const thisLevelsAndBelowRoleIDs = rows.find((r) => r.level >= Number(newLevel));
      thisLevelsAndBelowRoleIDs.forEach((r) => {
        const remove = [];
        const add = [];
        r.forEach((roleid) => {
          if (r.level < Number(newLevel) && msg.member.roles.cache.has(roleid)) {
            if (msg.guild.roles.cache.get(roleid)) remove.push(roleid);
          }
          if (r.level === Number(newLevel) && !msg.member.roles.cache.has(roleid)) {
            if (msg.guild.roles.cache.get(roleid)) add.push(roleid);
          }
        });

        if (add.length) {
          promises.push(msg.member.roles.add(add).catch(() => {}));
        }

        if (remove.length) {
          promises.push(msg.member.roles.remove(add).catch(() => {}));
        }
      });
      break;
    }
  }

  await Promise.all(promises);
};

const doReact = async (msg, res) => {
  const reactions = [];

  if (res.lvlupemotes?.length) {
    res.lvlupemotes.forEach((emoteID) => {
      const emote = msg.client.emojis.cache.get(emoteID);
      if (emote) reactions.push(emote);
    });
  } else {
    msg.client.constants.standard.levelupemotes.forEach((emote) => reactions.push(emote));
  }

  const promises = reactions.map((emote) => msg.react(emote).catch(() => {}));
  await Promise.all(promises);
};

const doEmbed = async (msg, levelRes, language, levelData) => {
  const getDefaultEmbed = () => {
    return new Discord.MessageEmbed()
      .setAuthor({ name: language.leveling.author })
      .setColor(msg.client.ch.colorSelector(msg.member));
  };

  let embed;

  if (!levelRes.rows[0].embed) embed = getDefaultEmbed();
  else {
    const res = await msg.client.ch.query(
      `SELECT * FROM customembeds WHERE uniquetimestamp = $1 AND guildid = $2;`,
      [levelRes.rows[0].embed, msg.guild.id],
    );
    if (res && res.rowCount) {
      const options = [
        ['msg', msg],
        ['user', msg.author],
        ['newLevel', levelData.newLevel],
        ['oldLevel', levelData.oldLevel],
        ['newXP', levelData.newXp],
        ['oldXP', levelData.oldXp],
      ];

      const partialEmbed = msg.client.ch.getDiscordEmbed(res.rows[0]);
      embed = msg.client.ch.dynamicToEmbed(partialEmbed, options);
    } else {
      embed = getDefaultEmbed();
    }
  }

  send(msg, { embeds: [embed] }, levelRes);
};

const send = async (msg, payload, res) => {
  const channelIDs =
    res.rows[0].lvlupchannels && res.rows[0].lvlupchannels.length
      ? res.rows[0].lvlupchannels
      : [msg.channel.id];

  const channels = channelIDs.map((ch) => msg.guild.channels.cache.get(ch));
  const msgs = await Promise.all(channels.map((c) => c.send(payload).catch(() => {})));

  if (res.rows[0].lvlupdeltimeout) {
    setTimeout(() => {
      Promise.all(msgs.map((m) => m.delete()));
    }, res.rows[0].lvlupdeltimeout);
  }
};

const getRulesRes = async (msg) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM levelingruleschannels WHERE channels @> ARRAY[$1]::varchar[];`,
    [msg.guild.id],
  );

  if (res && res.rowCount) return res.rows;
  return null;
};

const checkPass = (msg, rows) => {
  if (!rows.rules) return true;
  const rules = new ChannelRules(BigInt(rows.rules));
  const appliedRules = {};

  Object.entries(rules).forEach(([uppercaseKey, bool]) => {
    const key = uppercaseKey.toLowerCase();
    if (bool === true) {
      appliedRules[key] = rows[key];
    }
  });

  Object.entries(appliedRules).forEach(([key, num]) => {
    switch (key) {
      default: {
        break;
      }
      case 'has_least_attachments': {
        if (msg.attachments.size < num) return false;
        break;
      }
      case 'has_most_attachments': {
        if (msg.attachments.size > num) return false;
        break;
      }
      case 'has_least_characters': {
        if (msg.content.length < num) return false;
        break;
      }
      case 'has_most_characters': {
        if (msg.content.length > num) return false;
        break;
      }
      case 'has_least_words': {
        if (msg.content.split(' ').length < num) return false;
        break;
      }
      case 'has_most_words': {
        if (msg.content.split(' ').length > num) return false;
        break;
      }
      case 'mentions_least_users': {
        if (msg.mentions.users.size < num) return false;
        break;
      }
      case 'mentions_most_users': {
        if (msg.mentions.users.size > num) return false;
        break;
      }
      case 'mentions_least_roles': {
        if (msg.mentions.roles.size < num) return false;
        break;
      }
      case 'mentions_most_roles': {
        if (msg.mentions.roles.size > num) return false;
        break;
      }
      case 'mentions_least_channels': {
        if (msg.mentions.channels.size < num) return false;
        break;
      }
      case 'mentions_most_channels': {
        if (msg.mentions.channels.size > num) return false;
        break;
      }
      case 'has_least_links': {
        if (
          msg.content.match(
            /(http|https):\/\/(?:[a-z0-9]+(?:[-][a-z0-9]+)*\.)+[a-z]{2,}(?::\d+)?(?:\/\S*)?/gi,
          )?.length < num
        ) {
          return false;
        }
        break;
      }
      case 'has_most_links': {
        if (
          msg.content.match(
            /(http|https):\/\/(?:[a-z0-9]+(?:[-][a-z0-9]+)*\.)+[a-z]{2,}(?::\d+)?(?:\/\S*)?/gi,
          )?.length > num
        ) {
          return false;
        }
        break;
      }
      case 'has_least_emotes': {
        if (msg.content.match(/<(a)?:[a-zA-Z0-9_]+:[0-9]+>/gi)?.length < num) return false;
        break;
      }
      case 'has_most_emotes': {
        if (msg.content.match(/<(a)?:[a-zA-Z0-9_]+:[0-9]+>/gi)?.length > num) return false;
        break;
      }
      case 'has_least_mentions': {
        if (msg.mentions.users.size + msg.mentions.channels.size + msg.mentions.roles.size < num) {
          return false;
        }
        break;
      }
      case 'has_most_mentions': {
        if (msg.mentions.users.size + msg.mentions.channels.size + msg.mentions.roles.size > num) {
          return false;
        }
        break;
      }
    }
    return true;
  });
  return true;
};
