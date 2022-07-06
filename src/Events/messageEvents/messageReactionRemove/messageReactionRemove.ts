import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default async (rawMsg: Eris.Message, reaction: Eris.Emoji, userID: string) => {
  const msg = await client.ch.msgCTConvert(rawMsg);
  if (!msg) return;
  const user = await client.getRESTUser(userID);

  (await import('./reactionRoles')).default(msg, reaction, user);
  (await import('./log')).default(msg, reaction, user);
};
