module.exports = {
  name: 'unban',
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
          return msg.client.emit(
            'modBaseEvent',
            {
              target: user,
              executor: msg.author,
              reason,
              msg,
              guild: msg.guild,
            },
            'banRemove',
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
          'banRemove',
        );
      }
      return null;
    };

    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
    const { lan } = msg;
    if (!user) return msg.client.ch.error(msg, msg.language.errors.userNotFound);
    const reason = `${msg.args.slice(1).join(' ') ? msg.args.slice(1).join(' ') : lan.reason}`;
    return proceed(null, this);
  },
};
