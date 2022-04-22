module.exports = {
  name: 'strike',
  perm: 4n,
  dm: false,
  takesFirstArg: true,
  aliases: null,
  type: 'mod',
  async execute(msg) {
    const proceed = async (doProceed) => {
      if (doProceed === false) {
        const modRoleRes = await msg.client.ch.modRoleWaiter(msg);
        if (modRoleRes) {
          return msg.client.emit(`modStrikeHandler`, msg.author, user, reason, msg, rows);
        }
        msg.delete().catch(() => {});
      } else {
        return msg.client.emit(`modStrikeHandler`, msg.author, user, reason, msg, rows);
      }
      return null;
    };

    let rows;
    const res = await msg.client.ch.query(
      'SELECT * FROM autopunish WHERE guildid = $1 AND active = true;',
      [msg.guild.id],
    );
    if (res && res.rowCount > 0) rows = res.rows;

    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    const { lan } = msg;
    if (!user) return msg.client.ch.error(msg, msg.language.errors.userNotFound);
    const reason = msg.args.slice(1).join(' ') ? msg.args.slice(1).join(' ') : lan.reason;
    const guildmember = await msg.guild.members.fetch(user.id).catch(() => {});
    if (guildmember) {
      const res2 = await msg.client.ch.query('SELECT * FROM modroles WHERE guildid = $1;', [
        msg.guild.id,
      ]);
      if (res2 && res2.rowCount > 0) {
        const roles = [];
        res2.rows.forEach((r) => roles.push(r.roleid));
        if (guildmember.roles.cache.some((r) => roles.includes(r.id))) return proceed(false);
        return proceed(null);
      }
      return proceed(null);
    }
    return proceed(null);
  },
};
