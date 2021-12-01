module.exports = {
  name: 'tta',
  perm: null,
  dm: true,
  takesFirstArg: true,
  aliases: [],
  type: 'info',
  async execute(msg) {
    // eslint-disable-next-line global-require
    if (msg.author.id !== require('../BaseClient/auth.json').ownerID) return;
    msg.client.ch.send(
      msg.client.channels.cache.get('706691541833351171'),
      msg.args.slice(0).join(' '),
    );
    msg.delete().catch(() => {});
    const m = await msg.client.ch.reply(
      msg,
      `Added \`${msg.args.slice(0).join(' ')}\` to your to-do list`,
    );
    m.delete().catch(() => {});
  },
};
