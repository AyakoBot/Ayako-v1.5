import client from '../../../BaseClient/ErisClient';

export default async () => {
  client.guilds.forEach((guild) => {
    guild.channels.forEach(async (channel) => {
      if (!('getWebhooks' in channel)) return;
      const webhooks = await channel.getWebhooks().catch(() => null);

      if (!webhooks) return;
      client.webhooks.set(channel.id, webhooks);
    });
  });
};
