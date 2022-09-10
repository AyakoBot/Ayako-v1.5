import jobs from 'node-schedule';
import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

type OldChannel =
  | Eris.OldGuildChannel
  | Eris.OldGuildTextChannel
  | Eris.OldTextVoiceChannel
  | Eris.OldThread;
type Channel =
  | Eris.TextChannel
  | Eris.TextVoiceChannel
  | Eris.CategoryChannel
  | Eris.StoreChannel
  | Eris.NewsChannel
  | Eris.GuildChannel;

export default async (channel: Channel, oldChannel: OldChannel) => {
  if (!('permissionOverwrites' in oldChannel)) return;

  const permDeleted = oldChannel.permissionOverwrites.filter(
    (overwrite) => !channel.permissionOverwrites.has(overwrite.id),
  );
  if (!permDeleted.length) return;

  jobs.scheduleJob(new Date(Date.now() + 1000), async () => {
    const member = await client.ch.getMember(permDeleted[0].id, channel.guild.id);
    if (!member) return;

    logPerms(permDeleted, channel);
  });
};

const logPerms = (perms: Eris.PermissionOverwrite[], channel: Channel) => {
  perms.forEach((perm) => {
    client.ch.query(
      `INSERT INTO stickypermmembers (guildid, userid, channelid, allowbits, denybits) VALUES ($1, $2, $3, $4, $5);`,
      [channel.guild.id, perm.id, channel.id, perm.allow as never, perm.deny as never],
    );
  });
};
