const { client } = require('../../../BaseClient/DiscordClient.js');

module.exports = {
	async execute(msg) {
		const ch = client.ch;
		const res = await ch.query('SELECT * FROM blacklists WHERE guildid = $1;', [msg.guild.id]);
		if (msg.content.toLowerCase().includes('https://')) return;
		if (res && res.rowCount > 0) {
			const args = msg.content.split(/ +/);
			let words = [];
			if (res.rows[0].words !== null) {
				const blwords = res.rows[0].words;
				for (let i = 0; i < args.length; i++) {
					const argr = `${args[i]}`.replace(/'/g, '').replace(/`/g, '\\`').replace(/\?/g, '').replace(/!/g, '').replace(/./g, '').replace(/,/g, '').replace(/-/g, '').replace(/~/g, '').replace(/;/g, '').replace(/ /g, '');
					if (blwords.includes(argr.toLowerCase())) {
						if (`${blwords[i]}` !== '') {
							words.push(argr.toLowerCase());
						}
					}
				}
				if (words.length > 0) return;
			}
		}
		const res2 = await ch.query('SELECT * FROM snipe WHERE channelid = $1;', [msg.channel.id]);
		if (res2 && res2.rowCount > 0) ch.query('UPDATE snipe SET text = $1, userid = $3 WHERE channelid = $2;', [msg.content, msg.channel.id, msg.author.id]);
		else ch.query('INSERT INTO snipe (channelid, userid, text) VALUES ($1, $2, $3);', [msg.channel.id, msg.author.id, msg.content]);
	}
};