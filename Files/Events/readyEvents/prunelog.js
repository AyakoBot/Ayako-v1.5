const { client } = require('../../BaseClient/DiscordClient');
const ch = require('../../BaseClient/ClientHelper'); 
const Discord = require('discord.js');
const Constants = require('../../Constants.json');

module.exports = {
	async execute() {
		client.guilds.cache.forEach(async guild => {
			const language = await ch.languageSelector(guild);
			const lan = language.ready.prune;
			const con = Constants.prune;
			const res = await ch.query(`SELECT * FROM logchannels WHERE guildid = '${guild.id}'`);
			if (res && res.rowCount > 0) {
				const r = res.rows[0];
				const logchannel = client.channels.cache.get(r.guildEvents);
				if (logchannel && logchannel.id) {
					const audits = await guild.fetchAuditLogs({limit: 10, type: 21});
					let entry;
					if (audits && audits.entries) {
						entry = audits.entries.sort((a,b) => b.id - a.id);
						entry = entry.first();
						if (ch.getUnix(entry.id) > Date.now()-120000) {
							const embed = new Discord.MessageEmbed()
								.setAuthor(lan.author, con.author.image)
								.setDescription(ch.stp(lan.description, {user: entry.executor, amount: entry.extra.removed, days: entry.extra.days}))
								.setTimestamp()
								.setColor(con.color);
							if (entry.reason) embed.addField(language.reason, entry.reason);
							ch.send(logchannel, embed);
						}
					}
				}
			}
		});
	}
};