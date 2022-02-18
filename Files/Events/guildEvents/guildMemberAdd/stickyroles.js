module.exports = {
  execute: async (member, user) => {
    const memberRes = await member.client.ch.query(
      `SELECT * FROM stickyrolemembers WHERE userid = $1 AND guildid = $2;`,
      [user.id, member.guild.id],
    );

    if (!memberRes || !memberRes.rowCount) return;

    const settingsRes = await member.client.ch.query(
      `SELECT * FROM stickyroles WHERE guildid = $1 AND active = true;`,
      [member.guild.id],
    );

    if (!settingsRes || !settingsRes.rowCount) return;

    const rolesToAdd = getRoles(
      settingsRes.rows[0].stickymode,
      settingsRes.rows[0].roles,
      memberRes.rows[0].roles,
    );

    await member.client.ch.query(
      `DELETE FROM stickyrolemembers WHERE userid = $1 AND guildid = $2;`,
      [user.id, member.guild.id],
    );
    if (rolesToAdd.length) await member.roles.add(rolesToAdd);
  },
};

const getRoles = (mode, roles, memberRoles) => {
  if (mode) {
    return memberRoles.filter((id) => !roles?.includes(id));
  }
  return memberRoles.filter((id) => roles?.includes(id));
};
