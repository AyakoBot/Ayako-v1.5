module.exports = {
	async execute(err, id) {
		const client = require('../BaseClient/DiscordClient');
		client.ch.logger(`Discord Client Shard with ID ${id} recieved a warning`, err);
	}
};