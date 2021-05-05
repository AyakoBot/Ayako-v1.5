const { client } = require('../../BaseClient/DiscordClient');
const ch = require('../../BaseClient/ClientHelper'); 
const Constants = require('../../Constants.json');
const Discord = require('discord.js');

module.exports = {
	async execute(channel) {
		if (channel.type === 'dm' || channel.type === 'group_dm') return;
		const guild = channel.guild;
		const language = await ch.languageSelector(guild);
		const lan = language.channelCreate;
		const con = Constants.channelCreate;
		const res = await ch.query(`SELECT * FROM logchannels WHERE guildid = '${guild.id}';`);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.channelEvents);
			if (logchannel && logchannel.id) {
				let audit = await guild.fetchAuditLogs({limit: 5, type: 10}).catch(() => {});	
				let entry;
				if (audit && audit.entries) {
					audit = audit.entries.filter((e) => e.target.id == channel.id);
					entry = audit.sort((a,b) => b.id - a.id);
					entry = entry.first();
				}
				if (entry && entry.id) {
					const embed = new Discord.MessageEmbed()
						.setAuthor(ch.stp(lan.author.title, {type: language.channels[channel.type]}), con.author.image, ch.stp(con.author.link, {channel: channel}))
						.setDescription(ch.stp(lan.description.withUser, {user: entry.executor, channel: channel, type: language.channels[channel.type]}))
						.setColor(con.color)
						.setTimestamp();
					if (channel.permissionOverwrites.size > 0) {
						for (let i = 0; i < channel.permissionOverwrites.length; i++) {
							const overwrite = channel.permissionOverwrites[i];
							if (overwrite.type === 'role') {
								const role = channel.guild.roles.cache.get(r => r.id === overwrite.id);
								if (role.id === channel.guild.id) return;
								
								console.log(overwrite.deny);
							}
							if (overwrite.type === 'user') {
								console.log(overwrite.deny);
							}
						}
					}
					for (let i = 0; entry.changes.length > i; i++) {
						let before = entry.changes[i].old;
						let after = entry.changes[i].new;
						if (before == undefined) before = language.none;
						if (after == undefined) after = language.none;
						if (entry.changes[i].key == 'type') {
							if (entry.changes[i].old == 0) entry.changes[i].old == language.channels.text;
							else if (entry.changes[i].old == 2) entry.changes[i].old == language.channels.voice;
							else if (entry.changes[i].old == 5) entry.changes[i].old == language.channels.news;
							else entry.changes[i].old == language.unknown;
							if (entry.changes[i].new == 0) entry.changes[i].new == language.channels.text;
							else if (entry.changes[i].new == 2) entry.changes[i].new == language.channels.voice;
							else if (entry.changes[i].new == 5) entry.changes[i].new == language.channels.news;
							else entry.changes[i].new == language.unknown;
						}
						if (Array.isArray(before)) {before = before.map((e) => {`${e}\n`;});}
						if (Array.isArray(after)) {after = after.map((e) => {`${e}\n`;});}
						embed.addField(`${language[entry.changes[i].key.toLowerCase()]}\u200b`, `${language.before}: \`${before}\`\n${language.after}: \`${after}\``);
					}
					ch.send(logchannel, {embed});
				} else {
					const embed = new Discord.MessageEmbed()
						.setAuthor(con.author.title, con.author.image, ch.stp(con.author.link, {channel: channel}))
						.setDescription(lan.description.withoutUser, {channel: channel, type: language.channels[channel.type]})
						.setColor(con.color)
						.setTimestamp();
					ch.send(logchannel, {embed});
				}
			}
		}
	}
};