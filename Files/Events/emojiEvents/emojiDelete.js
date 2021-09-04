const Discord = require('discord.js');

module.exports = {
	async execute(emoji) {
		const client = emoji.client;
		const ch = client.ch;
		const Constants = client.constants;
		const guild = emoji.guild;
		const language = await ch.languageSelector(guild);
		const lan = language.emojiDelete;
		const con = Constants.emojiDelete;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.emojiEvents);
			if (logchannel && logchannel.id) {
				const audits = await emoji.guild.fetchAuditLogs({limit: 10, type: 62});
				let entry;
				if (audits && audits.entries) {
					const audit = audits.entries.filter((a) => a.target.id == emoji.id);
					entry = audit.sort((a,b) => b.id - a.id);
					entry = entry.first();
				}
				emoji.wanted = 'emote';
				const path = await ch.downloader(emoji, ch.stp(con.author.link, {emoji: emoji, ending: emoji.animated ? 'gif' : 'png'}));
				const embed = new Discord.MessageEmbed()
					.setAuthor(lan.author.title, con.author.image, ch.stp(con.author.link, {emoji: emoji, ending: emoji.animated ? 'gif' : 'png'}))
					.setColor(con.color)
					.setTimestamp();
				if (path) {
					const name = await ch.getName(path);
					embed.setThumbnail(`attachment://${name}`);
				}
				if (entry && entry.id) {
					embed.setDescription(ch.stp(lan.description.withUser, {user: entry.executor, emoji: emoji}));
				} else {
					embed.setDescription(ch.stp(lan.description.withoutUser, {emoji: emoji}));
				}
				if (path) ch.send(logchannel, {embeds: [embed], files: [path]});
				else ch.send(logchannel, embed);
			}
		}
	}
};