module.exports = {
	async execute(msg) {
		require('./commandHandler').execute(msg);
		require('./afk').execute(msg);
		require('./disboard').execute(msg);
		require('./leveling').execute(msg);
		require('./toxicity').execute(msg);
		if (!msg.editedAt) {
			if (msg.client.uptime > 10000) {
				const res = await msg.client.ch.query('SELECT * FROM stats;');
				if (res.rows[0].antispam == true) require('./antispam').execute(msg); 
			}
		}
	}
};