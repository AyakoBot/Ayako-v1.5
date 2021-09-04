const { client } = require('../../../BaseClient/DiscordClient.js');


module.exports = {
	async execute(oldMsg, newMsg) {
		const ch = client.ch;
		if (!oldMsg || !newMsg || !oldMsg.content || !newMsg.content) return;
		if (oldMsg.content == newMsg.content) return;
		if (oldMsg.pinned !== newMsg.pinned) return;
		let contained = false;
		if (oldMsg.content.toLowerCase().includes('https://') || oldMsg.content.toLowerCase().includes('http://')) return;
		if (newMsg.content.toLowerCase().includes('https://') || newMsg.content.toLowerCase().includes('https://')) return;
		const res = await ch.query('SELECT * FROM blacklists WHERE guildid = $1;', [newMsg.guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const args = newMsg.content.split(/ +/);
			let words = [];
			if (r.words !== null) {
				const blwords = r.words;
				for (let i = 0; i < args.length; i++) {
					const argr = `${args[i]}`.replace(/'/g, '').replace(/`/g, '\\`').replace(/\?/g, '').replace(/!/g, '').replace(/./g, '').replace(/,/g, '').replace(/-/g, '').replace(/~/g, '').replace(/;/g, '').replace(/ /g, '');
					if (argr.includes(blwords[i])) {
						if (`${blwords[i]}` !== '') {
							words.push(argr.toLowerCase());
						}
					}
				}
				if (words.length > 0) {
					return;
				}
			}
		}
		if (contained == false) {
			const res = await ch.query('SELECT * FROM esnipe WHERE channelid = $1;', [newMsg.channel.id]);
			if (res && res.rowCount > 0) ch.query('UPDATE esnipe SET before = $1, after = $3, userid = $4 WHERE channelid = $2;', [oldMsg.content, oldMsg.channel.id, newMsg.content, oldMsg.author.id]);
			else ch.query('INSERT INTO esnipe (channelid, userid, before, after) VALUES ($1, $2, $3, $4);', [oldMsg.channel.id, oldMsg.author.id, oldMsg.content, newMsg.content]);
		}
	}
};