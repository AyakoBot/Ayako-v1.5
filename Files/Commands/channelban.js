const ms = require('ms');

module.exports = {
  name: 'channelban',
  perm: 268435456n,
  dm: false,
  takesFirstArg: true,
  aliases: ['channeltempban'],
  type: 'mod',
  async execute(msg) {
    const proceed = async (doProceed) => {
      if (doProceed === false) {
        const modRoleRes = await msg.client.ch.modRoleWaiter(msg);
        if (modRoleRes) {
          return msg.client.emit(
            'modBaseEvent',
            {
              target: user,
              executor: msg.author,
              reason,
              msg,
              guild: msg.guild,
            },
            'channelbanAdd',
          );
        }
        msg.delete().catch(() => {});
      } else {
        return msg.client.emit(
          'modBaseEvent',
          {
            target: user,
            executor: msg.author,
            reason,
            msg,
            guild: msg.guild,
          },
          'channelbanAdd',
        );
      }
      return null;
    };

    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    if (!user) return msg.client.ch.error(msg, msg.language.errors.userNotFound);

    let channel = msg.client.channels.cache.get(msg.args[1].replace(/\D+/g, ''));

    const duration = getDuration(msg, channel);
    const reason = getReason(msg, channel, duration);
    if (!channel) channel = msg.channel;

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

const getDuration = (msg, channel) => {
  let durationArg = 2;
  let args = [];

  if (!channel) durationArg = 1;
  if (msg.args[durationArg]) args = [msg.args[durationArg].replace(/,/g, '.')];

  let duration = args[0] ? ms(args[0]) : null;

  if (duration === args[0] && msg.args[durationArg + 1]) {
    args[1] = msg.args[durationArg + 1].replace(/,/g, '.');

    duration = ms(`${args[0]} ${args[1]}`);
    durationArg = 3;
  } else {
    duration = null;
  }

  return duration;
};

const getReason = (msg, channel, duration) => {
  let reasonArg = 3;
  if (!channel || !duration) reasonArg = 2;
  if (!channel && !duration) reasonArg = 1;

  return msg.args.slice(reasonArg).join(' ') ? msg.args.slice(reasonArg).join(' ') : msg.lan.reason;
};
