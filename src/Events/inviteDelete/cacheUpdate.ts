import type * as Eris from 'eris';
import client from '../../BaseClient/ErisClient';

export default async (guild: Eris.Guild, invite: Eris.Invite) => {
  const existing = client.invites.get(guild.id);
  if (existing) {
    existing.splice(
      existing.findIndex((i) => i.code === invite.code),
      1,
    );
    return;
  }

  const allInvites = await client.ch.getAllInvites(guild);
  if (!allInvites) return;
  client.invites.set(guild.id, allInvites);
};
