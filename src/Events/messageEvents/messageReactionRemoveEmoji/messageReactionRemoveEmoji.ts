import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default async (
  rawMsg: Eris.Message | { id: string; channel: { id: string }; guildID: string },
  reaction: { animated?: boolean; id?: string; name: string },
) => {
  if (!rawMsg.guildID) return;
  const msg = await client.ch.msgCTConvert(rawMsg);
  if (!msg) return;

  (await import('./log')).default(msg, reaction);
};
