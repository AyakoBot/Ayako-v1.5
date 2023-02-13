const moment = require('moment');
require('moment-duration-format');
const Builders = require('@discordjs/builders');
const language = require('../../Languages/lan-en.json');

module.exports = {
  name: 'rank',
  dm: false,
  type: 'leveling',
  execute: async (cmd) => {
    const guildRow = await getRow(cmd);
    const user = cmd.options.resolved.users?.first() ?? cmd.user;
    const levelRow = await getLevelRow(cmd, user);
    const lan = language.commands.rank;
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
        ` D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}]`,
      );

    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: lan.author,
        iconURL: cmd.client.constants.commands.rank.authorImage,
        url: cmd.client.constants.standard.invite,
      })
      .setDescription(
        cmd.client.ch.makeBold(cmd.client.ch.stp(lan.currentLevel, { level: `${level}` })),
      )
      .setColor(cmd.client.ch.colorSelector(cmd.guild.members.me))
      .addFields(
        { name: lan.currentXP, value: `${xp}`, inline: true },
        { name: lan.nextXP, value: `${Math.ceil(neededXP)}`, inline: true },
        { name: lan.diff, value: `${Math.round(neededXP - xp)}`, inline: true },
        {
          name: '\u200b',
          value: `${cmd.client.ch.stp(lan.duration, {
            amount: `${Math.ceil((neededXP - xp) / gain / (xpPerMsg + 10))}`,
            duration,
          })}`,
          inline: false,
        },
      );

    cmd.client.ch.reply(cmd, { embeds: [embed], ephemeral: true });
  },
};

const getRow = async (cmd) => {
  const res = await cmd.client.ch.query(`SELECT * FROM leveling WHERE guildid = $1;`, [
    cmd.guild.id,
  ]);
  if (res && res.rowCount) return res.rows[0];
  return null;
};

const getLevelRow = async (cmd, user) => {
  const res = await cmd.client.ch.query(
    `SELECT * FROM level WHERE guildid = $1 AND userid = $2 AND type = 'guild';`,
    [cmd.guild.id, user.id],
  );
  if (res && res.rowCount) return res.rows[0];
  return null;
};
