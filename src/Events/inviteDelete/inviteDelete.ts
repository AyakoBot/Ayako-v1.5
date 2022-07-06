import type * as Eris from 'eris';

export default async (guild: Eris.Guild, invite: Eris.Invite) => {
  (await import('./log')).default(guild, invite);
  (await import('./cacheUpdate')).default(guild, invite);
};
