const Discord = require('discord.js');

module.exports = {
  execute: async (guild) => {
    await guild.members.fetch().catch(() => {});

    const res = await guild.client.ch.query(`SELECT * FROM nitrousers WHERE guild = $1;`, [
      guild.id,
    ]);

    if (!res || !res.rowCount) return;
    res.rows.forEach(async (row) => {
      if (
        row.booststarts.length > row.boostends.length &&
        !guild.members.cache.get(row.userid)?.premiumSinceTimestamp
      ) {
        await guild.client.ch.query(
          `UPDATE nitrousers SET boostends = array_append(nitrousers.boostends, $1) WHERE guildid = $2 AND userid = $3;`,
          [Date.now(), guild.id, row.userid],
        );

        logEnd(
          guild.members.cache.get(row.userid),
          await getDays(guild.members.cache.get(row.userid)),
        );
      }

      if (
        row.booststarts.length === row.boostends.length &&
        guild.members.cache.get(row.userid)?.premiumSinceTimestamp
      ) {
        await guild.client.ch.query(
          `UPDATE nitrousers SET booststarts = array_append(nitrousers.booststarts, $1) WHERE guildid = $2 AND userid = $3;`,
          [guild.members.cache.get(row.userid).premiumSinceTimestamp, guild.id, row.userid],
        );

        logStart(
          guild.members.cache.get(row.userid),
          await getDays(guild.members.cache.get(row.userid)),
        );
      }
    });
  },
};

const logEnd = async (member, days) => {
  const row = await getSettings(member);
  const language = await member.client.ch.languageSelector(member.guild);

  if (row.logchannels && row.logchannels.length) {
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

  if (row.logchannels && row.logchannels.length) {
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
  return member.client.ch.query(
    `SELECT * FROM nitrosettings WHERE guildid = $1 AND active = true;`,
    [member.guild.id].rows[0],
  );
};

const getDays = async (member) => {
  return (
    await member.client.ch.query(`SELECT * FROM nitrousers WHERE guildid = $1 AND userid = $2;`, [
      member.guild.id,
      member.user.id,
    ])
  )?.rows[0]?.days;
};
