import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (guild: Eris.Guild) => {
  if (guild.premiumTier !== 3) return;

  const vanity = await getVanity(guild);
  if (!vanity) return;

  const actualVanity = vanity.replace(/ /g, '-').slice(0, 26);

  if (guild.vanityURL === actualVanity) return;
  if (!guild.members.get(client.user.id)?.permissions.has(8n)) return;

  guild.editVanity(actualVanity);
};

const getVanity = async (g: Eris.Guild) =>
  client.ch
    .query(`SELECT vanity FROM guildsettings WHERE guildid = $1;`, [g.id])
    .then((r: DBT.guildsettings[] | null) => (r ? r[0].vanity : null));
