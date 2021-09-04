const Discord = require('discord.js');

module.exports = {
	async execute(ban) {
		const client = ban.client;
		const ch = client.ch;
		const Constants = client.constants;
		const language = await ch.languageSelector(ban.guild);
		const lan = language.guildBanAdd;
		const con = Constants.guildBanAdd;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [ban.guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.guildEvents);
			if (logchannel && logchannel.id) {
				const audits = await ban.guild.fetchAuditLogs({limit: 3, type: 22});
				let entry;
				if (audits && audits.entries) {
					const audit = audits.entries.filter((a) => a.target.id == ban.guild.id);
					entry = audit.sort((a,b) => b.id - a.id);
					entry = entry.first();
				}
				const embed = new Discord.MessageEmbed()
					.setAuthor(lan.author.title, con.author.image)
					.setColor(con.color)
					.setTimestamp();
				if (entry && entry.id) {
					embed.setDescription(ch.stp(lan.description.withUser, {user: entry.executor, target: ban.guild}));
					embed.addField(language.reason, entry.reason ? '```'+entry.reason+'```' : language.none);
				} else {
					embed.setDescription(ch.stp(lan.description.withoutUser, {target: ban.guild}));
					embed.addField(language.reason, ban.reason ? ban.reason : language.unknown);
				}
				ch.send(logchannel, embed);
			}
		}
	}
};