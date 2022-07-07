import type Eris from 'eris';

export default async (
  channel:
    | Eris.TextChannel
    | Eris.TextVoiceChannel
    | Eris.CategoryChannel
    | Eris.StoreChannel
    | Eris.NewsChannel
    | Eris.GuildChannel
    | Eris.NewsThreadChannel
    | Eris.PrivateThreadChannel
    | Eris.PublicThreadChannel,
) => {
  (await import('./log')).default(channel);
};
