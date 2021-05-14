const moment = require('moment');
require('moment-duration-format');

module.exports = {
	async execute(msg) {
		if (!msg.author) return;
		if (msg.author.bot) return;
		if (msg.guild) {
			const res = await msg.client.ch.query(`SELECT * FROM afk WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}';`);
			if (res && res.rowCount > 0) {
				const duration = moment.duration(Date.now() - +res.rows[0].since).format(' D [days], H [hrs], m [mins], s [secs]');
				if (+res.rows[0].since + msg.client.ch.ms('1m') < Date.now()) {
					msg.reply('I\'ve deleted your AFK\nYou have been AFK for '+duration).then((m)=>{m.delete({timeout: 10000}).catch(()=>{});}).catch(() => {});
					msg.client.ch.query(`DELETE FROM afk WHERE userid = '${msg.author.id}';`);
				}
			}
			const args = msg.content.split(/ +/);
			args.forEach(async (arg) => {
				if (arg.includes('<@')) { 
					const res = await msg.client.ch.query(`SELECT * FROM afk WHERE userid = '${arg.replace(/\D+/g, '')}' AND guildid = '${msg.guild.id}';`);
					if (res) {
						if (res.rows[0]) {
							const duration = moment.duration(+res.rows[0].since - Date.now()).format(' D [days], H [hrs], m [mins], s [secs]');
							msg.reply(`${res.rows[0].text} ${duration.replace(/-/g, '')}`, {disableMentions: 'everyone'}).catch(() => {});
						}
					}
				}
			});
		}
	}
};