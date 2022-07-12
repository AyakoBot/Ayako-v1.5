import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default async (data: { channelID: string; guildID: string }) => {
  const guild = client.guilds.get(data.guildID);
  if (!guild) return;
  const channel = guild.channels.get(data.channelID) as Eris.GuildTextableChannel;
  if (!channel) return;

  await logs(guild, channel);
  (await import('./cacheUpdate')).default(channel);
};

const logs = async (guild: Eris.Guild, channel: Eris.GuildTextableChannel) => {
  const audit = (
    await Promise.all([
      getAuditLogEntry(guild, 50),
      getAuditLogEntry(guild, 51),
      getAuditLogEntry(guild, 52),
    ])
  ).sort(
    (a, b) =>
      (b ? client.ch.getUnix(b.id) : Date.now() + 10000) -
      (a ? client.ch.getUnix(a.id) : Date.now() + 10000),
  )[0];

  if (!audit) return;

  switch (audit.actionType) {
    case 50: {
      const newWebhooks = await channel.getWebhooks().catch(() => null);
      if (!newWebhooks) return;
      const newWebhook = newWebhooks.find((w) => w.id === audit.targetID);
      if (!newWebhook) return;

      client.emit('webhookCreate', channel, newWebhook, audit);
      break;
    }
    case 51: {
      const newWebhooks = await channel.getWebhooks().catch(() => null);
      if (!newWebhooks) return;
      const newWebhook = newWebhooks.find((w) => w.id === audit.targetID);
      if (!newWebhook) return;

      const oldWebhook = client.webhooks.get(channel.id)?.find((w) => w.id === audit.targetID);
      if (!oldWebhook) return;

      (await import('./log')).default(channel, newWebhook, oldWebhook, audit);
      break;
    }
    case 52: {
      const newWebhooks = await channel.getWebhooks().catch(() => null);
      if (!newWebhooks) return;
      const oldWebhook = client.webhooks.get(channel.id)?.find((w) => w.id === audit.targetID);
      if (!oldWebhook) return;

      client.emit('webhookDelete', channel, oldWebhook, audit);
      break;
    }
    default: {
      break;
    }
  }
};

const getAuditLogEntry = async (guild: Eris.Guild, actionType: number) => {
  if (!guild.members.get(client.user.id)?.permissions.has(128n)) return null;

  const audits = await guild.getAuditLog({ limit: 5, actionType });
  if (!audits || !audits.entries) return null;

  return audits.entries.sort((a, b) => client.ch.getUnix(b.id) - client.ch.getUnix(a.id))[0];
};
