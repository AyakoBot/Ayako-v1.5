import type * as Eris from 'eris';
import type CT from '../../typings/CustomTypings';
import client from '../../BaseClient/ErisClient';

export default async (user: Eris.User, oldUser: CT.OldUser | null) => {
  const guildsWithThisUser = await Promise.all(
    client.guilds.filter((g) => !!client.ch.getMember(user.id, g.id)),
  );

  if (!oldUser) return;

  guildsWithThisUser.forEach(async (g) => {
    (await import('./log')).default(g, user, oldUser);
  });
};
