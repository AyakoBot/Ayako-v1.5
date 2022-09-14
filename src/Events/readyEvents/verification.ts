import type * as Eris from 'eris';
import client from '../../BaseClient/ErisClient';
import type DBT from '../../typings/DataBaseTypings';

export default async () => {
  const verificationRows = await client.ch
    .query('SELECT * FROM verification WHERE active = true AND kicktof = true;')
    .then((r: DBT.verification[] | null) => r || null);
  if (!verificationRows) return;

  verificationRows.forEach(async (r) => {
    if (!r.kickafter) return;
    const guild = client.guilds.get(r.guildid);
    if (!guild) return;

    await guild.getRESTMembers();
    const language = await client.ch.languageSelector(guild.id);
    const embed = getEmbed(guild, language.verification);

    const unverifiedRoleCheck = () => {
      if (!r.pendingrole) return;
      const unverifiedRole = guild.roles.get(r.pendingrole);
      if (!unverifiedRole) return;

      guild.members
        .filter((m) => m.roles.includes(unverifiedRole.id))
        .forEach(async (member) => {
          if (Number(member.joinedAt) >= Math.abs(Date.now() - Number(r.kickafter) * 60000)) return;
          if (isKickable(member)) {
            const DM = await member.user.getDMChannel().catch(() => null);
            if (DM) await client.ch.send(DM, { embeds: [embed] }, language);

            member.kick(language.verification.kickReason).catch(() => null);
          }
        });
    };

    const noRoleCheck = () => {
      const members = guild.members.filter((m) => m.roles.length === 1);
      members.forEach(async (member) => {
        if (Number(member.joinedAt) >= Math.abs(Date.now() - Number(r.kickafter) * 60000)) return;
        if (isKickable(member)) {
          const DM = await member.user.getDMChannel().catch(() => null);
          if (DM) await client.ch.send(DM, { embeds: [embed] }, language);

          member.kick(language.verification.kickReason).catch(() => null);
        }
      });
    };

    if (r.pendingrole) unverifiedRoleCheck();
    else noRoleCheck();
  });
};

const getEmbed = (
  guild: Eris.Guild,
  lan: typeof import('../../Languages/en.json')['verification'],
): Eris.Embed => ({
  type: 'rich',
  description: client.ch.stp(lan.kickMsg, { guild }),
  color: client.constants.mod.kickAdd.color,
});

const isKickable = (m: Eris.Member | null | undefined) =>
  m &&
  client.ch.isManageable(m, m.guild.members.get(client.user.id)) &&
  m.guild.members.get(client.user.id)?.permissions.has(2n);
