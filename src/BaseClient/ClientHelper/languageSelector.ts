import type Eris from 'eris';
import ch from '../ClientHelper';
import type DBT from '../../typings/DataBaseTypings';

export default async (guild: Eris.Guild) => {
  const guildid = guild?.id ? guild?.id : guild;
  if (guildid) {
    const rows: DBT.guildsettings = await ch.query('SELECT * FROM guildsettings WHERE guildid = $1;', [guildid]).then((r: any[] | null) => r ? r[0] : null);
    let lang = 'en';
    if (rows) lang = rows.lan;
    return import(`../../Languages/lan-${lang}.json`);
  }
  return import('../../Languages/lan-en.json');
};
