import type * as Eris from 'eris';

export default async (guild: Eris.Guild, role: Eris.Role, oldRole: Eris.OldRole) => {
  (await import('./log')).default(guild, role, oldRole);
};
