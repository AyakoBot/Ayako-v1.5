const { Worker } = require('worker_threads');
const client = require('../../../BaseClient/DiscordClient');

const AntiVirusWorker = new Worker('./Files/Events/messageEvents/messageCreate/antivirusWorker.js');

AntiVirusWorker.on('message', (data) => {
	if (data.text == 'BLACKLISTED_LINK') client.emit('antivirusBlacklist', { msgid: data.msgid, channelid: data.channelid, authorid: data.authorid, client: client }, data.link);
	if (data.text == 'SEVERE_LINK') client.emit('antivirusBadlink', { msgid: data.msg.msgid, channelid: data.msg.channelid, authorid: data.msg.authorid, client: client }, data.link, data.severity, data.VTresponse);
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
				channelid: msg.channel.id,
				authorid: msg.author.id
			});
		}
	}
};