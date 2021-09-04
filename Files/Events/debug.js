module.exports = {
	async execute(log) {
		const { client } = require('../BaseClient/DiscordClient');
		if (log.includes('Heartbeat') && log.includes('latency')) return client.ch.query('UPDATE stats SET heartbeat = $1;', [log.replace(/\D+/g, '')]);
		if (log.includes('heartbeat.')) return;
		const res = await client.ch.query('SELECT * FROM stats;');
		if (res?.rows[0]?.verbosity) console.log(log);
	}
};