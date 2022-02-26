const auth = require('../BaseClient/auth.json');

module.exports = {
  async execute(event, id) {
    const client = require('../BaseClient/DiscordClient.js');
    client.ch.logger(`Discord Client Shard with ID ${id} was Disconnected!`);
    client.destroy();
    client.login(auth.token);
  },
};
