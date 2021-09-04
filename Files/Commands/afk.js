module.exports = {
	name: 'afk',
	perm: null,
	dm: false,
	takesFirstArg: false,
	aliases: null,
	async exe(msg) {
		const lan = msg.lan;
		let text = msg.client.ch.stp(lan.afkText, {username: msg.author.username});
		if (msg.args[0]) text = msg.client.ch.stp(lan.afkText2, {slice: msg.args.slice(0).join(' '), username: msg.author.username});
		if (text.toLowerCase().includes('http://') || text.toLowerCase().includes('https://')) return msg.client.ch.reply(msg, lan.noLinks);
		const res = await msg.client.ch.query('SELECT * FROM afk WHERE userid = $1 AND guildid = $2;', [msg.author.id, msg.guild.id]);
		if (res && res.rowCount > 0) {
			msg.client.ch.query('UPDATE afk SET text = $1, since = $4 WHERE userid = $2 AND guildid = $3;', [text, msg.author.id, msg.guild.id, Date.now()]);
			if (msg.args[0]) msg.client.ch.reply(msg, msg.client.ch.stp(lan.updatedTo, {text: msg.args.slice(0).join(' ')}));
			if (!msg.args[0]) msg.client.ch.reply(msg, lan.updated);
		} else {
			msg.client.ch.query('INSERT INTO afk (userid, text, since, guildid) VALUES ($1, $2, $3, $4);', [msg.author.id, text, Date.now(), msg.guild.id]);
			if (msg.args[0]) msg.client.ch.reply(msg, msg.client.ch.stp(lan.setTo, {text: msg.args.slice(0).join(' ')}));
			if (!msg.args[0]) msg.client.ch.reply(msg, lan.set);
		}
	} 
};