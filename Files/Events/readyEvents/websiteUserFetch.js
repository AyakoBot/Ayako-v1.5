const io = require('socket.io-client');
const client = require('../../BaseClient/DiscordClient');
const { socketToken } = require('../../BaseClient/auth.json');

module.exports = async () => {
  client.emit('voteAdd');

  const socket = io('https://ayakobot.com', {
    transports: ['websocket'],
    auth: {
      reason: 'userfetching',
      code: socketToken,
    },
  });

  socket.on('USER_FETCH', async (users) => require('./userFetching')(users, socket));
};
