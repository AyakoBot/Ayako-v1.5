module.exports = {
	async execute(log) {
		if (`${log}`.includes('Tried to send packet')) return console.log('GOT A LOG!', log);
		const client = require('../BaseClient/DiscordClient');
		if (log.includes('Heartbeat') && log.includes('latency')) client.ch.query('UPDATE stats SET heartbeat = $1;', [log.replace(/\D+/g, '')]);
		const res = await client.ch.query('SELECT * FROM stats;');
		if (res?.rows[0]?.verbosity) console.log(log);
	}
};