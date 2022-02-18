module.exports = {
  execute: async (member) => {
    if (!member._roles.length) return;

    const res = await member.client.ch.query(
      `SELECT * FROM stickyroles WHERE active = true AND guildid = $1;`,
      [member.guild.id],
    );

    if (!res || !res.rowCount) return;

    member.client.ch.query(
      `INSERT INTO stickyrolemembers (guildid, userid, roles) VALUES ($1, $2, $3) ON CONFLICT (guildid, userid) DO UPDATE SET roles = $3;`,
      // eslint-disable-next-line no-underscore-dangle
      [member.guild.id, member.user.id, member._roles],
    );
  },
};
