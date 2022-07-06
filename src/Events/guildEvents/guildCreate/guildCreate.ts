import type Eris from 'eris';

export default async (guild: Eris.Guild) => {
  (await import('./log')).default(guild);
  (await import('./role')).default(guild);
  (await import('./welcome')).default(guild);
  (await import('./cacheUpdate')).default(guild);
};
