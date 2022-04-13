const ms = require('ms');

module.exports = {
  name: 'tempmute',
  perm: 268435456n,
  dm: false,
  takesFirstArg: true,
  aliases: ['mute'],
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
            duration,
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
          duration,
        );
      }
      return null;
    };

    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    if (!user) return msg.client.ch.error(msg, msg.language.error.userNotFound);

    const { lan } = msg;
    let reason = msg.args.slice(2).join(' ') ? msg.args.slice(2).join(' ') : lan.reason;
    const guildmember = await msg.guild.members.fetch(user.id).catch(() => {});
    let duration = msg.args[1] ? ms(msg.args[1]) : null;

    if (msg.args[1]) msg.args[1] = msg.args[1].replace(/,/g, '.');
    if (duration === msg.args[1]) {
      duration = ms(`${msg.args[1]} ${msg.args[2]}`);
      reason = msg.args.slice(3).join(' ') ? msg.args.slice(3).join(' ') : lan.reason;
    }

    if (Number.isNaN(+duration)) {
      reason = msg.args.slice(1).join(' ') ? msg.args.slice(1).join(' ') : lan.reason;
      duration = Number(msg.member.modrole.mutedurationdefault) * 60 * 1000;
    }

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
