module.exports = {
  name: 'channelunban',
  perm: 16n,
  dm: false,
  takesFirstArg: true,
  aliases: [],
  type: 'mod',
  async execute(msg) {
    const proceed = async (doProceed) => {
      if (doProceed === false) {
        const modRoleRes = await msg.client.ch.modRoleWaiter(msg);
        if (modRoleRes) {
          return msg.client.emit(
            `modBaseEvent`,
            {
              reason,
              channel,
              executor: msg.author,
              target: user,
              msg,
              guild: msg.guild,
            },
            'channelbanRemove',
          );
        }
        msg.delete().catch(() => {});
      } else {
        return msg.client.emit(
          `modBaseEvent`,
          {
            reason,
            channel,
            executor: msg.author,
            target: user,
            msg,
            guild: msg.guild,
          },
          'channelbanRemove',
        );
      }
      return null;
    };

    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    if (!user) return msg.client.ch.error(msg, msg.language.errors.userNotFound);

    let channel = msg.args[1]
      ? msg.client.channels.cache.get(msg.args[1].replace(/\D+/g, ''))
      : null;

    if (!channel) {
      channel = msg.channel;
    }

    const reason = getReason(msg, channel);
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

const getReason = (msg, channel) => {
  let reasonArg = 3;
  if (!channel) reasonArg = 2;

  return msg.args.slice(reasonArg).join(' ') ? msg.args.slice(reasonArg).join(' ') : msg.lan.reason;
};
