const { client } = require('../../../BaseClient/DiscordClient');
const Discord = require('discord.js');

module.exports = {
	async execute(oldMsg, newMsg) {
		if (oldMsg.channel.type !== 'GUILD_NEWS' || newMsg.channel.type !== 'GUILD_NEWS') return;
		if (oldMsg.crosspostable == newMsg.crosspostable) return;
		const ch = client.ch;
		const Constants = client.constants;
		const guild = oldMsg.guild;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.channelEvents);
			if (logchannel && logchannel.id) {
				const language = await ch.languageSelector(guild);
				const con = Constants.messageUpdateLogPublish;
				const lan = language.messageUpdateLogPublish;
				const embed = new Discord.MessageEmbed()
					.setColor(con.color)
					.setTimestamp()
					.setAuthor(lan.author.name, con.author.image, con.author.link)
					.setDescription(ch.stp(lan.description, {msg: newMsg, link: ch.stp(con.author.link, {msg: newMsg})}));  
				const maxFieldSize = 1024;           
				if (newMsg.content) {
					const letters = newMsg.content.length;
					if (letters > maxFieldSize) {
						const chunks = [];
						chunks.first = newMsg.content.substr(0, maxFieldSize-1) + '\u2026';
						chunks.last = '\u2026'+newMsg.content.substr(maxFieldSize-1, maxFieldSize * 2);
						embed.addField(language.content, chunks.first);
						embed.addField('\u200b', chunks.last);
					} else {
						embed.addField(language.content, newMsg.content);
					}
				}
				if (newMsg.embeds) {
					for (const embeds of newMsg.embeds) {
						if (embeds.title) embed.addField(language.title, embeds.title);
						else if (embeds.description) embed.addField(language.description, embeds.description);
						else embed.addField(language.unknownEmbed, '\u200b');
					}
				}
				if (newMsg.attachments.size > 0) {
					const path = await ch.downloader(newMsg); 
					if (path) {
						const name = await ch.getName(path);
						embed.attachFiles([path]);
						embed.setImage(`attachment://${name}`);
					}
				}
				ch.send(logchannel, embed);
			}
		}
	}
};