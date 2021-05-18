const fetch = require('node-fetch');
const auth = require('../../BaseClient/auth.json');
const APIDiscordBotList = 'https://discordbotlist.com/api/v1/bots/650691698409734151/stats';
const APIDiscordBots = 'https://discord.bots.gg/api/v1/bots/650691698409734151/stats';

module.exports = {
	async execute() {
		const { client } = require('../../BaseClient/DiscordClient');
		const ch = client.ch;
		const res = await ch.query('SELECT * FROM stats;');
		const userCount = res.rows[0].allusers;
		fetch(APIDiscordBots, {
			method: 'post',
			body: JSON.stringify({
				guildCount: client.guilds.cache.size,
			}),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': auth.DBToken
			},
		});
		fetch(APIDiscordBotList, {
			method: 'post',
			body: JSON.stringify({
				'users': userCount,
				'guilds': client.guilds.cache.size
			}),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': auth.DBListToken
			},
		});
	}
};