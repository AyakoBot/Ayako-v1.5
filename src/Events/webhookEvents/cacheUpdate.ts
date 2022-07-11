import type * as Eris from 'eris';
import client from '../../BaseClient/ErisClient';

export default async (channel: Eris.GuildTextableChannel) => {
  const webhooks = await channel.getWebhooks().catch(() => null);
  if (!webhooks) return;

  client.webhooks.set(channel.id, webhooks);
};
