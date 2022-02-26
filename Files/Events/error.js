module.exports = {
  async execute(error) {
    if (`${error}`.includes('Tried to send packet')) return console.log('GOT AN ERROR!', error);
    const client = require('../BaseClient/DiscordClient');
    return client.ch.logger("Discord Client's WebSocket encountered a connection error", error);
  },
};
