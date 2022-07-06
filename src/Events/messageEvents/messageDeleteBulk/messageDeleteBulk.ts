import type Eris from 'eris';

export default async (
  msgs: (Eris.Message | { id: string; guildID: string; channel: { id: string } })[],
) => {
  (await import('./log')).default(msgs);
};
