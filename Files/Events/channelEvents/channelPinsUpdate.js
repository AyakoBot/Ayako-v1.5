const Discord = require('discord.js');

module.exports = {
	async execute(channel) {
		const client = channel.client;
		const guild = channel.guild;
		const ch = require('../../BaseClient/ClientHelper'); 
		const Constants = require('../../Constants.json');
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.channelEvents);
			if (logchannel && logchannel.id) {
				const language = await ch.languageSelector(guild);
				let auditsPin = await guild.fetchAuditLogs({limit: 5, type: 74}).catch(() => {});	
				let auditsUnPin = await guild.fetchAuditLogs({limit: 5, type: 75}).catch(() => {});	
				let entryPin; let entryUnPin;
				if (auditsPin) {
					auditsPin = auditsPin.entries.filter(a => a.extra.channel.id == channel.id);
					auditsPin = auditsPin.sort((a,b) => b.id - a.id);
					entryPin = auditsPin.first();
				}
				if (auditsUnPin) {
					auditsUnPin = auditsUnPin.entries.filter(a => a.extra.channel.id == channel.id);
					auditsUnPin = auditsUnPin.sort((a,b) => b.id - a.id);
					entryUnPin = auditsUnPin.first();
				}
				const embed = new Discord.MessageEmbed()
					.setTimestamp();
				if (entryPin && entryUnPin) {
					if (ch.getUnix(entryPin.id) > ch.getUnix(entryUnPin.id)) {
						casePin(entryPin, embed, language, logchannel);
					} else if (ch.getUnix(entryPin.id) < ch.getUnix(entryUnPin.id)) {
						caseUnPin(entryUnPin, embed, language, logchannel);
					} else {
						caseUnknown(embed, language, logchannel);
					}
				} else if (entryPin) {
					casePin(entryPin, embed, language, logchannel);
				} else if (entryUnPin) {
					caseUnPin(entryUnPin, embed, language, logchannel);
				} else {
					caseUnknown(embed, language, logchannel);
				}
			}
		}
		async function casePin(entryPin, embed, language, logchannel) {
			const pinned = await channel.messages.fetch(entryPin.extra.messageID).catch(() => {});
			const lan = language.channelPin;
			const con = Constants.channelPin;
			if (pinned && pinned.author) {
				if (pinned.content) {
					embed.addField(language.content, pinned.content);
				}
				for (let i = 0; pinned.embeds.length > i; i++) {
					if (pinned.embeds[i].title) {
						embed.addField(language.embedTitle, pinned.embeds[i].title);
					} else if (pinned.embeds[i].description) {
						embed.addField(language.embedDescription, pinned.embeds[i].description);
					} else {
						embed.addField(language.embed, language.unknownEmbed);
					}
				}
				let path = undefined;
				if (pinned.attachments.size > 0) {
					path = await ch.downloader(pinned);
				}
				if (path) {
					const name = await ch.getName(path);
					embed.attachFiles([path]);
					embed.setImage(`attachment://${name}`);
				}
				embed
					.setAuthor(lan.author.title, con.author.image, con.author.link)
					.setDescription(ch.stp(lan.description.withAuthor.withAudit, {user: entryPin.executor, channel: channel, guild: guild, msg: pinned, author: pinned.author}))
					.setColor(con.color);
				ch.send(logchannel, embed);
			} else {
				embed
					.setAuthor(lan.author.title, con.author.image, con.author.link)
					.setDescription(ch.stp(lan.description.withoutAuthor.withAudit, {user: entryPin.executor, channel: channel}))
					.setColor(con.color);
				ch.send(logchannel, {embed});
			}

		}
		async function caseUnPin(entryUnPin, embed, language, logchannel) {
			const pinned = await channel.messages.fetch(entryUnPin.extra.messageID).catch(() => {});
			const lan = language.channelUnPin;
			const con = Constants.channelUnPin;
			if (pinned && pinned.author) {
				if (pinned.content) {
					embed.addField(language.content, pinned.content);
				}
				for (let i = 0; pinned.embeds.length > i; i++) {
					if (pinned.embeds[i].title) {
						embed.addField(language.embedTitle, pinned.embeds[i].title);
					} else if (pinned.embeds[i].description) {
						embed.addField(language.embedDescription, pinned.embeds[i].description);
					} else {
						embed.addField(language.embed, language.unknownEmbed);
					}
				}
				let path = undefined;
				if (pinned.attachments.size > 0) {
					path = await ch.downloader(pinned);
				}
				if (path) {
					const name = await ch.getName(path);
					embed.attachFiles([path]);
					embed.setImage(`attachment://${name}`);
				}
				embed
					.setAuthor(lan.author.title, con.author.image, con.author.link)
					.setDescription(ch.stp(lan.description.withAuthor.withAudit, {user: entryUnPin.executor, channel: channel, guild: guild, msg: pinned, author: pinned.author}))
					.setColor(con.color);
				ch.send(logchannel, {embed});
			} else {
				embed
					.setAuthor(lan.author.title, con.author.image, con.author.link)
					.setDescription(ch.stp(lan.description.withoutAuthor.withAudit, {user: entryUnPin.executor, channel: channel}))
					.setColor(con.color);
				ch.send(logchannel, {embed});
			}

		}
		function caseUnknown(embed, language, logchannel) {
			const lan = language.channelPinUpdate;
			const con = Constants.channelPinUpdate;
			embed
				.setAuthor(lan.author.title, con.author.image)
				.setDescription(ch.stp(lan.description.withoutAuthor.withoutAudit, {channel: channel}))
				.setColor(con.color)
				.setTimestamp();
			ch.send(logchannel, {embed});
		}
	}
};

