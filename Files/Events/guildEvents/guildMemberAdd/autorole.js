module.exports = async (member) => {
  const res = await member.client.ch.query('SELECT * FROM autorole WHERE guildid = $1;', [
    member.guild.id,
  ]);
  if (res && res.rowCount > 0) {
    const roleArray = [];
    res.rows.forEach((row) => {
      if (member.guild.roles.cache.get(row.roleid)) roleArray.push(row.roleid);
    });
    if (roleArray.length) member.roles.add(roleArray).catch(() => {});
  }
};
