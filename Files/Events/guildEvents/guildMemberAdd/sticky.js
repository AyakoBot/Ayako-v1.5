module.exports = {
  execute: async (member, user) => {
    stickyroles(member, user);
    stickyperms(member, user);
  },
};

const stickyroles = async (member, user) => {
  const memberRes = await member.client.ch.query(
    `SELECT * FROM stickyrolemembers WHERE userid = $1 AND guildid = $2;`,
    [user.id, member.guild.id],
  );

  if (!memberRes || !memberRes.rowCount) return;

  const settingsRes = await member.client.ch.query(
    `SELECT * FROM sticky WHERE guildid = $1 AND stickyrolesactive = true;`,
    [member.guild.id],
  );

  if (!settingsRes || !settingsRes.rowCount) return;

  const rolesToAdd = getRoles(
    settingsRes.rows[0].stickyrolesmode,
    settingsRes.rows[0].roles,
    memberRes.rows[0].roles,
    member.guild,
  );

  await member.client.ch.query(
    `DELETE FROM stickyrolemembers WHERE userid = $1 AND guildid = $2;`,
    [user.id, member.guild.id],
  );

  const language = await member.guild.client.ch.languageSelector(member.guild);
  if (rolesToAdd.length) {
    await member.roles.add(rolesToAdd, language.commands.settings.sticky.roleReason);
  }
};

const getRoles = (mode, roles, memberRoles, guild) => {
  if (mode) {
    return memberRoles
      .filter((id) => !roles?.includes(id))
      .filter((id) => !!guild.roles.cache.get(id));
  }
  return memberRoles
    .filter((id) => roles?.includes(id))
    .filter((id) => !!guild.roles.cache.get(id));
};

const stickyperms = async (member, user) => {
  const memberRes = await member.client.ch.query(
    `SELECT * FROM stickypermmembers WHERE userid = $1 AND guildid = $2;`,
    [user.id, member.guild.id],
  );

  if (!memberRes || !memberRes.rowCount) return;

  const settingsRes = await member.client.ch.query(
    `SELECT * FROM sticky WHERE guildid = $1 AND stickypermsactive = true;`,
    [member.guild.id],
  );

  if (!settingsRes || !settingsRes.rowCount) return;

  await addPerms(memberRes.rows, member.guild);
};

const addPerms = async (rows, guild) => {
  const language = await guild.client.ch.languageSelector(guild);
  rows.forEach((row) => {
    const channel = guild.channels.cache.get(row.channelid);
    if (!channel) return;

    channel.permissionOverwrites.set(
      [
        { id: row.userid, allow: row.allowbits, deny: row.denybits, type: 1 },
        ...channel.permissionOverwrites.cache.map((o) => o),
      ],
      language.commands.settings.sticky.permReason,
    );
  });
};
