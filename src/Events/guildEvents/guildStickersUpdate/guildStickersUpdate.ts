import type * as Eris from 'eris';

export default async (guild: Eris.Guild, stickers: Eris.Sticker[], oldStickers: Eris.Sticker[]) => {
  (await import('./log')).default(guild, stickers, oldStickers);
};
