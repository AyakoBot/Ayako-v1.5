import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async () => {
  client.guilds.forEach(async (guild) => {
    const antiviruslogRows = await client.ch
      .query('SELECT * FROM antiviruslog WHERE guildid = $1;', [guild.id])
      .then((r: DBT.antiviruslog[] | null) => r || null);
    if (!antiviruslogRows) return;

    antiviruslogRows.forEach((r) => {
      if (Number(r.dateofwarn) > Date.now() - 3600000) return;

      client.ch.query(
        'DELETE FROM antiviruslog WHERE dateofwarn = $1 AND userid = $2 AND guildid = $3;',
        [r.dateofwarn, r.userid, guild.id],
      );
    });
  });
};
