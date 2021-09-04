const Discord = require('discord.js');

module.exports = {
	async execute(oldChannel, newChannel) {
		const client = oldChannel ? oldChannel.client : newChannel.client;
		if (oldChannel.type === 'dm') return;
		if (newChannel.position !== oldChannel.position) return; // flawed logic
		if (newChannel.children !== oldChannel.children) return; // unnecessary since we already handle parents
		const ch = require('../../BaseClient/ClientHelper'); 
		const Constants = require('../../Constants.json');
		const guild = newChannel.guild;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.channelEvents);
			if (logchannel && logchannel.id) {
				const language = await ch.languageSelector(guild);
				const lan = language.channelUpdate;
				const con = Constants.channelUpdate;
				let typeID;
				const embed = new Discord.MessageEmbed()
					.setAuthor(ch.stp(lan.author.title, {type: `${language.channels[newChannel.type]}`}), con.author.image, ch.stp(con.author.link, {channel: newChannel}))
					.setTimestamp()
					.setColor(con.color);
				const changedKey = [];
				if (oldChannel.name !== newChannel.name) {
					changedKey.push(language.name);
					typeID = 11;
					embed.addField(language.name, `${language.before}: \`${oldChannel.name}\`\n${language.after}: \`${newChannel.name}\``);
				}
				if (oldChannel.parent !== newChannel.parent) {
					changedKey.push(language.category);
					typeID = 11;
					embed.addField(language.category, `${language.before}: \`${oldChannel.parent.name}\`\n${language.after}: \`${newChannel.parent.name}\``);
				}
				if (oldChannel.nsfw !== newChannel.nsfw) {
					changedKey.push(language.nsfw);
					typeID = 11;
					embed.addField(language.nsfw, `${language.before}: \`${oldChannel.nsfw}\`\n${language.after}: \`${newChannel.nsfw}\``);
				}
				if ((oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) && newChannel.rateLimitPerUser && oldChannel.rateLimitPer) {
					changedKey.push(language.rate_limit_per_user);
					typeID = 11;
					embed.addField(language.rate_limit_per_user, `${language.before}: \`${oldChannel.rateLimitPerUser} ${language.time.seconds}\`\n${language.after}: \`${newChannel.rateLimitPerUser} ${language.time.seconds}\``);
				}
				if (oldChannel.topic !== newChannel.topic) {
					changedKey.push(language.topic);
					typeID = 11;
					if (oldChannel.type == 'stage') embed.addField(language.stageOpen, `${language.before}: \`${oldChannel.topic}\`\n${language.after}: \`${newChannel.topic}\``);
					else embed.addField(language.topic, `${language.before}: \`${oldChannel.topic}\`\n${language.after}: \`${newChannel.topic}\``);
				}
				if (oldChannel.type !== newChannel.type) {
					changedKey.push(language.type);
					typeID = 11;
					embed.addField(language.type, `${language.before}: \`${language.channels[oldChannel.type]}\`\n${language.after}: \`${language.channels[newChannel.type]}\``);
				}
				if (oldChannel.bitrate !== newChannel.bitrate) {
					changedKey.push(language.bitrate);
					typeID = 11;
					embed.addField(language.bitrate, `${language.before}: \`${oldChannel.bitrate / 1000} kbps\`\n${language.after}: \`${newChannel.bitrate / 1000} kbps\``);
				}
				if (oldChannel.rtcRegion !== newChannel.rtcRegion) {
					changedKey.push(language.rtc_region);
					typeID = 11;
					embed.addField(language.rtc_region, `${language.before}: \`${oldChannel.rtcRegion ? oldChannel.rtcRegion : 'automatic'}\`\n${language.after}: \`${newChannel.rtcRegion ? newChannel.rtcRegion : 'automatic'}\``);
				}
				if (oldChannel.userLimit !== newChannel.userLimit) {
					changedKey.push(language.user_limit);
					typeID = 11;
					embed.addField(language.user_limit, `${language.before}: \`${oldChannel.userLimit}\`\n${language.after}: \`${newChannel.userLimit}\``);
				}
				if (oldChannel.permissionOverwrites.cache !== newChannel.permissionOverwrites.cache) {
					const oldPerms = [];
					const newPerms = [];
					for (const [, overwrite] of oldChannel.permissionOverwrites.cache.entries()) {
						const temp = {};
						temp.id = overwrite.id;
						temp.type = overwrite.type;
						temp.allow = overwrite.allow;
						temp.deny = overwrite.deny; 
						oldPerms.push(temp);
					}
					for (const [, overwrite] of newChannel.permissionOverwrites.cache.entries()) {
						const temp = {};
						temp.id = overwrite.id;
						temp.type = overwrite.type;
						temp.allow = overwrite.allow;
						temp.deny = overwrite.deny; 
						newPerms.push(temp);
					}
					if (oldPerms.length > newPerms.length) {
						changedKey.push(language.permission_overwrites);
						let deletedPerm;
						typeID = 15;
						if (newPerms[0] && !oldPerms[0]) deletedPerm = newPerms[0];
						else if (oldPerms[0] && !newPerms[0]) deletedPerm = oldPerms[0];
						else {
							newPerms.forEach(n => oldPerms.forEach(o => {
								if (o !== n) deletedPerm = o;
							}));
						}
						embed.addField(language.permissions.removedPermissionsFor, deletedPerm.type == 'member' ? `${language.member} <@${deletedPerm.id}>` : deletedPerm.type == 'role' ? `${language.role} <@&${deletedPerm.id}>` : language.unknown+' '+deletedPerm);
					} else if (oldPerms.length < newPerms.length) {
						changedKey.push(language.permission_overwrites);
						let createdPerm;
						typeID = 13;
						if (newPerms[0] && !oldPerms[0]) createdPerm = newPerms[0];
						else if (oldPerms[0] && !newPerms[0]) createdPerm = oldPerms[0];
						else {
							newPerms.forEach(n => oldPerms.forEach(o => {
								if (o !== n) createdPerm = n;
							}));
						}
						embed.addField(language.permissions.grantedPermissionFor, createdPerm.type == 'member' ? `${language.member} <@${createdPerm.id}>` : createdPerm.type == 'role' ? `${language.role} <@&${createdPerm.id}>` : language.unknown+' '+createdPerm);
					} else {
						for (let i = 0; newPerms.length > oldPerms.length ? newPerms.length : oldPerms.length> i; i++) {
							const newPerm = newPerms[i];
							const oldPerm = oldPerms[i];
							const [tBit1, Bit1] = ch.bitUniques(oldPerm.deny, newPerm.deny);
							const [tBit2, Bit2] = ch.bitUniques(oldPerm.allow, newPerm.allow);
							const tBit3 = tBit1.add([...tBit2]);
							const Bit3 = tBit3.remove([...Bit1]).remove([...Bit2]);
							let neutral = `${oldPerm.type == 'member' ? `<@${oldPerm.id}>` : oldPerm.type == 'role' ? `<@&${oldPerm.id}>` : language.unknown+' '+oldPerm}\n`; 
							let disable = `${newPerm.type == 'member' ? `<@${newPerm.id}>` : newPerm.type == 'role' ? `<@&${newPerm.id}>` : language.unknown+' '+newPerm}\n`;
							let enable = `${newPerm.type == 'member' ? `<@${newPerm.id}>` : newPerm.type == 'role' ? `<@&${newPerm.id}>` : language.unknown+' '+newPerm}\n`;
							for (let i = 0; Bit1.toArray().length > i; i++) {
								disable += `${Constants.switch.disable} \`${language.permissions[Bit1.toArray()[i]]}\`\n`;
							}
							for (let i = 0; Bit2.toArray().length > i; i++) {
								enable += `${Constants.switch.enable} \`${language.permissions[Bit2.toArray()[i]]}\`\n`;
							}
							for (let i = 0; Bit3.toArray().length > i; i++) {
								neutral += `${Constants.switch.neutral} \`${language.permissions[Bit3.toArray()[i]]}\`\n`;
							}
							if (neutral.includes('`')) {
								embed.addField(`${language.permissions.removedPermissionsFor} ${oldPerm.type == 'member' ? language.member : language.role}`, neutral);
								changedKey.push(language.permission_overwrites);
								typeID = 14;
							}
							if (disable.includes('`')) {
								embed.addField(`${language.permissions.deniedPermissionsFor} ${newPerm.type == 'member' ? language.member : language.role}`, disable);
								changedKey.push(language.permission_overwrites);
								typeID = 14;
							}
							if (enable.includes('`')) {
								embed.addField(`${language.permissions.grantedPermissionFor} ${newPerm.type == 'member' ? language.member : language.role}`, enable);
								changedKey.push(language.permission_overwrites);
								typeID = 14;
							}
						}
					}
					if (!typeID) typeID = 11;		
					const audits = await guild.fetchAuditLogs({limit: 3, type: typeID});
					let entry;
					if (audits && audits.entries) {
						const audit = audits.entries.filter((a) => a.target.id == newChannel.id);
						entry = audit.sort((a,b) => b.id - a.id);
						entry = entry.first();
					}
					if (entry) {
						for (const change of [...entry.changes.entries()]) {
							for (let i = 1; i < change.length; i++) {
								const key = change[i].key;
								const before = change[i].old;
								const after = change[i].new;
								if (key == 'video_quality_mode') {
									embed.addField(language.video_quality_mode, `${language.before}: \`${before == 1 ? language.automatic : '720p'}\`\n${language.after}: \`${after == 1 ? language.automatic : '720p'}\``);
									changedKey.push(language.video_quality_mode);
								}
								if (key == 'type') {
									let type;
									if (before == 1) type = language.channelFollower;
									if (before == 0) type = language.incoming;
									if (type) embed.addField(language.type, type);
								}
							}
						}
					}
					if (embed.fields.length == 0) return;
					if (entry) {
						embed.setDescription(ch.stp(lan.description.withAudit, {user: entry.executor, channel: newChannel, type: language.channels[newChannel.type]})+`\n\n${language.changes}:`+changedKey.map(o => ` \`${o}\``));
					} else {
						embed.setDescription(ch.stp(lan.description.withoutAudit, {channel: newChannel, type: language.channels[newChannel.type]})+`\n\n${language.changes}:`+changedKey.map(o => ` \`${o}\``));
					}
					send(logchannel, embed, language);
				}
			}
		}
	}
};
function send(logchannel, embed, language) {
	const client = logchannel.client;
	embed.fields.forEach((field) => {
		if (field.value.length > 1024 || embed.length > 6000) {
			const re1 = new RegExp(client.constants.switch.disable, 'g');
			const re2 = new RegExp(client.constants.switch.neutral, 'g');
			const re3 = new RegExp(client.constants.switch.enable, 'g');
			field.value = field.value
				.replace(re1, language.deny)
				.replace(re2, language.neutral)
				.replace(re3, language.allow);
		}
	});
	client.ch.send(logchannel, embed);
}