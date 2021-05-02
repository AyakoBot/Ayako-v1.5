const { client } = require('../../BaseClient/DiscordClient');
const ch = require('../../BaseClient/ClientHelper'); 
const Constants = require('../../Constants.json');
const Discord = require('discord.js');

module.exports = {
	async execute(msgs) {
		const guild = msgs.first().guild;
		const res = await ch.query(`SELECT * FROM logchannels WHERE guildid = '${guild.id}'`);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.channelEvents);
			if (logchannel && logchannel.id) {
				const language = await ch.languageSelector(guild);
				const con = Constants.messageDeleteBulk;
				const lan = language.messageDeleteBulk;
				const path = await ch.txtFileWriter(msgs);
				let audits = await guild.fetchAuditLogs({limit: 5, type: 73}).catch(() => {});
				let entry;
				if (audits && audits.entries.size > 0) {
					audits = audits.entries.filter((a) => a.target.id == msgs.first().channel.id);
					entry = audits.sort((a,b) => b.id - a.id);
					entry = entry.first();
				}
				const embed = new Discord.MessageEmbed()
					.setTimestamp()
					.setColor(con.color)
					.setAuthor(lan.author.name, con.author.image, ch.stp(con.author.link, {msg: msgs.first()}));
				if (entry) {
					embed.setDescription(ch.stp(lan.descriptionWithAudit, {user: entry.executor, channel: msgs.first().channel, amount: msgs.size}));
				} else {
					embed.setDescription(ch.stp(lan.descriptionWithoutAudit, {channel: msgs.first().channel, amount: msgs.size}));
				}
				if (path) {
					ch.send(logchannel, {
						embed: embed,
						files: [{
							attachment: path,
						}]
					});
				} else {
					ch.send(logchannel, {
						embed: embed,
					});
				}
			}
		}
	}
};