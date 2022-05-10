module.exports = async (rateLimitInfo) => {
  const client = require('../../BaseClient/DiscordClient');
  const res = await client.ch.query('SELECT * FROM stats;');
  if (res?.rows[0]?.verbosity) {
    client.ch.logger(
      `Discord Client was RateLimited\nTimeout: ${rateLimitInfo.timeToReset}\nLimit: ${rateLimitInfo.limit}\nMethod: ${rateLimitInfo.method}\nPath: ${rateLimitInfo.url}\nRoute: ${rateLimitInfo.route}`,
    );
  }
};
