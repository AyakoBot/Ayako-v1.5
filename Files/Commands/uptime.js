module.exports = {
  name: 'uptime',
  perm: null,
  dm: true,
  takesFirstArg: false,
  aliases: [],
  type: 'info',
  async execute(msg) {
    const since = +Date.now() - +msg.client.uptime;
    msg.client.ch.reply(msg, {
      content: `${msg.lan.text} <t:${`${since}`.slice(0, -3)}:F> (<t:${`${since}`.slice(
        0,
        -3,
      )}:R>)`,
    });
  },
};
