import type Eris from 'eris';
import type * as DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

export default async (msg: Eris.Message) => {
    if (msg.guildID && client.guilds.get(msg.guildID)?.unavailable) return;

  require('./ashes')(msg);
  if (msg.author.discriminator === '0000') return;

  require('./commandHandler')(msg);
  require('./afk')(msg);
  require('./disboard')(msg);
  require('./leveling')(msg);
  require('./blacklist')(msg);
  require('./willis')(msg);
  require('./DMlog')(msg);
  require('./other')(msg);
  require('./shoob')(msg);
  require('./nadeko')(msg);
  require('./antivirus')(msg);
  require('./autothreading')(msg);

  if (!msg.editedTimestamp) {
    if (client.uptime > 10000) {
      const r: DBT.stats = await client.ch.query('SELECT * FROM stats;').then((r: any) => (r ? r[0] : null));
      if (r?.antispam === true) require('./antispam')(msg);
    }
  }
};
