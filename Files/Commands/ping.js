module.exports = {
  name: 'ping',
  perm: null,
  dm: true,
  takesFirstArg: false,
  aliases: [],
  type: 'info',
  async execute(msg) {
    const m = await msg.client.ch.reply(msg, '🏓​');
    msg.react('🏓').catch(() => {});
    let ping;
    if (msg.editedTimestamp) ping = m.createdTimestamp - msg.editedTimestamp;
    else ping = m.createdTimestamp - msg.createdTimestamp;
    const { heartbeat } = (await msg.client.ch.query('SELECT heartbeat FROM stats;')).rows[0];
    m?.edit(`🏓 \n**Response Time:** ${ping}ms\n**Last Heartbeat:** ${heartbeat}ms`).catch(
      () => {},
    );
  },
};
