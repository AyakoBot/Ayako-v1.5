const { Worker } = require('worker_threads');
const client = require('../../../BaseClient/DiscordClient');

const AntiVirusWorker = new Worker('./Files/Events/messageEvents/messageCreate/antiVirusWorker.js');

AntiVirusWorker.on('message', (msg, data) => {
	if (msg == 'BLACKLISTED_LINK') client.emit('antivirus_blacklist', { msgid: data.msgid, channelid: data.channelid }, data.link)
	if (msg == 'SEVERE_LINK') client.emit('antivirus_badlink', { msgid: data.msg.msgid, channelid: data.msg.channelid }, data.link, data.severity, data.VTresponse)
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