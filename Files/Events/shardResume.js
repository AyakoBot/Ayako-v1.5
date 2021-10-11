module.exports = {
	async execute(id, replayedEvents) {
		const client = require('../BaseClient/DiscordClient');
		client.ch.logger(`Discord Client Shard with ID ${id} is now Resuming.`, replayedEvents+' replayed Events');
	}
};