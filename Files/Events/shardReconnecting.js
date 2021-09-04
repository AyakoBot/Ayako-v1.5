module.exports = {
	async execute(id) {
		const { client } = require('../BaseClient/DiscordClient');
		client.ch.logger(`Discord Client Shard with ID ${id} is Reconnecting.`);
	}
};