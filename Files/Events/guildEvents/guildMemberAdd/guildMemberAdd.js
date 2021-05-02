const { client } = require('../../../BaseClient/DiscordClient');

module.exports = {
	async execute(member) {
		const user = await client.users.fetch(member.id);
		require('./giveaway.js').execute(member, user);
		require('./log.js').execute(member, user);
		require('./mute.js').execute(member, user);
		require('./verification.js').execute(member, user);
		require('./welcome.js').execute(member, user);
	}
};