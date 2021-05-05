const { client } = require('../../BaseClient/DiscordClient');
const ch = require('../../BaseClient/ClientHelper'); 

module.exports = {
	async execute() {
		const res = await ch.query('SELECT * FROM stats;');
		const userCount = res.rows[0].allusers;
		const random = Math.round(Math.random() * 9);
		if (random > 5) client.user.setActivity(`${userCount} users | v1.5- | h!invite`, { type: 'WATCHING' });
		if (random < 5) client.user.setActivity(`${client.guilds.cache.size} servers | v1.5- | Default Prefix: h!`, { type: 'COMPETING' });
	}
};