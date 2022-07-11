import type * as Eris from 'eris';

export default async (
  member: Eris.Member,
  channel: Eris.TextVoiceChannel | Eris.StageChannel,
  oldChannel: Eris.TextVoiceChannel | Eris.StageChannel,
) => {
  (await import('./log')).default(member, channel, oldChannel);
};
