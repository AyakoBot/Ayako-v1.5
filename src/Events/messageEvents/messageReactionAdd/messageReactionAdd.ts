import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default async (
  rawMsg: Eris.Message,
  reaction: Eris.Emoji,
  member: { id: string } | Eris.Member,
) => {
  if (rawMsg.channel.type === 1) return;
  const msg = await client.ch.msgCTConvert(rawMsg);
  if (!msg) return;
  const user: Eris.User = 'user' in member ? member.user : await client.getRESTUser(member.id);

  (await import('./willis')).default(msg, reaction, user);
  (await import('./reactionRoles')).default(msg, reaction, user);
  (await import('./log')).default(msg, reaction, user);
};
