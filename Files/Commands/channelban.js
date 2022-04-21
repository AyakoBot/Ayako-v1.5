const ms = require('ms');

module.exports = {
  name: 'channelban',
  perm: 16n,
  dm: false,
  takesFirstArg: true,
  aliases: ['channeltempban'],
  type: 'mod',
  async execute(msg) {
    const proceed = async (doProceed) => {
      if (doProceed === false) {
        const modRoleRes = await msg.client.ch.modRoleWaiter(msg);
        if (modRoleRes) {
          if (!duration) {
            return msg.client.emit(
              'modBaseEvent',
              {
                target: user,
                executor: msg.author,
                reason,
                msg,
                guild: msg.guild,
                channel,
              },
              'channelbanAdd',
            );
          }
          return msg.client.emit(
            'modBaseEvent',
            {
              target: user,
              executor: msg.author,
              reason,
              msg,
              guild: msg.guild,
              channel,
              duration,
            },
            'channeltempbanAdd',
          );
        }
        msg.delete().catch(() => {});
      }
      if (!duration) {
        return msg.client.emit(
          'modBaseEvent',
          {
            target: user,
            executor: msg.author,
            reason,
            msg,
            guild: msg.guild,
            channel,
          },
          'channelbanAdd',
        );
      }
      return msg.client.emit(
        'modBaseEvent',
        {
          target: user,
          executor: msg.author,
          reason,
          msg,
          guild: msg.guild,
          channel,
          duration,
        },
        'channeltempbanAdd',
      );
    };

    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    if (!user) return msg.client.ch.error(msg, msg.language.errors.userNotFound);

    let channel = msg.args[1]
      ? msg.client.channels.cache.get(msg.args[1].replace(/\D+/g, ''))
      : null;

    let durationArg = 2;

    if (!channel) {
      channel = msg.channel;
      durationArg = 1;
    }

    const duration = getDuration(msg, channel, durationArg);
    const reason = getReason(msg, channel, durationArg);
    const guildmember = await msg.guild.members.fetch(user.id).catch(() => {});

    console.log(reason, duration, channel.name);

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

const getDuration = (msg, channel, durationArg) => {
  let args = [];

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
