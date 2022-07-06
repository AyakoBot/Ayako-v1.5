import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default async (rawMsg: Eris.Message) => {
  if (rawMsg.channel.type === 1) return;
  const msg = await client.ch.msgCTConvert(rawMsg);
  if (!msg) return;

  (await import('./giveaway')).default(msg);
  (await import('./log')).default(msg);
};
