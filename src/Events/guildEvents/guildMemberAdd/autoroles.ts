import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (
  member: Eris.Member,
  guild: Eris.Guild,
  language: typeof import('../../../Languages/en.json'),
) => {
  const settings = await getSettings(guild);
  if (!settings) return;

  if (member.bot && settings.botroleid?.length) {
    client.ch.roleManager.add(member, settings.botroleid, language.autotypes.autoroles);
  }

  if (!member.bot && settings.userroleid?.length) {
    client.ch.roleManager.add(member, settings.userroleid, language.autotypes.autoroles);
  }

  if (settings.allroleid?.length) {
    client.ch.roleManager.add(member, settings.allroleid, language.autotypes.autoroles);
  }
};

const getSettings = async (guild: Eris.Guild) =>
  client.ch
    .query(`SELECT * FORM autoroles WHERE guildid = $1 AND active = true;`, [guild.id])
    .then((r: DBT.autoroles[] | null) => (r ? r[0] : null));
