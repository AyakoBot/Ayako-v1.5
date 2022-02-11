const Discord = require('discord.js');
const StringSimilarity = require('string-similarity');

const guildCooldown = new Set();
const lastMessageGuild = new Map();

const globalCooldown = new Set();
const lastMessageGlobal = new Map();

/*
TODO: 
xpmultiplier
blchannels
blroles
blusers
wlchannels
wlroles
xppermsg
finish rolemode
lvlupdeltimeout
lvlupchannels
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

  const newXp = Math.floor(Math.random() * 10 + 10);

  const res = await msg.client.ch.query(`SELECT * FROM level WHERE type = $1 AND userid = $2;`, [
    'global',
    msg.author.id,
  ]);
  if (res && res.rowCount) {
    const oldLevel = Number(res.rows[0].level);
    const oldXp = Number(res.rows[0].xp);
    const xp = oldXp + newXp;
    let newLevel = oldLevel;
    const neededXP =
      (5 / 6) * (newLevel + 1) * (2 * (newLevel + 1) * (newLevel + 1) + 27 * (newLevel + 1) + 91);

    if (xp >= neededXP) newLevel += 1;

    await msg.client.ch.query(
      `UPDATE levels SET level = $1, xp = $2 WHERE type = $3 AND userid = $4;`,
      [newLevel, xp, 'global', msg.author.id],
    );
  } else {
    await msg.client.ch.query(
      `INSERT INTO levels (type, userid, xp, level) VALUES ($1, $2, $3, $4);`,
      ['global', msg.author.id, newXp, 0],
    );
  }
};

const guildLeveling = async (msg, language) => {
  const isEnabled = await checkEnabled(msg);
  if (isEnabled === false) return;

  if (guildCooldown.has(msg.author.id)) return;

  const lastMessage = lastMessageGuild.get(msg.author.id);
  if (StringSimilarity.compareTwoStrings(msg.content, lastMessage) > 0.9) return;
  lastMessageGuild.set(msg.author.id, msg.content);

  guildCooldown.add(msg.author.id);
  setTimeout(() => {
    guildCooldown.delete(msg.author.id);
  }, 10000);

  const newXp = Math.floor(Math.random() * 10 + 15);

  const res = await msg.client.ch.query(`SELECT * FROM level WHERE type = $1 AND userid = $2;`, [
    'guild',
    msg.author.id,
  ]);
  if (res && res.rowCount) {
    const oldLevel = Number(res.rows[0].level);
    const oldXp = Number(res.rows[0].xp);
    const xp = oldXp + newXp;
    let newLevel = oldLevel;
    const neededXP =
      (5 / 6) * (newLevel + 1) * (2 * (newLevel + 1) * (newLevel + 1) + 27 * (newLevel + 1) + 91);

    if (xp >= neededXP) {
      newLevel += 1;
      levelUp(msg, language, { oldXp, newXp: xp, newLevel, oldLevel }, isEnabled);
    }

    await msg.client.ch.query(
      `UPDATE levels SET level = $1, xp = $2 WHERE type = $3 AND userid = $4 AND guildid = $5;`,
      [newLevel, xp, 'guild', msg.author.id, msg.guild.id],
    );
  } else {
    await msg.client.ch.query(
      `INSERT INTO levels (type, userid, xp, level, guildid) VALUES ($1, $2, $3, $4, $5);`,
      ['guild', msg.author.id, newXp, 0, msg.guild.id],
    );
  }
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

const levelUp = async (msg, language, levelData, res) => {
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

  roleAssign(msg, res, levelData.newLevel);
};

const roleAssign = async (msg, res, newLevel) => {
  switch (Number(res.rows[0].rolemode)) {
    default: {
      break;
    }
    case 0: {
      // stack
      break;
    }
    case 1: {
      // replace
      break;
    }
  }
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

  msg.client.ch.send({ embeds: [embed] });
};
