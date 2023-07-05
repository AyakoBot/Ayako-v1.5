/* eslint-disable no-await-in-loop */

module.exports = {
  name: 'randomize',
  dm: false,
  takesFirstArg: false,
  category: null,
  usage: ['amiin'],
  thisGuildOnly: ['108176345204264960'],
  type: 'info',
  async execute(msg) {
    if (msg.author.id !== '108176076261314560' && msg.author.id !== '318453143476371456') return;
    // const res = await msg.client.ch.query('SELECT * FROM stats;');
    // const r = res.rows[0].willis;
    // const user = r[Math.floor(Math.random() * r.length)];

    // msg.channel.send({ content: `<@${user}> has won the Giveaway!` });
    const m = await msg.guild.channels.cache
      .get('1085554467883188224')
      .messages.fetch('1107047864217116724');
    const reaction = await m.reactions.cache.map((o) => o)[0].fetch();

    const r = await msg.react('780543908861182013');

    const users = [];
    while (users.length < reaction.count) {
      users.push(
        ...(
          await reaction.users.fetch({
            limit: 100,
            after: users.length ? users[users.length - 1].id : undefined,
          })
        ).map((o) => o),
      );
    }

    r.remove();

    const validUsers = users.filter((u) =>
      msg.guild.members.cache.get(u.id)?.roles.cache.has('1068238827644276847'),
    );
    const user = validUsers[Math.floor(Math.random() * validUsers.length)];

    msg.channel.send({
      content: `${user} was randomly picked from ${validUsers.length} valid and ${users.length} total participants!`,
    });
  },
};
