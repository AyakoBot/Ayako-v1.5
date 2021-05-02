const { client } = require('../../BaseClient/DiscordClient');
const ch = require('../../BaseClient/ClientHelper'); 
const { statcord } = require('../../BaseClient/Statcord');

module.exports = {
	async execute() {
		console.log(`|Logged in as Ayako\n|-> Bot: ${client.user.tag}`);
		console.log(`Login at ${new Date(Date.now()).toLocaleString()}`);
		// statcord.autopost();
		client.guilds.cache.forEach(async guild => client.invites.set(guild.id, await guild.fetchInvites().catch(() => {})));
		setInterval(() => {
			//require('./WebsiteFetcher').execute();
			if (new Date().getHours() == 0) {
				require('./nitro').execute();
				ch.query('DELETE FROM toxicitycheck');
			}
		}, 3600000);
		setInterval(() => {
			require('./TimedManagers/TimedManagerSplitter').execute();
		}, 2000);
		setInterval(() => {
			require('./giveaway.js').execute();
		}, 11000);
		setInterval(() => {
			require('./prunelog.js').execute();
		}, 120000);
		setInterval(() => {
			require('./presence.js').execute();
		}, 60000);
	}
};