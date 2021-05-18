module.exports = {
	async execute(rateLimitInfo) {
		const { client } = require('../BaseClient/DiscordClient');
		client.ch.logger('Discord Client was RateLimited', `Timeout: ${rateLimitInfo.timeout}\nLimit: ${rateLimitInfo.limit}\nMethod: ${rateLimitInfo.method}\nPath: ${rateLimitInfo.path}\nRoute: ${rateLimitInfo.route}`);
	}
};