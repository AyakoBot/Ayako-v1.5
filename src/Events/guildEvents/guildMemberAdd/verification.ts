import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async (
  member: Eris.Member,
  guild: Eris.Guild,
  language: typeof import('../../../Languages/lan-en.json'),
) => {
  const verificationRow = await client.ch
    .query('SELECT * FROM verification WHERE guildid = $1 AND active = $2;', [guild.id, true])
    .then((r: DBT.verification[] | null) => (r ? r[0] : null));

  if (!verificationRow) return;

  if (verificationRow.pendingrole) {
    client.ch.roleManager.add(
      member,
      [verificationRow.pendingrole],
      language.events.guildMemberAdd.verificationReason,
    );
  }
  if (!verificationRow.selfstart) return;

  const dm = await member.user.getDMChannel().catch(() => null);
  if (!dm) return;

  (await import('../../../SlashCommands/verify')).startVerification(
    { member, guild },
    language,
    language.verification,
    verificationRow,
  );
};
