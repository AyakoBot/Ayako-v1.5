import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default async (guild: Eris.Guild, member: Eris.Member) => {
  const language = await client.ch.languageSelector(guild.id);

  (await import('./log')).default(member, guild, language);
  (await import('./welcome')).default(member, guild, language);
  (await import('./verification')).default(member, guild, language);
  (await import('./antiraid')).default(member, guild, language);
  (await import('./sticky')).default(member, guild, language);
  (await import('./autoroles')).default(member, guild, language);
  (await import('./dmAd')).default(member, guild);
};
