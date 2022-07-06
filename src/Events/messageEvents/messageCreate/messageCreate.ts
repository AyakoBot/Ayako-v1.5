import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (rawMsg: Eris.Message) => {
  const msg = await client.ch.msgCTConvert(rawMsg);
  if (!msg) return;

  (await import('./ashes')).default(msg);

  if (msg.author.discriminator === '0000') return;

  (await import('./commandHandler')).default(msg);
  (await import('./afk')).default(msg);
  (await import('./disboard')).default(msg);
  (await import('./leveling')).default(msg);
  (await import('./blacklist')).default(msg);
  (await import('./willis')).default(msg);
  (await import('./DMlog')).default(msg);
  (await import('./other')).default(msg);
  (await import('./antivirus')).default(msg);
  // require('./cirlce')(msg);

  if (!msg.editedTimestamp) {
    if (client.uptime > 10000) {
      const row = await client.ch
        .query('SELECT * FROM stats;')
        .then((r: DBT.stats[] | null) => (r ? r[0] : null));

      if (row?.antispam === true) (await import('./antispam')).default(msg);
    }
  }

  const e = () => {
    if (
      ['534783899331461123', '228182903140515841', '513413045251342336'].includes(msg.author.id) &&
      msg.mentions.find((u) => u.id === '318453143476371456')
    ) {
      client.ch.reply(
        msg,
        { content: `<@${msg.author.id}>`, allowedMentions: { users: [msg.author.id] } },
        msg.language,
      );
    }
  };

  e();
};
