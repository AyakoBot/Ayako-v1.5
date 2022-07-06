import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (guild: Eris.Guild, member: Eris.Member | { id: string; user: Eris.User }) => {
  if (!('roles' in member) || !member.roles.length) return;

  const stickyRow = await client.ch
    .query(`SELECT * FROM sticky WHERE stickyrolesactive = true AND guildid = $1;`, [guild.id])
    .then((r: DBT.sticky[] | null) => (r ? r[0] : null));

  if (!stickyRow) return;

  client.ch.query(
    `INSERT INTO stickyrolemembers (guildid, userid, roles) VALUES ($1, $2, $3) ON CONFLICT (guildid, userid) DO UPDATE SET roles = $3;`,
    [guild.id, member.user.id, member.roles],
  );
};
