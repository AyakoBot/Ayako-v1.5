module.exports = {
	async execute(error) {
		const { client } = require('../BaseClient/DiscordClient');
		client.ch.logger('Discord Client\'s WebSocket encountered a connection error', error);
	}
};