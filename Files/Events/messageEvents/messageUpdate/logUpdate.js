const { client } = require('../../../BaseClient/DiscordClient');
const Discord = require('discord.js');

module.exports = {
	async execute(oldMsg, newMsg) {
		if (!oldMsg || !newMsg || !oldMsg.content || !newMsg.content) return;
		if (oldMsg.content == newMsg.content) return;
		if (oldMsg.pinned !== newMsg.pinned) return;
		const guild = oldMsg.guild;
		const ch = client.ch;
		const Constants = client.constants;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.channelEvents);
			if (logchannel && logchannel.id) {
				const language = await ch.languageSelector(guild);
				const con = Constants.messageUpdateLogUpdate;
				const lan = language.messageUpdateLogUpdate;
				const embed = new Discord.MessageEmbed()
					.setColor(con.color)
					.setTimestamp()
					.setAuthor(lan.author.name, con.author.image, ch.stp(con.author.link, {msg: newMsg}))
					.setDescription(ch.stp(lan.description, {msg: newMsg, link: ch.stp(con.author.link, {msg: newMsg})}));
				const maxFieldSize = 1024;
				if (oldMsg.content) {
					const letters = oldMsg.content.length;
					if (letters > maxFieldSize) {
						const chunks = [];
						chunks.first = oldMsg.content.substr(0, maxFieldSize-1) + '\u2026';
						chunks.last = '\u2026'+oldMsg.content.substr(maxFieldSize-1, maxFieldSize * 2);
						embed.addField(lan.oldContent, chunks.first);
						embed.addField('\u200b', chunks.last);
					} else {
						embed.addField(lan.oldContent, oldMsg.content);
					}
				}
				if (newMsg.content) {
					const letters = newMsg.content.length;
					if (letters > maxFieldSize) {
						const chunks = [];
						chunks.first = newMsg.content.substr(0, maxFieldSize-1) + '\u2026';
						chunks.last = '\u2026'+newMsg.content.substr(maxFieldSize-1, maxFieldSize * 2);
						embed.addField(lan.newContent, chunks.first);
						embed.addField('\u200b', chunks.last);
					} else {
						embed.addField(lan.newContent, newMsg.content);
					}
				}
				ch.send(logchannel, embed);
			}
		}

	}
};
