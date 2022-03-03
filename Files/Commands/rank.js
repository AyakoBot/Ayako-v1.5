const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  name: 'rank',
  perm: null,
  dm: true,
  takesFirstArg: false,
  aliases: ['level', 'grank', 'glevel', 'lvl', 'glvl'],
  type: 'fun',
  execute: async (msg) => {
    let isGuild =
      !msg.content.split(' ')[0].includes(module.exports.aliases[1]) &&
      !msg.content.split(' ')[0].includes(module.exports.aliases[2]) &&
      !msg.content.split(' ')[0].includes(module.exports.aliases[4]);

    if (msg.channel.type === 'DM') isGuild = false;

    let guildRow;
    if (isGuild) {
      guildRow = await getRow(msg);
      if (guildRow && guildRow.active === false) {
        msg.client.ch.error(msg, msg.lan.disabled);
        return;
      }
    }

    const user = await msg.client.users.fetch(
      msg.args[0] ? msg.args[0].replace(/\D+/g, '') : msg.author.id,
    );
    if (!user) {
      msg.client.ch.error(msg, msg.language.errors.userNotExist);
      return;
    }

    let levelRow;
    if (isGuild) levelRow = await getLevelRow(msg, user);
    else levelRow = await getGlobalRow(msg, user);

    let level = 0;
    let xp = 0;
    let gain = 1;
    let xpPerMsg = 15;

    if (levelRow) {
      level = Number(levelRow.level);
      xp = Number(levelRow.xp);
    }
    if (guildRow) {
      xpPerMsg = Number(guildRow.xppermsg) - 10;
      gain = Number(guildRow.xpmultiplier);
    }
    if (!isGuild) {
      xpPerMsg = 10;
    }

    const newLevel = level + 1;
    const neededXP = (5 / 6) * +newLevel * (2 * +newLevel * +newLevel + 27 * +newLevel + 91);

    const duration = moment
      .duration((Math.floor((+neededXP - +xp) / (xpPerMsg + 10)) / gain) * 60000)
      .format(
        ` D [${msg.language.time.days}], H [${msg.language.time.hours}], m [${msg.language.time.minutes}]`,
      );

    const embed = new Discord.UnsafeEmbed()
      .setAuthor({
        name: isGuild ? msg.lan.author : msg.lan.globalAuthor,
        iconURL: msg.client.constants.commands.rank.authorImage,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(
        msg.client.ch.makeBold(msg.client.ch.stp(msg.lan.currentLevel, { level: `${level}` })),
      )
      .setColor(
        isGuild ? msg.client.ch.colorSelector(msg.guild.me) : msg.client.constants.standard.color,
      )
      .addFieldss([
        { name: msg.lan.currentXP, value: `${xp}`, inline: true },
        { name: msg.lan.nextXP, value: `${Math.ceil(neededXP)}`, inline: true },
        { name: msg.lan.diff, value: `${Math.round(neededXP - xp)}`, inline: true },
        {
          name: '\u200b',
          value: `${msg.client.ch.stp(msg.lan.duration, {
            amount: `${Math.ceil((neededXP - xp) / gain / (xpPerMsg + 10))}`,
            duration,
          })}`,
          inline: false,
        },
      ]);

    msg.client.ch.reply(msg, { embeds: [embed] });
  },
};

const getRow = async (msg) => {
  const res = await msg.client.ch.query(`SELECT * FROM leveling WHERE guildid = $1;`, [
    msg.guild.id,
  ]);
  if (res && res.rowCount) return res.rows[0];
  return null;
};

const getLevelRow = async (msg, user) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM level WHERE guildid = $1 AND userid = $2 AND type = 'guild';`,
    [msg.guild.id, user.id],
  );
  if (res && res.rowCount) return res.rows[0];
  return null;
};

const getGlobalRow = async (msg, user) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM level WHERE type = 'global' AND userid = $1;`,
    [user.id],
  );
  if (res && res.rowCount) return res.rows[0];
  return null;
};
