const io = require('socket.io-client');
const client = require('../../BaseClient/DiscordClient');
const { socketToken } = require('../../BaseClient/auth.json');

module.exports = async () => {
  client.emit('voteAdd');

  const socket = io('https://api.ayakobot.com', {
    transports: ['websocket'],
    auth: {
      reason: 'topgg',
      code: socketToken,
    },
  });

  socket.on('topgg', async (voteData) => {
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
