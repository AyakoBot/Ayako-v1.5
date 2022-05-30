const io = require('socket.io-client');
const client = require('../../BaseClient/DiscordClient');

module.exports = async () => {
  client.emit('voteAdd');

  const socket = io('https://ayakobot.com', {
    transports: ['websocket'],
    auth: {
      reason: 'top_gg_votes',
    },
  });

  socket.on('TOP_GG_VOTE', async (voteData) => {
    console.log(`User ${voteData.user} has voted`);
    client.emit('voteAdd', voteData);
  });
};
