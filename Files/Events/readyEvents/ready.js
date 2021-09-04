//const { statcord } = require('../../BaseClient/Statcord');

module.exports = {
	once: true,
	async execute() {
		const { client } = require('../../BaseClient/DiscordClient');
		console.log(`|Logged in as Ayako\n|-> Bot: ${client.user.tag}`);
		console.log(`Login at ${new Date(Date.now()).toLocaleString()}`);
		const ch = client.ch;
		// statcord.autopost();
		require('./slashcommands.js').execute();
		client.guilds.cache.forEach(async guild => client.invites.set(guild.id, await guild.invites.fetch().catch(() => {})));
		require('./webhooks.js').execute();
		setInterval(() => {
			require('./colorReminder').execute();
			//require('./websiteFetcher').execute();
			if (new Date().getHours() == 0) {
				client.guilds.cache.forEach(g => {require('../guildEvents/guildCreate/nitro').execute(g);});
				require('./nitro').execute();
				ch.query('DELETE FROM toxicitycheck;');
				require('../messageEvents/messageCreate/antispam').resetData();
				require('../guildEvents/guildMemberAdd/antiraid').resetData();
			}
		}, 3600000);
		setInterval(() => {require('./TimedManagers/timedManagerSplitter').execute();}, 2000);
		setInterval(() => {require('./giveaway.js').execute();}, 11000);
		setInterval(() => {require('./antiraidBanAdd.js').execute();}, 10000);
		setInterval(() => {require('./prunelog.js').execute();}, 120000);
		setInterval(() => {require('./presence.js').execute();}, 60000);
		require('./separators.js').execute();
		setInterval(() => {console.log(new Date().toUTCString());}, 600000);
	}
};