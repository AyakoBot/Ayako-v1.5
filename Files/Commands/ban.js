module.exports = {
  name: 'ban',
  perm: 4n,
  dm: false,
  takesFirstArg: true,
  aliases: null,
  type: 'mod',
  async execute(msg) {
    const proceed = async (doProceed, module) => {
      if (doProceed === false) {
        const modRoleRes = await msg.client.ch.modRoleWaiter(msg);
        if (modRoleRes) {
          return msg.client.emit(
            `mod${msg.client.ch.CFL(module.name)}Add`,
            msg.author,
            user,
            reason,
            msg,
          );
        }
        msg.delete().catch(() => {});
      } else {
        return msg.client.emit(
          `mod${msg.client.ch.CFL(module.name)}Add`,
          msg.author,
          user,
          reason,
          msg,
        );
      }
      return null;
    };

    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    const { lan } = msg;
    if (!user) return msg.client.ch.error(msg, msg.language.errors.userNotFound);
    const reason = `${msg.author.tag} | ${
      msg.args.slice(1).join(' ') ? msg.args.slice(1).join(' ') : lan.reason
    }`;
    const guildmember = await msg.guild.members.fetch(user.id).catch(() => {});
    if (guildmember) {
      const res = await msg.client.ch.query('SELECT * FROM modroles WHERE guildid = $1;', [
        msg.guild.id,
      ]);
      if (res && res.rowCount > 0) {
        const roles = [];
        res.rows.forEach((r) => roles.push(r.roleid));
        if (guildmember.roles.cache.some((r) => roles.includes(r.id))) return proceed(false, this);
        return proceed(null, this);
      }
      return proceed(null, this);
    }
    return proceed(null, this);
  },
};
