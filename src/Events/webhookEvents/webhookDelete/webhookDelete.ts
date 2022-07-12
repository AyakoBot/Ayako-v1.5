import type * as Eris from 'eris';

export default async (
  channel: Eris.GuildTextableChannel,
  webhook: Eris.Webhook,
  audit: Eris.GuildAuditLogEntry,
) => {
  (await import('./log')).default(channel, webhook, audit);
};
