module.exports = {
  execute: async (oldChannel, newChannel) => {
    const permDeleted = checkPermDeleted(oldChannel, newChannel);
    if (!permDeleted || !permDeleted.size) return;

    setTimeout(async () => {
      const memberNotLeft = await checkMemberLeft(oldChannel, permDeleted);
      if (memberNotLeft) return;

      logPerms(permDeleted, newChannel);
    }, 1000);
  },
};

const checkPermDeleted = (oldChannel, newChannel) => {
  const perms = oldChannel.permissionOverwrites.cache.filter(
    (overwrite) => !newChannel.permissionOverwrites.cache.has(overwrite.id),
  );

  if (perms.size) return perms;
  return false;
};

const checkMemberLeft = async (oldChannel, perms) => {
  const member = await oldChannel.guild.members.cache.get(perms.first().id);
  if (!member) return false;
  return member;
};

const logPerms = (perms, channel) => {
  perms.forEach((perm) => {
    channel.client.ch.query(
      `INSERT INTO stickypermmembers (guildid, userid, channelid, allowbits, denybits) VALUES ($1, $2, $3, $4, $5);`,
      [channel.guild.id, perm.id, channel.id, perm.allow.bitfield, perm.deny.bitfield],
    );
  });
};
