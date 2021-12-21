const auth = require('../BaseClient/auth.json');

module.exports = {
  execute(error) {
    const client = require('../BaseClient/DiscordClient');

    client.ch.logger(`Unhandled Rejection`, error);

    if (error.includes('GUILD_MEMBERS_TIMEOUT')) {
      client.destroy();

      setTimeout(() => {
        client.login(auth.token);
      }, 1000);
    }
  },
};
