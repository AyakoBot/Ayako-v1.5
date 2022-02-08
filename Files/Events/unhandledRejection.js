const auth = require('../BaseClient/auth.json');

module.exports = {
  execute(error) {
    const client = require('../BaseClient/DiscordClient');

    console.log(`Unhandled Rejection`, error);

    if (`${error}`.includes('GUILD_MEMBERS_TIMEOUT')) {
      client.destroy().catch(() => {});
      client.login(auth.token);
    }
  },
};
