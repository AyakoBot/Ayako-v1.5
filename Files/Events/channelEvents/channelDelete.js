const Discord = require('discord.js');

module.exports = {
	async execute(channel) {
		const guild = channel.guild;
		const client = channel.client;
		const ch = client.ch;
		const Constants = client.constants;
		const language = await ch.languageSelector(guild);
		const lan = language.channelDelete;
		const con = Constants.channelDelete;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.channelEvents);
			if (logchannel && logchannel.id) {
				let audit = await guild.fetchAuditLogs({limit: 5, type: 12}).catch(() => {});	
				let entry;
				if (audit && audit.entries) {
					audit = audit.entries.filter((e) => e.target.id == channel.id);
					entry = audit.sort((a,b) => b.id - a.id);
					entry = entry.first();
				}
				if (entry && entry.id) {
					const embed = new Discord.MessageEmbed()
						.setAuthor(ch.stp(lan.author.title, {type: language.channels[channel.type]}), con.author.image)
						.setDescription(ch.stp(lan.description.withUser, {user: entry.executor, channel: channel, type: language.channels[channel.type]}))
						.setColor(con.color)
						.setTimestamp();
					ch.send(logchannel, {embed});
				} else {
					const embed = new Discord.MessageEmbed()
						.setAuthor(con.author.title, con.author.image)
						.setDescription(lan.description.withoutUser, {channel: channel, type: language.channels[channel.type]})
						.setColor(con.color)
						.setTimestamp();
					ch.send(logchannel, {embed});
				}
			}
		}
	}
};