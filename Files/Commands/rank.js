const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  name: 'rank',
  perm: null,
  dm: false,
  takesFirstArg: false,
  aliases: ['level'],
  type: 'fun',
  execute: async (msg) => {
    const guildRow = await getRow(msg);
    if (guildRow && guildRow.active === false) {
      msg.client.ch.error(msg, msg.lan.disabled);
      return;
    }

    const user = await msg.client.users.fetch(
      msg.args[0] ? msg.args[0].replace(/\D+/g, '') : msg.author.id,
    );
    if (!user) {
      msg.client.ch.error(msg, msg.language.errors.userNotFound);
      return;
    }

    const levelRow = await getLevelRow(msg, user);

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

    const newLevel = level + 1;
    const neededXP = (5 / 6) * +newLevel * (2 * +newLevel * +newLevel + 27 * +newLevel + 91);

    const duration = moment
      .duration((Math.floor((+neededXP - +xp) / (xpPerMsg + 10)) / gain) * 60000)
      .format(
        ` D [${msg.language.time.days}], H [${msg.language.time.hours}], m [${msg.language.time.minutes}]`,
      );

    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.lan.author,
        iconURL: msg.client.constants.commands.rank.authorImage,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(
        msg.client.ch.makeBold(msg.client.ch.stp(msg.lan.currentLevel, { level: `${level}` })),
      )
      .setColor(msg.client.ch.colorSelector(msg.guild.me))
      .addFields(
        { name: msg.lan.currentXP, value: `${xp}`, inline: true },
        { name: msg.lan.nextXP, value: `${Math.floor(neededXP)}`, inline: true },
        { name: msg.lan.diff, value: `${Math.round(neededXP - xp)}`, inline: true },
        {
          name: '\u200b',
          value: `${msg.client.ch.stp(msg.lan.duration, {
            amount: `${Math.floor((neededXP - xp) / gain / (xpPerMsg + 10))}`,
            duration,
          })}`,
          inline: false,
        },
      );

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
  const res = await msg.client.ch.query(`SELECT * FROM level WHERE guildid = $1 AND userid = $2;`, [
    msg.guild.id,
    user.id,
  ]);
  if (res && res.rowCount) return res.rows[0];
  return null;
};
