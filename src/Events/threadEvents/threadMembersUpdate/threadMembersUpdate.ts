import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default async (
  channel: Eris.NewsThreadChannel | Eris.PrivateThreadChannel | Eris.PublicThreadChannel,
  addedMembers: Eris.ThreadMember[],
  rawRemovedMembers: Eris.ThreadMember[] | { id: string }[],
) => {
  await channel.guild.getRESTMembers();

  const users = (
    await Promise.all(
      rawRemovedMembers
        .filter((m) => Object.keys(m).length === 1)
        .map((m) => client.ch.getUser(m.id)),
    )
  ).filter((u): u is Eris.User => !!u);

  const leftServerUsers = await Promise.all(
    users.filter((u) => !client.ch.getMember(u.id, channel.guild.id)),
  );

  const leftThreadUsers = users.filter((u) => !leftServerUsers.map((u2) => u2.id).includes(u.id));
  if (rawRemovedMembers.length && !leftThreadUsers.length) return;

  const addedUsers = (await Promise.all(addedMembers.map((m) => client.ch.getUser(m.id)))).filter(
    (r): r is Eris.User => !!r,
  );
  if (!leftThreadUsers.length && !addedUsers.length) return;

  (await import('./log')).default(channel, addedUsers, leftThreadUsers);
};
