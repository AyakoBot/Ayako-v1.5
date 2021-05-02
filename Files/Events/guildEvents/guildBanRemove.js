const { client } = require('../../BaseClient/DiscordClient');
const ch = require('../../BaseClient/ClientHelper'); 
const Constants = require('../../Constants.json');
const Discord = require('discord.js');

module.exports = {
	async execute(guild, user) {
		const language = await ch.languageSelector(guild);
		const lan = language.guildBanRemove;
		const con = Constants.guildBanRemove;
		const res = await ch.query(`SELECT * FROM logchannels WHERE guildid = '${guild.id}'`);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const audits = await guild.fetchAuditLogs({limit: 3, type: 23});
			let entry;
			if (audits && audits.entries) {
				const audit = audits.entries.filter((a) => a.target.id == user.id);
				entry = audit.sort((a,b) => b.id - a.id);
				entry = entry.first();
			}
			const logchannel = client.channels.cache.get(r.guildEvents);
			if (logchannel && logchannel.id) {
				const embed = new Discord.MessageEmbed()
					.setAuthor(lan.author.title, con.author.image)
					.setColor(con.color)
					.setTimestamp();
				if (entry && entry.id) {
					embed.setDescription(ch.stp(lan.description.withUser, {user: entry.executor, target: user}));
					embed.addField(language.reason, entry.reason ? '```'+entry.reason+'```' : language.none);
				} else {
					embed.setDescription(ch.stp(lan.description.withoutUser, {target: user}));
					embed.addField(language.reason, language.unknown);
				}
				ch.send(logchannel, embed);
			}
		}
	}
};