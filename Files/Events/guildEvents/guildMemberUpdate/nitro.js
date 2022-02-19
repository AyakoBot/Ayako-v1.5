const Discord = require('discord.js');

module.exports = {
  execute: async (oldMember, newMember) => {
    await checkInserts(oldMember, newMember);

    if (oldMember.premiumSinceTimestamp && newMember.premiumSinceTimestamp) {
      return;
    }

    if (newMember.premiumSinceTimestamp && !oldMember.premiumSinceTimestamp) {
      await newMember.client.ch.query(
        `INSERT INTO nitrousers (guildid, userid, stillboosting, booststarts) VALUES ($1, $2, true, $3)
        ON CONFLICT (guildid, userid) DO
        UPDATE SET booststarts = array_append(nitrousers.booststarts, $4), stillboosting = false;`,
        [
          newMember.guild.id,
          newMember.user.id,
          [newMember.premiumSinceTimestamp],
          newMember.premiumSinceTimestamp,
        ],
      );

      logStart(oldMember, await getDays(newMember));
    }

    if (oldMember.premiumSinceTimestamp && !newMember.premiumSinceTimestamp) {
      await newMember.client.ch.query(
        `INSERT INTO nitrousers (guildid, userid, stillboosting, boostends, days) VALUES ($1, $2, false, $3, $4)
        ON CONFLICT (guildid, userid) DO
        UPDATE SET boostends = array_append(nitrousers.boostends, $5), days = nitrousers.days + $4;`,
        [
          newMember.guild.id,
          newMember.user.id,
          [Date.now()],
          dateDiffInDays(new Date(oldMember.premiumSinceTimestamp, new Date())),
          Date.now(),
        ],
      );

      logEnd(newMember, await getDays(newMember));
    }
  },
};

const checkInserts = async (oM, nM) => {
  const timestamp = oM.premiumSinceTimestamp || nM.premiumSinceTimestamp;

  const res = await oM.client.ch.query(
    `SELECT * FROM nitrousers WHERE userid = $1 AND guildid = $2;`,
    [nM.user.id, nM.guild.id],
  );

  if (res && res.rowCount) {
    const [row] = res.rows;

    if (!row.booststarts.includes(timestamp)) {
      row.booststarts.push(timestamp);
    }

    if (!timestamp && row.booststarts.length !== row.boostends.length) {
      row.boostends.push(Date.now());
    }

    await oM.client.ch.query(
      `UPDATE nitrousers SET booststarts = $1, boostends = $2 WHERE userid = $3 AND guildid = $4;`,
      [row.booststarts, row.boostends, nM.user.id, nM.guild.id],
    );
  }
};

const dateDiffInDays = (a, b) => {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / 86400000);
};

const logEnd = async (member, days) => {
  const row = await getSettings(member);
  const language = await member.client.ch.languageSelector(member.guild);

  if (row && row.logchannels && row.logchannels.length) {
    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: language.guildMemberUpdateNitro.author.nameEnd,
      })
      .setDescription(
        member.client.ch
          .stp(language.guildMemberUpdateNitro.descriptionEnd, {
            user: member.user,
            days: Number(days),
          })
          .setColor(member.client.constants.guildMemberUpdate.color),
      );

    member.client.ch.send(
      row.logchannels.map((c) => member.client.channels.cache.get(c)),
      { embeds: [embed] },
    );
  }
};

const logStart = async (member, days) => {
  const row = await getSettings(member);
  const language = await member.client.ch.languageSelector(member.guild);

  if (row && row.logchannels && row.logchannels.length) {
    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: language.guildMemberUpdateNitro.author.nameStart,
      })
      .setDescription(
        member.client.ch
          .stp(language.guildMemberUpdateNitro.descriptionStart, {
            user: member.user,
            days: Number(days),
          })
          .setColor(member.client.constants.guildMemberUpdate.color),
      );

    member.client.ch.send(
      row.logchannels.map((c) => member.client.channels.cache.get(c)),
      { embeds: [embed] },
    );
  }
};

const getSettings = async (member) => {
  return (
    await member.client.ch.query(
      `SELECT * FROM nitrosettings WHERE guildid = $1 AND active = true;`,
      [member.guild.id],
    )
  )?.rows[0];
};

const getDays = async (member) => {
  return (
    await member.client.ch.query(`SELECT * FROM nitrousers WHERE guildid = $1 AND userid = $2;`, [
      member.guild.id,
      member.user.id,
    ])
  )?.rows[0]?.days;
};
