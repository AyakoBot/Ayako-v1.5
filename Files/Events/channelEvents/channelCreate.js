const Discord = require('discord.js');

module.exports = {
	async execute(channel) {
		if (channel.type === 'dm' || channel.type === 'group_dm') return;
		const client = channel.client;
		const ch = client.ch;
		const Constants = client.constants;
		const guild = channel.guild;
		const language = await ch.languageSelector(guild);
		const lan = language.channelCreate;
		const con = Constants.channelCreate;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
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
					channel.permissionOverwrites = channel.permissionOverwrites.cache.map(o => o);
					for (let i = 0; channel.permissionOverwrites.length > i; i++) {
						const perm = channel.permissionOverwrites[i];
						let disable = `${perm.type == 'member' ? `<@${perm.id}>` : perm.type == 'role' ? `<@&${perm.id}>` : language.unknown+' '+perm}\n`;
						let enable = `${perm.type == 'member' ? `<@${perm.id}>` : perm.type == 'role' ? `<@&${perm.id}>` : language.unknown+' '+perm}\n`;
						for (let i = 0; perm.deny.toArray().length > i; i++) disable += `${Constants.switch.disable} \`${language.permissions[perm.deny.toArray()[i]]}\`\n`;
						for (let i = 0; perm.allow.toArray().length > i; i++) enable += `${Constants.switch.enable} \`${language.permissions[perm.allow.toArray()[i]]}\`\n`;
						if (disable.includes('`')) embed.addField(`${language.permissions.deniedPermissionsFor} ${perm.type == 'member' ? language.member : language.role}`, disable);
						if (enable.includes('`')) embed.addField(`${language.permissions.grantedPermissionFor} ${perm.type == 'member' ? language.member : language.role}`, enable);
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
						if (entry.changes[i].key !== 'permission_overwrites') embed.addField(`${language[entry.changes[i].key.toLowerCase()]}\u200b`, `${language.before}: \`${before}\`\n${language.after}: \`${after}\``);
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