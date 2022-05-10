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
      if (!member) return;

      if (member.premiumSinceTimestamp) {
        if (!res || !res.rowCount) {
          client.ch.query(
            `INSERT INTO nitrousers (guildid, userid, booststart) VALUES ($1, $2, $3) ON CONFLICT (booststart) DO NOTHING;`,
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
              `INSERT INTO nitrousers (guildid, userid, booststart) VALUES ($1, $2, $3) ON CONFLICT (booststart) DO NOTHING;`,
              [guild.id, member.id, member.premiumSinceTimestamp],
            );

            addedMembers.push(member);
          }
        }
      }
    });

    [...new Set(addedMembers)].forEach((m) => logStart(m, guild, client));
    [...new Set(removedMembers)].forEach((m) => logEnd(m, guild, client));
  });
};

const logEnd = async (member, guild, client) => {
  const row = await getSettings(member, guild, client);
  const language = await client.ch.languageSelector(guild);

  if (row?.logchannels && row.logchannels.length) {
    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: language.guildMemberUpdateNitro.author.nameEnd,
      })
      .setDescription(
        client.ch
          .stp(language.guildMemberUpdateNitro.descriptionEnd, {
            user: member.user,
          })
          .setColor(client.constants.guildMemberUpdate.color),
      );

    client.ch.send(
      row.logchannels.map((c) => client.channels.cache.get(c)),
      { embeds: [embed] },
      5000,
    );
  }
};

const logStart = async (member, guild, client) => {
  const row = await getSettings(member, guild, client);
  if (!row) return;
  const language = await client.ch.languageSelector(guild);

  if (row.logchannels && row.logchannels.length) {
    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: language.guildMemberUpdateNitro.author.nameStart,
      })
      .setDescription(
        client.ch
          .stp(language.guildMemberUpdateNitro.descriptionStart, {
            user: member.user,
          })
          .setColor(client.constants.guildMemberUpdate.color),
      );

    client.ch.send(
      row.logchannels.map((c) => client.channels.cache.get(c)),
      { embeds: [embed] },
      5000,
    );
  }
};

const getSettings = async (member, guild, client) => {
  const res = client.ch.query(`SELECT * FROM nitrosettings WHERE guildid = $1 AND active = true;`, [
    guild.id,
  ]);
  if (res && res.rowCount) return res.rows[0];
  return null;
};
