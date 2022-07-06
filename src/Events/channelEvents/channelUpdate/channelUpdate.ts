import type Eris from 'eris';

export default async (
  channel:
    | Eris.TextChannel
    | Eris.TextVoiceChannel
    | Eris.CategoryChannel
    | Eris.StoreChannel
    | Eris.NewsChannel
    | Eris.GuildChannel,
  oldChannel: Eris.OldGuildChannel | Eris.OldGuildTextChannel | Eris.OldTextVoiceChannel,
) => {
  (await import('./log')).default(channel, oldChannel);
  (await import('./sticky')).default(channel, oldChannel);
};
