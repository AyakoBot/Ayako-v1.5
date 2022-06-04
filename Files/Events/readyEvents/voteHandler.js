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

  socket.on('TOP_GG_BOT', async (voteData) => {
    console.log(`User ${voteData.user} has voted for Ayako`);
    client.emit('voteAddBot', voteData);
  });

  socket.on('TOP_GG_SERVER', async (voteData) => {
    console.log(`User ${voteData.user} has voted for Animekos`);
    client.emit('voteAddServer', voteData);
  });
};
