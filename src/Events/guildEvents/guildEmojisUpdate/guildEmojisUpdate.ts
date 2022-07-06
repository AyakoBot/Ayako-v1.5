import type * as Eris from 'eris';

export default async (guild: Eris.Guild, emojis: Eris.Emoji[], oldEmojis: Eris.Emoji[]) => {
  (await import('./log')).default(guild, emojis, oldEmojis);
};
