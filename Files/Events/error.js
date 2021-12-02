module.exports = {
  async execute(error) {
    if (`${error}`.includes('Tried to send packet')) return console.log('GOT AN ERROR!', error);
    // eslint-disable-next-line global-require
    const client = require('../BaseClient/DiscordClient');
    return client.ch.logger("Discord Client's WebSocket encountered a connection error", error);
  },
};
