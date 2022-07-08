import type * as Eris from 'eris';
import type CT from '../../typings/CustomTypings';
import client from '../../BaseClient/ErisClient';

export default async (user: Eris.User, oldUser: CT.OldUser | null) => {
  const guildsWithThisUser = client.guilds.filter((g) => g.members.has(user.id));

  if (!oldUser) return;

  guildsWithThisUser.forEach(async (g) => {
    (await import('./log')).default(g, user, oldUser);
  });
};
