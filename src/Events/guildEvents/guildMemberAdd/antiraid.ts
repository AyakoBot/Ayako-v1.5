import type Eris from 'eris';
import Jobs from 'node-schedule';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

const antiraidCache: Map<string, { time: number; joins: number; timeout: Jobs.Job }> = new Map();
const sendings: Map<string, { time: number; joins: number; timeout: Jobs.Job }> = new Map();

export default async (
  member: Eris.Member,
  guild: Eris.Guild,
  language: typeof import('../../../Languages/lan-en.json'),
) => {
  if (!member || !guild) return;

  const antiraidsettingsRow = await client.ch
    .query('SELECT * FROM antiraidsettings WHERE guildid = $1 AND active = true;', [guild.id])
    .then((r: DBT.antiraidsettings[] | null) => (r ? r[0] : null));
  if (!antiraidsettingsRow) return;

  addMember(member, guild, antiraidsettingsRow);
  check(guild, antiraidsettingsRow, language);
};

const addMember = (member: Eris.Member, guild: Eris.Guild, r: DBT.antiraidsettings) => {
  if (!member.joinedAt) return;

  const cache = antiraidCache.get(guild.id);
  if (cache) cache.timeout.cancel();

  antiraidCache.set(guild.id, {
    time: member.joinedAt,
    joins: (cache?.joins || 0) + 1,
    timeout: Jobs.scheduleJob(new Date(Date.now() + Number(r.time)), () => {
      antiraidCache.delete(guild.id);
    }),
  });
};

const check = (
  guild: Eris.Guild,
  r: DBT.antiraidsettings,
  language: typeof import('../../../Languages/lan-en.json'),
) => {
  if (!antiraidCache.has(guild.id)) return null;

  const cache = antiraidCache.get(guild.id);
  if (cache && cache.joins >= Number(r.jointhreshold)) {
    if (sendings.has(guild.id)) {
      sendings.get(guild.id)?.timeout.cancel();
    }

    sendings.set(guild.id, {
      time: cache.time,
      joins: cache.joins,
      timeout: Jobs.scheduleJob(new Date(Date.now() + Number(r.time)), () => {
        client.emit('antiraidHandler', sendings.get(guild.id), guild, r, language);
        antiraidCache.delete(guild.id);
      }),
    });
  }

  return null;
};
