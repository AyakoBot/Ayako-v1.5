import type Eris from 'eris';

export default (
  member: Eris.Member | undefined | null,
  comparedMember: Eris.Member | undefined | null,
) => {
  if (!member) return false;
  if (!comparedMember) return false;

  if (member.user.id === comparedMember.user.id) return false;
  if (!comparedMember.permissions.has(134217728n)) return false;

  const memberHighestRole = member.roles
    .sort(
      (a, b) =>
        Number(member.guild.roles.get(a)?.position) - Number(member.guild.roles.get(b)?.position),
    )
    .shift();
  const meHighestRole = comparedMember.roles
    .sort(
      (a, b) =>
        Number(member.guild.roles.get(a)?.position) - Number(member.guild.roles.get(b)?.position),
    )
    .shift();

  if (!meHighestRole || !memberHighestRole) return false;
  if (
    Number(member.guild.roles.get(memberHighestRole)?.position) >=
    Number(member.guild.roles.get(meHighestRole)?.position)
  ) {
    return false;
  }
  return true;
};
