import type Eris from 'eris';

const roleManager = {
  add: async (member: Eris.Member, roles: string[], reason: string, prio = 2) => {
    const newRoles = [...new Set([...member.roles, ...roles])];
    return member.edit({ roles: newRoles }, reason).catch((e) => e);
  },
  remove: async (member: Eris.Member, roles: string[], reason: string, prio = 2) => {
    const newRoles = member.roles.filter((role) => !roles.includes(role));
    return member.edit({ roles: newRoles }, reason).catch((e) => e);
  },
};

export default roleManager;
