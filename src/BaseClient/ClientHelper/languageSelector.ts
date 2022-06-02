import ch from '../ClientHelper';
import type DBT from '../../typings/DataBaseTypings';

export default async (guildID: string | undefined) => {
  if (guildID) {
    const row = await ch
      .query('SELECT * FROM guildsettings WHERE guildid = $1;', [guildID])
      .then((r: DBT.guildsettings[] | null) => (r ? r[0] : null));

    return import(`../../Languages/lan-${row ? row.lan : 'en'}.json`);
  }
  return import(`../../Languages/lan-en.json`);
};
