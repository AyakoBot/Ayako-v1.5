import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default async (guild: Eris.Guild) => {
  client.invites.delete(guild.id);

  Array.from(client.verificationCodes.keys())
    .filter((k) => k.endsWith(guild.id))
    .forEach((key) => client.verificationCodes.delete(key));

  Array.from(client.giveaways.keys())
    .filter((k) => k.endsWith(guild.id))
    .forEach((key) => {
      client.giveaways.get(key)?.cancel();
      client.giveaways.delete(key);
    });

  client.disboardBumpReminders.get(guild.id)?.cancel();
  client.disboardBumpReminders.delete(guild.id);

  Array.from(client.channelBans.keys())
    .filter((k) => guild.channels.has(k.split('-')[0]))
    .forEach((key) => {
      client.channelBans.get(key)?.cancel();
      client.channelBans.delete(key);
    });

  Array.from(client.bans.keys())
    .filter((k) => k.startsWith(guild.id))
    .forEach((key) => {
      client.bans.get(key)?.cancel();
      client.bans.delete(key);
    });

  Array.from(client.mutes.keys())
    .filter((k) => k.startsWith(guild.id))
    .forEach((key) => {
      client.mutes.get(key)?.cancel();
      client.mutes.delete(key);
    });
};
