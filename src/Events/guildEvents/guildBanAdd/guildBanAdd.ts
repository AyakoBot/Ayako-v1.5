import type Eris from 'eris';

export default async (guild: Eris.Guild, user: Eris.User) => {
  (await import('./log')).default(guild, user);
};
