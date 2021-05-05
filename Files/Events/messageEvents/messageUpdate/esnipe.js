const ch = require('../../../BaseClient/ClientHelper'); 

module.exports = {
	async execute(oldMsg, newMsg) {
		if (oldMsg.content == newMsg.content) return;
		if (oldMsg.pinned !== newMsg.pinned) return;
		let contained = false;
		if (oldMsg.content.toLowerCase().includes('https://') || oldMsg.content.toLowerCase().includes('http://')) return;
		if (newMsg.content.toLowerCase().includes('https://') || newMsg.content.toLowerCase().includes('https://')) return;
		const res = await ch.query(`SELECT * FROM blacklists WHERE guildid = '${oldMsg.guild.id}';`);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const args = newMsg.content.split(/ +/);
			let words = [];
			if (r.words !== null) {
				const blwords = r.words.split(/, +/g);
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
			const res = await ch.query(`SELECT * FROM esnipe WHERE channelid = '${oldMsg.channel.id}';`);
			if (res && res.rowCount > 0) {
				ch.query(`
                        UPDATE esnipe SET before = '${oldMsg.content.replace(/'/g, '').replace(/`/g, '')}' WHERE channelid = '${oldMsg.channel.id}';
                        UPDATE esnipe SET after = '${newMsg.content.replace(/'/g, '').replace(/`/g, '')}' WHERE channelid = '${oldMsg.channel.id}';
                        UPDATE esnipe SET userid = '${oldMsg.author.id}' WHERE channelid = '${oldMsg.channel.id}';
                        `);
			} else {
				ch.query(`INSERT INTO esnipe (channelid, userid, before, after) VALUES ('${oldMsg.channel.id}', '${oldMsg.author.id}', '${oldMsg.content.replace(/'/g, '').replace(/`/g, '')}', '${newMsg.content.replace(/'/g, '').replace(/`/g, '')}');`).catch(()  => {});
			}
		}
	}
};