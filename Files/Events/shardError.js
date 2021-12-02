module.exports = {
  async execute(error, shardID) {
    // eslint-disable-next-line global-require
    const client = require('../BaseClient/DiscordClient');
    client.ch.logger(`Discord Client Shard with ID ${shardID} has enountered an Error!`, error);
  },
};
