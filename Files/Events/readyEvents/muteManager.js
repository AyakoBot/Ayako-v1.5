module.exports = {
	async execute() {
		const client = require('../../BaseClient/DiscordClient');
		const res = await client.ch.query('SELECT *, ROW_NUMBER() OVER () FROM WHERE type = $1 AND closed = false;', ['Mute']);
		if (res && res.rowCount > 0) {
			for (const row of res.rows) {
				const guild = client.guilds.cache.get(row.guildid);
				if (!guild) continue; 
				let timeLeft = +row.duration - +Date.now();
				const language = await client.ch.languageSelector(guild);
				const msg = {guild: guild, author: client.users.cache.get(row.warnedbyuserid), language: language, constants: require('../../Constants.json'), client: client};
				if (timeLeft <= 0) timeLeft = 100;
				client.mutes.set(`${row.guildid}-${row.userid}`, setTimeout(() => client.emit('modMuteRemove', client.user, client.users.cache.get(row.userid), language.ready.unmute.reason, msg), 100));
			}
		}
	}
};
