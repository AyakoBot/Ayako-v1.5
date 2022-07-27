import type * as Eris from 'eris';

export default async (
  guild: Eris.Guild,
  actionType: number,
  target?: { id: string },
  otherFilterArguments?: (entry: Eris.GuildAuditLogEntry) => boolean,
) => {
  const { default: client } = await import('../ErisClient');

  if (!guild?.members.get(client.user.id)?.permissions.has(128n)) return null;

  const audits = await guild.getAuditLog({ limit: 10, actionType });
  if (!audits || !audits.entries) return null;

  return audits.entries
    .filter((entry) => (target ? entry.targetID === target.id : true))
    .filter(otherFilterArguments || (() => true))
    .sort((a, b) => client.ch.getUnix(b.id) - client.ch.getUnix(a.id))[0];
};
