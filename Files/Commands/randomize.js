module.exports = {
  name: 'randomize',
  perm: 8n,
  dm: false,
  takesFirstArg: false,
  category: null,
  usage: ['amiin'],
  thisGuildOnly: ['108176345204264960'],
  type: 'info',
  async execute(msg) {
    if (msg.channel.id === '805839305377447936') return;
    const res = await msg.client.ch.query('SELECT * FROM stats;');
    const r = res.rows[0].willis;
    const user = r[Math.floor(Math.random() * r.length)];

    msg.channel.send({ content: `<@${user}> has won the Giveaway!` });
  },
};
