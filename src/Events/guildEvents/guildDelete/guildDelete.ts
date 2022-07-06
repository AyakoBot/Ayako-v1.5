import type Eris from 'eris';

export default async (guild: Eris.Guild) => {
  (await import('./log')).default(guild);
  (await import('./cacheUpdate')).default(guild);
};
