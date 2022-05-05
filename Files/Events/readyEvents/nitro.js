const Builders = require('@discordjs/builders');

module.exports = async () => {
  const client = require('../../BaseClient/DiscordClient');

  client.guilds.cache.forEach(async (guild) => {
    if (!guild.available) return;
    if (!guild.roles.cache.find((r) => r.tags.premiumSubscriberRole === true)) return;
    await guild.members.fetch().catch(() => {});

    const addedMembers = [];
    const removedMembers = [];

    const res = await client.ch.query(`SELECT * FROM nitrousers WHERE guildid = $1;`, [guild.id]);

    if (res && res.rowCount) {
      res.rows.forEach((row) => {
        if (!row.boostend && !guild.members.cache.get(row.userid)?.premiumSinceTimestamp) {
          client.ch.query(
            `UPDATE nitrousers SET boostend = $1 WHERE guildid = $2 AND userid = $3 AND booststart = $4;`,
            [Date.now(), guild.id, row.userid, row.booststart],
          );
          removedMembers.push(guild.members.cache.get(row.userid));
        }
      });
    }

    guild.members.cache.forEach((member) => {
      member.client = client;

      if (member.premiumSinceTimestamp) {
        if (!res || !res.rowCount) {
          client.ch.query(
            `INSERT INTO nitrousers (guildid, userid, booststart) VALUES ($1, $2, $3);`,
            [guild.id, member.id, member.premiumSinceTimestamp],
          );

          addedMembers.push(member);
        } else {
          const row = res.rows.find(
            (r) =>
              r.userid === member.user.id && Number(r.booststart) === member.premiumSinceTimestamp,
          );
          if (!row) {
            client.ch.query(
              `INSERT INTO nitrousers (guildid, userid, booststart) VALUES ($1, $2, $3);`,
              [guild.id, member.id, member.premiumSinceTimestamp],
            );

            addedMembers.push(member);
          }
        }
      }
    });

    [...new Set(addedMembers)].forEach((m) => logStart(m));
    [...new Set(removedMembers)].forEach((m) => logEnd(m));
  });
};

const logEnd = async (member) => {
  const row = await getSettings(member);
  const language = await member.client.ch.languageSelector(member.guild);

  if (row?.logchannels && row.logchannels.length) {
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
  if (!row) return;
  const language = await member.client.ch.languageSelector(member.guild);

  if (row.logchannels && row.logchannels.length) {
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
  const res = member.client.ch.query(
    `SELECT * FROM nitrosettings WHERE guildid = $1 AND active = true;`,
    [member.guild.id],
  );
  if (res && res.rowCount) return res.rows[0];
  return null;
};
