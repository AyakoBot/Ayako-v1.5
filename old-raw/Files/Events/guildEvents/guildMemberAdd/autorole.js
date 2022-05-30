module.exports = async (member) => {
  const res = await member.client.ch.query(
    'SELECT * FROM autorole WHERE guildid = $1 AND active = true;',
    [member.guild.id],
  );
  if (!res || !res.rowCount) return;

  let roles = [];
  const r = res.rows[0];

  if (member.user.bot && r.botroleid?.length) {
    roles.push(...r.botroleid);
  } else if (!member.user.bot && r.userroleid?.length) {
    roles.push(...r.userroleid);
  }

  if (r.allroleid?.length) {
    roles.push(...r.allroleid);
  }

  roles = roles.filter(
    (role) => !member.roles.cache.has(role) && member.guild.roles.cache.get(role),
  );
  if (!roles.length) return;

  member.roles.add(roles).catch(() => {});
};
