const io = require('socket.io-client');
const auth = require('./auth.json');

export default io('https://api.ayakobot.com', {
  transports: ['websocket'],
  auth: {
    reason: 'botClient',
    code: auth.socketToken,
  },
});
