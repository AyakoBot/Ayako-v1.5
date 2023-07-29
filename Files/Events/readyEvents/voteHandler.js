const client = require('../../BaseClient/DiscordClient');
const Socket = require('../../BaseClient/SocketClient');

module.exports = async () => {
  client.emit('voteAdd');

  Socket.on('topgg', async (voteData) => {
    const res = await client.ch.query(`SELECT * FROM votetokens WHERE token = $1;`, [
      voteData.authorization,
    ]);
    if (!res || !res.rowCount) return;

    // eslint-disable-next-line no-console
    console.log(`User ${voteData.user} has voted`);

    if (voteData.bot) client.emit('voteAddBot', voteData);
    else client.emit('voteAddServer', voteData);
  });
};
