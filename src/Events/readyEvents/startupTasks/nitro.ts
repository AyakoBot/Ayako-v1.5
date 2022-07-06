import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async () => {
  client.guilds.forEach(async (guild) => {
    if (guild.unavailable) return;
    if (!guild.roles.find((r) => r.tags?.premium_subscriber === true)) return;
    await guild.getRESTMembers().catch(() => null);

    const addedMembers: Eris.Member[] = [];
    const removedMembers: Eris.Member[] = [];

    const nitrousersRows = await client.ch
      .query(`SELECT * FROM nitrousers WHERE guildid = $1;`, [guild.id])
      .then((r: DBT.nitrousers[] | null) => r || null);
    if (!nitrousersRows) return;

    nitrousersRows.forEach((row) => {
      if (!row.boostend && !guild.members.get(row.userid)?.premiumSince) {
        if (!row.userid) return;

        client.ch.query(
          `UPDATE nitrousers SET boostend = $1 WHERE guildid = $2 AND userid = $3 AND booststart = $4;`,
          [Date.now(), guild.id, row.userid, row.booststart],
        );

        const member = guild.members.get(row.userid);
        if (!member) return;
        removedMembers.push(member);
      }
    });

    guild.members.forEach((member) => {
      if (!member) return;

      if (member.premiumSince) {
        if (!nitrousersRows) {
          client.ch.query(
            `INSERT INTO nitrousers (guildid, userid, booststart) VALUES ($1, $2, $3) ON CONFLICT (booststart) DO NOTHING;`,
            [guild.id, member.id, member.premiumSince],
          );

          addedMembers.push(member);
        } else {
          const row = nitrousersRows.find(
            (r) => r.userid === member.user.id && Number(r.booststart) === member.premiumSince,
          );

          if (!row) {
            client.ch.query(
              `INSERT INTO nitrousers (guildid, userid, booststart) VALUES ($1, $2, $3) ON CONFLICT (booststart) DO NOTHING;`,
              [guild.id, member.id, member.premiumSince],
            );

            if (!member) return;
            addedMembers.push(member);
          }
        }
      }
    });

    [...new Set(addedMembers)].forEach((m) => logStart(m, guild));
    [...new Set(removedMembers)].forEach((m) => logEnd(m, guild));
  });
};

const logEnd = async (member: Eris.Member, guild: Eris.Guild) => {
  const row = await getSettings(guild);
  if (!row?.logchannels || !row.logchannels.length) return;

  const language = await client.ch.languageSelector(guild.id);

  const embed = {
    type: 'rich',
    author: {
      name: language.events.guildMemberUpdate.boostingEnd,
    },
    description: client.ch.stp(language.events.guildMemberUpdate.descriptionBoostingEnd, {
      user: member.user,
    }),
    color: client.constants.events.guildMemberUpdate.color,
  };

  client.ch.send(
    row.logchannels.map((c) => guild.channels.get(c)),
    { embeds: [embed] },
    language,
    null,
    10000,
  );
};

const logStart = async (member: Eris.Member, guild: Eris.Guild) => {
  const row = await getSettings(guild);
  if (!row?.logchannels || !row.logchannels.length) return;

  const language = await client.ch.languageSelector(guild.id);

  const embed = {
    type: 'rich',
    author: {
      name: language.events.guildMemberUpdate.boostingStart,
    },
    description: client.ch.stp(language.events.guildMemberUpdate.descriptionBoostingStart, {
      user: member.user,
    }),
    color: client.constants.events.guildMemberUpdate.color,
  };

  client.ch.send(
    row.logchannels.map((c) => guild.channels.get(c)),
    { embeds: [embed] },
    language,
    null,
    10000,
  );
};

const getSettings = async (guild: Eris.Guild) =>
  client.ch
    .query(`SELECT * FROM nitrosettings WHERE guildid = $1 AND active = true;`, [guild.id])
    .then((r: DBT.nitrosettings[] | null) => (r ? r[0] : null));
