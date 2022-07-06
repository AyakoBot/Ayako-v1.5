import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default async (rawMsg: Eris.Message, oldMsg?: Eris.OldMessage) => {
  if (rawMsg.channel.type === 1) return;
  if (!oldMsg) return;

  const msg = await client.ch.msgCTConvert(rawMsg);
  if (!msg) return;

  (await import('./log')).default(msg, oldMsg);
  (await import('./editCommand')).default(msg, oldMsg);
};
