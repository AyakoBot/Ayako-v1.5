const Discord = require('discord.js');

module.exports = {
	async execute(oldEmoji, newEmoji) {
		const guild = oldEmoji.guild;
		const client = oldEmoji ? oldEmoji.client : newEmoji.client;
		const ch = require('../../BaseClient/ClientHelper'); 
		const Constants = require('../../Constants.json');
		const language = await ch.languageSelector(guild);
		const lan = language.emojiUpdate;
		const con = Constants.emojiUpdate;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const audits = await guild.fetchAuditLogs({limit: 2, type: 61}).catch(() => {});	
			let entry;
			if (audits && audits.entries) {
				const audit = audits.entries.filter((a) => a.target.id == newEmoji.id);
				entry = audit.sort((a,b) => b.id - a.id);
				entry = entry.first();
			}
			const logchannel = client.channels.cache.get(r.emojiEvents);
			if (logchannel && logchannel.id) {
				const embed = new Discord.MessageEmbed()
					.setAuthor(lan.author.title, con.author.image, ch.stp(con.author.link, {emoji: newEmoji, ending: newEmoji.animated ? 'gif' : 'png'}))
					.setThumbnail(ch.stp(con.author.link, {emoji: oldEmoji, ending: newEmoji.animated ? 'gif' : 'png'}))
					.setColor(con.color)
					.setTimestamp();
				if (entry && entry.id) {
					embed.setDescription(ch.stp(lan.description.withUser, {user: entry.executor, newEmoji: newEmoji, oldEmoji: oldEmoji}));
				} else {
					embed.setDescription(ch.stp(lan.description.withoutUser, {newEmoji: newEmoji, oldEmoji: oldEmoji}));
				}
				ch.send(logchannel, embed);
			}
		}
	}
};