import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
// import type DBT from '../../../typings/DataBaseTypings';

export default async (msg: Eris.Message) => {
  const language = await client.ch.languageSelector(msg.guildID);
  (await import('./ashes')).default(msg, language);

  if (msg.author.discriminator === '0000') return;

  e(msg);
  // (await import('./commandHandler')).default(msg);
  // (await import('./afk')).default(msg);
  // (await import('./disboard')).default(msg);
  // (await import('./leveling')).default(msg);
  // (await import('./blacklist')).default(msg);
  // (await import('./willis')).default(msg);
  // (await import('./DMlog')).default(msg);
  // (await import('./other')).default(msg);
  // (await import('./shoob')).default(msg);
  // (await import('./nadeko')).default(msg);
  // (await import('./antivirus')).default(msg);
  // (await import('./autothreading')).default(msg);
  // require('./cirlce')(msg);
  if (!msg.editedTimestamp) {
    if (client.uptime > 10000) {
      // const row = await client.ch.query('SELECT * FROM stats;');
      //  .then((r: DBT.stats[] | null) => (r ? r[0] : null));
      // if (row?.antispam === true) (await import('./antispam')).default(msg);
    }
  }
};

const e = (msg: Eris.Message) => {
  if (
    ['534783899331461123', '228182903140515841'].includes(msg.author.id) &&
    msg.mentions.findIndex((u) => u.id === '318453143476371456')
  ) {
    msg.channel.createMessage({ content: `<@${msg.author.id}>` });
  }
};
