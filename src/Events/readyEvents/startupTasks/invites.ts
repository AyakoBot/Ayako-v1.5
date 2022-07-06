import client from '../../../BaseClient/ErisClient';

export default async () => {
  client.guilds.forEach(async (guild) => {
    const invites = await client.ch.getAllInvites(guild);
    if (!invites) return;

    client.invites.set(guild.id, invites);
  });
};
