module.exports = {
	async execute() {
		const client = require('../../BaseClient/DiscordClient');
		const res = await client.ch.query('SELECT * FROM warns WHERE type = $1 AND closed = false;', ['Mute']);
		if (res && res.rowCount > 0) {
			for (const row of res.rows) {
				const guild = client.guilds.cache.get(row.guildid);
				if (!guild) continue; 
				let timeLeft = +row.duration - +Date.now();
				const language = await client.ch.languageSelector(guild);
				let msg = await client.channels.cache.get(row.warnedinchannelid)?.messages.fetch(row.msgid).catch(() => {});
				if (!msg) msg = { author: client.users.cache.get(row.warnedbyuserid), client: client };
				msg.language = language, msg.client = client, msg.guild = guild;
				if (timeLeft <= 0) timeLeft = 100;
				client.mutes.set(`${row.guildid}-${row.userid}`, setTimeout(() => client.emit('modMuteRemove', client.user, client.users.cache.get(row.userid), language.ready.unmute.reason, msg), timeLeft));
			}
		}
	}
};
