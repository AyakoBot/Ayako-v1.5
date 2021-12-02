module.exports = {
  async execute(id, unavailableGuilds) {
    // eslint-disable-next-line global-require
    const client = require('../BaseClient/DiscordClient');
    if (unavailableGuilds)
      client.ch.logger(
        `Discord Client Shard with ID ${id} is Ready. Unavailable Guilds:`,
        unavailableGuilds,
      );
    else client.ch.logger(`Discord Client Shard with ID ${id} is Ready.`);
  },
};
