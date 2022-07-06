import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default async (guild: Eris.Guild, rawMember: Eris.Member, oldMember: Eris.OldMember) => {
  if (!oldMember) return;

  const member =
    Object.keys(rawMember).length === 2
      ? await client.ch.getMember(rawMember.user.id, guild.id)
      : rawMember;
  if (!member) return;

  const language = await client.ch.languageSelector(guild.id);

  (await import('./log')).default(guild, member, oldMember, language);
  (await import('./nitro')).default(guild, member, oldMember, language);
  (await import('./separator')).default(guild, member, oldMember, language);
};
