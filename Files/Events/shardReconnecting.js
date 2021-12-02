module.exports = {
  async execute(id) {
    // eslint-disable-next-line global-require
    const client = require('../BaseClient/DiscordClient');
    client.ch.logger(`Discord Client Shard with ID ${id} is Reconnecting.`);
  },
};
