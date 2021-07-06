const { client } = require('../../../BaseClient/DiscordClient.js');

module.exports = {
	async execute(msg) {
		let contained = false;
		const ch = client.ch;
		const res = await ch.query(`SELECT * FROM blacklist WHERE guildid = '${msg.guild.id}';`);
		if (msg.content.toLowerCase().includes('https://')) return;
		if (res && res.rowCount > 0) {
			const args = msg.content.split(/ +/);
			let words = [];
			if (res.rows[0].words !== null) {
				const blwords = res.rows[0].words.split(/, +/g);
				for (let i = 0; i < args.length; i++) {
					const argr = `${args[i]}`.replace(/'/g, '').replace(/`/g, '\\`').replace(/\?/g, '').replace(/!/g, '').replace(/./g, '').replace(/,/g, '').replace(/-/g, '').replace(/~/g, '').replace(/;/g, '').replace(/ /g, '');
					if (blwords.includes(argr.toLowerCase())) {
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
			const res = await ch.query(`SELECT * FROM snipe WHERE channelid = '${msg.channel.id}';`);
			if (res && res.rowCount > 0) {
				ch.query(`
                    UPDATE snipe SET text = '${msg.content.replace(/'/g, '').replace(/`/g, '')}' WHERE channelid = '${msg.channel.id}';
                    UPDATE snipe SET userid = '${msg.author.id}' WHERE channelid = '${msg.channel.id}';
                    `);
			} else {
				ch.query(`INSERT INTO snipe (channelid, userid, text) VALUES ('${msg.channel.id}', '${msg.author.id}', '${msg.content.replace(/'/g, '').replace(/`/g, '')}');`).catch(()  => {});
			}
		}

	}
};