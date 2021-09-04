const { client } = require('../../../BaseClient/DiscordClient');
const Discord = require('discord.js');

module.exports = {
	async execute(msg) {
		const guild = msg.guild;
		const ch = client.ch;
		const Constants = client.constants;
		const language = await ch.languageSelector(guild);
		const lan = language.messageDelete;
		const con = Constants.messageDelete;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.messageEvents);
			if (logchannel && logchannel.id) {
				const audits = await guild.fetchAuditLogs({limit: 5, type: 72});
				let entry;
				if (audits && audits.entries) {
					const audit = audits.entries.filter(a => a.target && (a.target.id == msg.author.id) && (a.extra.channel.id == msg.channel.id));
					entry = audit.sort((a,b) => b.id - a.id);
					entry = entry.first();
				}
				const embed = new Discord.MessageEmbed()
					.setColor(con.color)
					.setTimestamp();
				if (entry) {
					embed.setAuthor(lan.author.name, con.author.image, ch.stp(con.author.link, {msg: msg}));
					embed.setDescription(ch.stp(lan.descriptionWithAudit, {user: entry.executor, target: msg.author, channel: msg.channel}));
					if (entry.reason) embed.addField(language.reason, entry.reason);
				} else {
					embed.setAuthor(lan.author.name, con.author.image, ch.stp(con.author.link, {msg: msg}));
					embed.setDescription(ch.stp(lan.descriptionWithoutAudit, {user: msg.author, channel: msg.channel}));
				}
				const letters = msg.content.length;
				const maxFieldSize = 1024;
				if (msg.content) {
					if (letters > maxFieldSize) {
						const chunks = [];
						chunks.first = msg.content.substr(0, maxFieldSize-1) + '\u2026';
						chunks.last = '\u2026'+msg.content.substr(maxFieldSize-1, maxFieldSize * 2);
						embed.addField(language.content, chunks.first);
						embed.addField('\u200b', chunks.last);
					} else {
						embed.addField(language.content, msg.content);
					}
				}
				let path;
				if (msg.attachments.size > 0) {
					path = await ch.downloader(msg);
				}
				if (path) {
					const name = await ch.getName(path);
					embed.setImage(`attachment://${name}`);
				}
				if (msg.embeds.size > 0) {
					for (let i = 0; i < msg.embeds.size; i++) {
						if (msg.embeds[i].title) embed.addField(language.embedTitle, msg.embeds[i].title);
						if (msg.embeds[i].description) embed.addField(language.embedDescription, msg.embeds[i].description);
					}
				}
				if (path) ch.send(logchannel, {embeds: [embed], files: [path]});
				else ch.send(logchannel, {embeds: [embed]});
			}
		}
	}
};
