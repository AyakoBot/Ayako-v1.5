module.exports = {
	name: 'afk',
	perm: null,
	dm: false,
	takesFirstArg: false,
	aliases: null,
	async exe(msg) {
		const lan = msg.lan;
		let text = msg.client.ch.stp(lan.afkText, {username: msg.author.username.replace(/'/g, '')});
		if (msg.args[0]) text = msg.client.ch.stp(lan.afkText2, {slice: msg.args.slice(0).join(' ').replace(/'/g, ''), username: msg.author.username.replace(/'/g, '')});
		if (text.toLowerCase().includes('http://') || text.toLowerCase().includes('https://')) return msg.client.ch.reply(msg, lan.noLinks);
		const res = await msg.client.ch.query(`SELECT * FROM afk WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}';`);
		if (res && res.rowCount > 0) {
			msg.client.ch.query(`
                    UPDATE afk SET text = '${text}' WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}';
                    UPDATE afk SET since = '${Date.now()}' WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}';
                `);
			if (msg.args[0]) msg.client.ch.reply(msg, msg.client.ch.stp(lan.updatedTo, {text: msg.args.slice(0).join(' ')}));
			if (!msg.args[0]) msg.client.ch.reply(msg, lan.updated);
		} else {
			msg.client.ch.query(`INSERT INTO afk (userid, text, since, guildid) VALUES ('${msg.author.id}', '${text}', '${Date.now()}', '${msg.guild.id}');`);
			if (msg.args[0]) msg.client.ch.reply(msg, msg.client.ch.stp(lan.setTo, {text: msg.args.slice(0).join(' ')}));
			if (!msg.args[0]) msg.client.ch.reply(msg, lan.set);
		}
	} 
};