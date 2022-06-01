import type Eris from 'eris';
import ch from '../ClientHelper';

export default async (guild: Eris.Guild) => {
  const guildid = guild?.id ? guild?.id : guild;
  if (guildid) {
    const resLan = await ch.query('SELECT lan FROM guildsettings WHERE guildid = $1;', [guildid]);
    let lang = 'en';
    if (resLan && resLan.rowCount > 0) lang = resLan.rows[0].lan;
    return require(`../Languages/lan-${lang}.json`);
  }
  return require('../Languages/lan-en.json');
};
