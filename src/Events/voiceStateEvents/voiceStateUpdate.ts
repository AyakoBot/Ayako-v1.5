import type * as Eris from 'eris';

export default async (member: Eris.Member, oldState: Eris.OldVoiceState) => {
  (await import('./log')).default(member, oldState);
};
