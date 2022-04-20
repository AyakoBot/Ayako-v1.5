module.exports = {
  name: 'warn',
  perm: 8192n,
  dm: false,
  takesFirstArg: true,
  aliases: null,
  type: 'mod',
  async execute(msg) {
    const proceed = async (doProceed) => {
      if (doProceed === false) {
        const modRoleRes = await msg.client.ch.modRoleWaiter(msg);
        if (modRoleRes) {
          return msg.client.emit(
            `modBaseEvent`,
            {
              target: user,
              executor: msg.author,
              reason,
              msg,
              guild: msg.guild,
            },
            'warnAdd',
          );
        }
        msg.delete().catch(() => {});
      } else {
        return msg.client.emit(
          `modBaseEvent`,
          {
            target: user,
            executor: msg.author,
            reason,
            msg,
            guild: msg.guild,
          },
          'warnAdd',
        );
      }
      return null;
    };

    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    const { lan } = msg;
    if (!user) return msg.client.ch.error(msg, msg.language.errors.userNotFound);
    const reason = msg.args.slice(1).join(' ') ? msg.args.slice(1).join(' ') : lan.reason;
    const guildmember = await msg.guild.members.fetch(user.id).catch(() => {});
    if (guildmember) {
      const res = await msg.client.ch.query('SELECT * FROM modroles WHERE guildid = $1;', [
        msg.guild.id,
      ]);
      if (res && res.rowCount > 0) {
        const roles = [];
        res.rows.forEach((r) => roles.push(r.roleid));
        if (guildmember.roles.cache.some((r) => roles.includes(r.id))) return proceed(false);
        return proceed(null);
      }
      return proceed(null);
    }
    return proceed(null);
  },
};
