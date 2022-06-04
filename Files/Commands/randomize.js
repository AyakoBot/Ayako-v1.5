module.exports = {
  name: 'randomize',
  dm: false,
  takesFirstArg: false,
  category: null,
  usage: ['amiin'],
  thisGuildOnly: ['108176345204264960'],
  type: 'info',
  async execute(msg) {
    if (msg.author.id !== '108176076261314560') return;
    const res = await msg.client.ch.query('SELECT * FROM stats;');
    const r = res.rows[0].willis;
    const user = r[Math.floor(Math.random() * r.length)];

    msg.channel.send({ content: `<@${user}> has won the Giveaway!` });
  },
};
