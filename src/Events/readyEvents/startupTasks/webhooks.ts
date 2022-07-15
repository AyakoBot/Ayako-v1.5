import client from '../../../BaseClient/ErisClient';

export default async () => {
  client.guilds.forEach((guild) => {
    guild.channels.forEach(async (channel) => {
      if (!('getWebhooks' in channel)) return;

      const me = await client.ch.getMember(client.user.id, guild.id);
      if (!me) return;

      if (!channel.permissionsOf(me).has(536870912n)) return;

      const webhooks = await channel.getWebhooks().catch(() => null);
      if (!webhooks) return;

      client.webhooks.set(channel.id, webhooks);
    });
  });
};
