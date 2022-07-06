import type Eris from 'eris';

export default async (guild: Eris.Guild, member: Eris.Member | { id: string; user: Eris.User }) => {
  (await import('./log')).default(guild, member);
  (await import('./sticky')).default(guild, member);
  (await import('./nitro')).default(guild, member);
};
