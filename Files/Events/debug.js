module.exports = {
	async execute(log) {
		log = log.replace('[WS => Shard 0] ', '').replace('[WS => Manager] ', '');
		const { client } = require('../BaseClient/DiscordClient');
		if (log.includes('Heartbeat') && log.includes('latency')) return client.ch.query(`UPDATE stats SET heartbeat = '${log.replace(/\D+/g, '')}';`);
		if (log.includes('heartbeat.')) return;
		const res = await client.ch.query('SELECT * FROM stats;');
		if (res?.rows[0]?.verbosity) console.log(log);
	}
};