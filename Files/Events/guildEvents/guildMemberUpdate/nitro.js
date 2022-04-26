const Builders = require('@discordjs/builders');

module.exports = {
  execute: async (oldMember, newMember) => {
    await checkInserts(oldMember, newMember);

    if (oldMember.premiumSinceTimestamp && newMember.premiumSinceTimestamp) {
      return;
    }

    if (newMember.premiumSinceTimestamp && !oldMember.premiumSinceTimestamp) {
      startedBoost(newMember);
      logStart(oldMember);
    }

    if (oldMember.premiumSinceTimestamp && !newMember.premiumSinceTimestamp) {
      stoppedBoost(oldMember);
      logEnd(newMember);
    }
  },
};

const startedBoost = (member) => {
  member.client.ch.query(
    `INSERT INTO nitrousers (guildid, userid, booststart) VALUES ($1, $2, $3);`,
    [member.guild.id, member.user.id, member.premiumSinceTimestamp],
  );
};

const stoppedBoost = (member) => {
  member.client.ch.query(
    `UPDATE nitrousers SET boostend = $1 WHERE userid = $2 AND guildid = $3 AND boostend IS NULL AND booststart = $4;`,
    [Date.now(), member.user.id, member.guild.id, member.premiumSinceTimestamp],
  );
};

const checkInserts = async (oM, nM) => {
  const timestamp = oM.premiumSinceTimestamp || nM.premiumSinceTimestamp;

  const res = await oM.client.ch.query(
    `SELECT * FROM nitrousers WHERE userid = $1 AND guildid = $2;`,
    [nM.user.id, nM.guild.id],
  );

  if (res && res.rowCount) {
    const [row] = res.rows;

    if (!row.booststarts) row.booststarts = [];

    if (!row.booststarts.includes(timestamp)) {
      row.booststarts.push(timestamp);
    }

    if (!timestamp && row.booststarts.length !== row.boostends?.length) {
      if (row.boostends?.length) {
        row.boostends.push(Date.now());
      } else row.boostends = [Date.now()];
    }

    await oM.client.ch.query(
      `UPDATE nitrousers SET booststarts = $1, boostends = $2 WHERE userid = $3 AND guildid = $4;`,
      [row.booststarts, row.boostends, nM.user.id, nM.guild.id],
    );
  }
};

const logEnd = async (member) => {
  const row = await getSettings(member);
  const language = await member.client.ch.languageSelector(member.guild);

  if (row && row.logchannels && row.logchannels.length) {
    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: language.guildMemberUpdateNitro.author.nameEnd,
      })
      .setDescription(
        member.client.ch
          .stp(language.guildMemberUpdateNitro.descriptionEnd, {
            user: member.user,
          })
          .setColor(member.client.constants.guildMemberUpdate.color),
      );

    member.client.ch.send(
      row.logchannels.map((c) => member.client.channels.cache.get(c)),
      { embeds: [embed] },
      5000,
    );
  }
};

const logStart = async (member) => {
  const row = await getSettings(member);
  const language = await member.client.ch.languageSelector(member.guild);

  if (row && row.logchannels && row.logchannels.length) {
    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: language.guildMemberUpdateNitro.author.nameStart,
      })
      .setDescription(
        member.client.ch
          .stp(language.guildMemberUpdateNitro.descriptionStart, {
            user: member.user,
          })
          .setColor(member.client.constants.guildMemberUpdate.color),
      );

    member.client.ch.send(
      row.logchannels.map((c) => member.client.channels.cache.get(c)),
      { embeds: [embed] },
      5000,
    );
  }
};

const getSettings = async (member) => {
  const res = await member.client.ch.query(
    `SELECT * FROM nitrosettings WHERE guildid = $1 AND active = true;`,
    [member.guild.id],
  );
  if (res && res.rowCount) return res.rows[0];
  return null;
};
