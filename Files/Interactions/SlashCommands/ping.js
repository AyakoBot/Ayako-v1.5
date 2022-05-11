module.exports = {
  name: 'ping',
  perm: null,
  dm: true,
  type: 'other',
  execute: async (cmd) => {
    const { heartbeat } = (await cmd.client.ch.query('SELECT heartbeat FROM stats;')).rows[0];

    cmd.reply({
      content: `🏓 \n**Response Time:** ${cmd.client.ws.ping}ms\n**Last Heartbeat:** ${heartbeat}ms`,
      ephemeral: true,
    });
  },
};
