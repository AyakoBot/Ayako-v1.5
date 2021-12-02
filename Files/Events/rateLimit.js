/* eslint-disable global-require */
module.exports = {
  async execute(rateLimitInfo) {
    const client = require('../BaseClient/DiscordClient');
    const res = await client.ch.query('SELECT * FROM stats;');
    if (res?.rows[0]?.verbosity)
      client.ch.logger(
        'Discord Client was RateLimited',
        `Timeout: ${rateLimitInfo.timeout}\nLimit: ${rateLimitInfo.limit}\nMethod: ${rateLimitInfo.method}\nPath: ${rateLimitInfo.path}\nRoute: ${rateLimitInfo.route}`,
      );
  },
};
