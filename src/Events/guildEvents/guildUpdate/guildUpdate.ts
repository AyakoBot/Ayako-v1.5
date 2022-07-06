import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default async (guild: Eris.Guild, oldGuild: Eris.OldGuild) => {
  if (!oldGuild) return;

  const language = await client.ch.languageSelector(guild.id);

  (await import('./log')).default(guild, oldGuild, language);
  (await import('./vanity')).default(guild);
};
