import Eris from 'eris';

export default async (guild: Eris.Guild) => {
  const client = (await import('../ErisClient')).default;
  const me = guild.members.get(client.user.id);
  if (!me?.permissions.has(32n)) return null;

  const invites = await guild.getInvites().catch(() => null);
  if (!invites) return null;

  if (!guild.vanityURL) return invites;

  const vanity = await guild.getVanity();
  if (!vanity || !vanity.code) return invites;

  invites.push({
    code: vanity.code,
    guild,
    inviter: {
      avatar: guild.icon,
      avatarURL: guild.iconURL || '',
      bannerURL: guild.bannerURL,
      bot: false,
      createdAt: guild.createdAt,
      defaultAvatar: '',
      defaultAvatarURL: '',
      discriminator: guild.id,
      id: guild.id,
      mention: '',
      staticAvatarURL: '',
      system: true,
      username: guild.name,
      addRelationship: () => {
        throw new Error('not implemented');
      },
      deleteNote: () => {
        throw new Error('not implemented');
      },
      dynamicAvatarURL: () => {
        throw new Error('not implemented');
      },
      dynamicBannerURL: () => {
        throw new Error('not implemented');
      },
      editNote: () => {
        throw new Error('not implemented');
      },
      getDMChannel: () => {
        throw new Error('not implemented');
      },
      getProfile: () => {
        throw new Error('not implemented');
      },
      removeRelationship: () => {
        throw new Error('not implemented');
      },
      inspect: () => {
        throw new Error('not implemented');
      },
      toJSON: () => {
        throw new Error('not implemented');
      },
    },
    maxAge: Infinity,
    maxUses: Infinity,
    uses: vanity.uses,
    channel: guild.channels.filter((c) => c instanceof Eris.TextChannel)[0],
    createdAt: guild.createdAt,
    memberCount: null,
    presenceCount: null,
    stageInstance: null,
    temporary: false,
    id: guild.id,
    delete: () => {
      throw new Error('not implemented');
    },
    inspect: () => {
      throw new Error('not implemented');
    },
    toJSON: () => {
      throw new Error('not implemented');
    },
  });

  return invites;
};
