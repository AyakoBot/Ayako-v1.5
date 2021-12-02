/* eslint-disable import/extensions */
const auth = require('../BaseClient/auth.json');

module.exports = {
  async execute(event, id) {
    // eslint-disable-next-line global-require
    const client = require('../BaseClient/DiscordClient.js');
    client.ch.logger(`Discord Client Shard with ID ${id} was Disconnected!`);
    client.destroy();
    client.login(auth.token);
  },
};
