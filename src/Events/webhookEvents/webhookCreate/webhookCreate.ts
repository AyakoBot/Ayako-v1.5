import type * as Eris from 'eris';

export default async (
  channel: Eris.GuildTextableChannel,
  newWebhook: Eris.Webhook,
  audit: Eris.GuildAuditLogEntry,
) => {
  (await import('./log')).default(channel, newWebhook, audit);
};
