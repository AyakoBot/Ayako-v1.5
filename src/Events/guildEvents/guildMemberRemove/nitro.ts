import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default (guild: Eris.Guild, member: Eris.Member | { id: string; user: Eris.User }) => {
  const oldMember: {
    avatar?: string | null;
    communicationDisabledUntil?: number | null;
    roles?: string[] | null;
    nick?: string | null;
    pending?: boolean | null;
    premiumSince: null;
  } = {
    premiumSince: null,
  };

  oldMember.avatar = 'avatar' in member ? member.avatar : null;
  oldMember.communicationDisabledUntil =
    'communicationDisabledUntil' in member ? member.communicationDisabledUntil : null;
  oldMember.roles = 'roles' in member ? member.roles : null;
  oldMember.nick = 'nick' in member ? member.nick : null;
  oldMember.pending = 'pending' in member ? member.pending : null;

  client.emit('guildMemberUpdate', guild, member, oldMember);
};
