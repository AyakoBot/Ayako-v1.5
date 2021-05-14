const moment = require('moment');
require('moment-duration-format');

module.exports = {
	async execute(msg) {
		if (!msg.author) return;
		if (msg.author.bot) return;
		if (!msg.guild) return;
		const checkedMsg = await require('./commandHandler').prefix(msg);
		const res = await msg.client.ch.query(`SELECT * FROM afk WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) {
			const duration = moment.duration(Date.now() - +res.rows[0].since).format(' D [days], H [hrs], m [mins], s [secs]');
			if (+res.rows[0].since + msg.client.ch.ms('1m') < Date.now()) {
				if (checkedMsg?.command.name == 'afk') return;
				const m = await msg.client.ch.reply(msg, 'I\'ve deleted your AFK\nYou have been AFK for '+duration);
				if (m) setTimeout(() => {m.delete().catch(() => {});}, 10000);
				msg.client.ch.query(`DELETE FROM afk WHERE userid = '${msg.author.id}';`);
			}
		}
		let mentioned = msg.mentions.users;
		mentioned = mentioned.map(o => o);
		mentioned.forEach(async (mention) => {
			const res = await msg.client.ch.query(`SELECT * FROM afk WHERE userid = '${mention.id}' AND guildid = '${msg.guild.id}';`);
			if (res && res.rowCount > 0) {
				const duration = moment.duration(+res.rows[0].since - Date.now()).format(' D [days], H [hrs], m [mins], s [secs]');
				msg.client.ch.reply(msg, `${res.rows[0].text} ${duration.replace(/-/g, '')}`);
			}
		});
	}
};