const { Worker } = require('worker_threads');

const AntiVirusWorker = new Worker('./Files/Events/messageEvents/messageCreate/antiVirusWorker.js');

AntiVirusWorker.on('message', (msg, data) => {

});
AntiVirusWorker.on('error', (error) => {
	throw error;
});

module.exports = {
	async execute(msg) {
		if (!msg.guild || !msg.content) return;
		const res = await msg.client.ch.query('SELECT * FROM antivirus WHERE guildid = $1;', [msg.guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			if (r.active !== true) return;
			AntiVirusWorker.postMessage({
				content: msg.content,
				row: r,
				msgid: msg.id,
				channelid: msg.channel.id
			});
		}
	}
};