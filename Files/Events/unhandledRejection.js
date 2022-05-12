const auth = require('../BaseClient/auth.json');

module.exports = {
  execute(error) {
    const client = require('../BaseClient/DiscordClient');

    console.log(`Unhandled Rejection`, error);

    if (
      String(error).includes('GUILD_MEMBERS_TIMEOUT') ||
      String(error).includes('Expected token to be set for this request, but none was present')
    ) {
      client.destroy();
      client.login(auth.token);
    }
  },
};
