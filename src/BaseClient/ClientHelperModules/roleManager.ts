import * as Jobs from 'node-schedule';
import type Eris from 'eris';
import isManageable from './isManageable';

const MemberCache: {
  member: Eris.Member;
  addRoles?: string[];
  removeRoles?: string[];
  prio: number;
  reason: string;
  added: number;
}[] = [];

const GuildCache: Map<string, { job: Jobs.Job; members: typeof MemberCache; guild: Eris.Guild }> =
  new Map();

const roleManager = {
  add: async (member: Eris.Member, roles: string[], reason: string, prio = 2) => {
    handleRoleUpdate(member, roles, reason, prio, 'addRoles');
  },
  remove: async (member: Eris.Member, roles: string[], reason: string, prio = 2) => {
    handleRoleUpdate(member, roles, reason, prio, 'removeRoles');
  },
};

const handleRoleUpdate = async (
  member: Eris.Member,
  roles: string[],
  reason: string,
  prio: number,
  type: 'addRoles' | 'removeRoles',
) => {
  const client = (await import('../ErisClient')).default;
  if (!isManageable(member, member.guild.members.get(client.user.id))) return;
  if (!member.guild.members.get(client.user.id)?.permissions.has(268435456n)) return;

  const guild = GuildCache.get(member.guild.id);
  if (!guild) {
    GuildCache.set(member.guild.id, {
      job: Jobs.scheduleJob('*/1 * * * * *', () => runJob(member.guild.id)),
      members: [{ member, [type]: roles, reason, prio, added: Date.now() }],
      guild: member.guild,
    });
    return;
  }

  const existingEntry = MemberCache[MemberCache.findIndex((c) => c.member.id === member.id)];
  if (existingEntry) {
    existingEntry[type] = existingEntry[type]?.length
      ? [...new Set([...(existingEntry[type] as string[]), ...roles])]
      : roles;

    return;
  }

  MemberCache.push({ member, [type]: roles, prio, reason, added: Date.now() });
};

export default roleManager;

const runJob = async (guildID: string) => {
  const memberCache = GuildCache.get(guildID);
  if (!memberCache) return;

  const prioSort = memberCache?.members.sort((a, b) => a.prio - b.prio);
  const highestPrio = prioSort[0]?.prio;
  if (!highestPrio) return;

  const prioFilter = memberCache?.members.filter((m) => m.prio === highestPrio);
  const dateFilter = prioFilter.sort((a, b) => b.added - a.added);
  const memberData = dateFilter[0];
  const client = (await import('../ErisClient')).default;
  const roles = memberData.addRoles?.length
    ? [...memberData.member.roles, ...memberData.addRoles]
    : memberData.member.roles;
  const clientHighestRole = memberCache.guild.members
    .get(client.user.id)
    ?.roles.sort(
      (a, b) =>
        Number(memberCache.guild.roles.get(b)?.position) -
        Number(memberCache.guild.roles.get(a)?.position),
    )
    .shift();
  if (!clientHighestRole) return;

  const editedRoles = roles.filter((r) => {
    const role = memberCache.guild.roles.get(r);

    if (!role) return false;
    if (memberData.removeRoles?.includes(r)) return false;

    if (Number(memberCache.guild.roles.get(clientHighestRole)?.position) < role.position) {
      return false;
    }

    return true;
  });

  const roleAdd = await memberData.member
    .edit({ roles: editedRoles }, memberData.reason)
    .catch(() => null);
  if (!roleAdd) return;

  const index = memberCache.members.findIndex((m) => m.member.id === memberData.member.id);
  memberCache.members.splice(index, 1);

  if (!memberCache.members.length) {
    memberCache.job.cancel();
    GuildCache.delete(guildID);
  }
};
