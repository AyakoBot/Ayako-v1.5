const io = require('socket.io-client');


module.exports = {
  execute: () => {
    const socket = io('https://ayakobot.com', {
      transports: ['websocket'],
      auth: {
        reason: 'top_gg_votes',
      },
    });

    socket.on('TOP_GG_VOTE', (voteData) => {
      console.log(voteData);
    });
  },
};
