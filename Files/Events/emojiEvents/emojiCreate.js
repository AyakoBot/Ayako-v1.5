const Discord = require('discord.js');

module.exports = {
	async execute(emoji) {
		const client = emoji.client;
		const guild = emoji.guild;
		const ch = require('../../BaseClient/ClientHelper'); 
		const Constants = require('../../Constants.json');
		const language = await ch.languageSelector(guild);
		const lan = language.emojiCreate;
		const con = Constants.emojiCreate;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const audits = await emoji.guild.fetchAuditLogs({limit: 10, type: 60});
			let entry;
			if (audits && audits.entries) {
				const audit = audits.entries.filter((a) => a.target.id == emoji.id);
				entry = audit.sort((a,b) => b.id - a.id);
				entry = entry.first();
			}
			const logchannel = client.channels.cache.get(r.emojiEvents);
			if (logchannel && logchannel.id) {
				const embed = new Discord.MessageEmbed()
					.setAuthor(lan.author.title, con.author.image, ch.stp(con.author.link, {emoji: emoji, ending: emoji.animated ? 'gif' : 'png'}))
					.setThumbnail(ch.stp(con.author.link, {emoji: emoji, ending: emoji.animated ? 'gif' : 'png'}))
					.setColor(con.color)
					.setTimestamp();
				if (entry && entry.id) {
					embed.setDescription(ch.stp(lan.description.withUser, {user: entry.executor, emoji: emoji}));
				} else {
					embed.setDescription(ch.stp(lan.description.withoutUser, {emoji: emoji}));
				}
				ch.send(logchannel, embed);
			}
		}
	}
};