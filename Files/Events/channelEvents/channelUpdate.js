/* eslint-disable no-prototype-builtins */
const { client } = require('../../BaseClient/DiscordClient');
const ch = require('../../BaseClient/ClientHelper'); 
const Constants = require('../../Constants.json');
const Discord = require('discord.js');
const escape = require('markdown-escape');

module.exports = {
	async execute(channel, oldChannel) {
		if (channel.type === 1 || channel.type === 3) return;
		if (channel.position !== oldChannel.position) return;
		const guild = channel.guild;
		const res = await ch.query(`SELECT * FROM logchannels WHERE guildid = '${guild.id}'`);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.channelEvents);
			if (logchannel && logchannel.id) {
				const language = await ch.languageSelector(guild);
				const lan = language.channelUpdate;
				const con = Constants.channelUpdate;
				const embed = new Discord.MessageEmbed()
					.setAuthor(ch.stp(lan.author.title, {type: `${language.channelsNrSorted[channel.type]}`}), con.author.image, ch.stp(con.author.link, {channel: channel}))
					.setColor(con.color)
					.setTimestamp();
				let channelOverwrites = channel.permissionOverwrites.map(o => o);
				let oldOverwrites = oldChannel.permissionOverwrites.map(o => o);
				let uniques = ch.getDifference(channelOverwrites, oldOverwrites);
				if (oldOverwrites.length > channelOverwrites.length) {
					uniques = ch.getDifference(oldOverwrites, channelOverwrites);
				}
				let auditLogId;
				if (channelOverwrites.length > oldOverwrites.length) {
					auditLogId = 13;
					channelOverwrites = channelOverwrites.filter(val => !uniques.includes(val));
				} else if (oldOverwrites.length > channelOverwrites.length) {
					auditLogId = 15;
					oldOverwrites = oldOverwrites.filter(val => !uniques.includes(val));
				} else if (channel.topic !== oldChannel.topic || channel.nsfw !== oldChannel.nsfw || channel.name !== oldChannel.name || channel.rateLimitPerUser !== oldChannel.rateLimitPerUser || channel.rtcRegion !== oldChannel.rtcRegion || channel.videoQualityMode !== oldChannel.videoQualityMode || channel.userLimit !== oldChannel.userLimit) {
					auditLogId = 11;
				} else auditLogId = 14;

				let logs = await channel.guild.getAuditLogs(3, null, auditLogId).catch(() => {});
				if (!logs) return;
				const log = logs.entries.find(e => e.targetID === channel.id);
				if (!log) return; 
				const user = log?.user;
				if (auditLogId === 11) {
					const toIter = Object.keys(log.before).length >= Object.keys(log.after).length ? log.before : log.after;
					for (const changedKey in toIter) {
						if (changedKey === 'topic') {
							let newTopic = language.none;
							let oldTopic = language.none;
							if (channel.topic !== null && channel.topic.trim()) {
								newTopic = escape(channel.topic.replace(/~/g, '\\~'), ['angle brackets']);
							}
							if (oldChannel.topic !== null && oldChannel.topic.trim()) {
								oldTopic = escape(oldChannel.topic.replace(/~/g, '\\~'), ['angle brackets']);
							}
							if (newTopic === oldTopic) {
								embed.addField(language.topic, language.none);
							} else {
								embed.addField(language.topic, `${language.before}: \`${oldTopic}\`\n${language.after}: \`${newTopic}\``);
							}
							continue;
						}
						const changes = ch.transformAuditLogEntry(changedKey, log.before[changedKey], log.after[changedKey], language);
						embed.addField(ch.toTitleCase(changes.name), `${language.before}: \`${changes.before}\`\n${language.after}: \`${changes.after}\``);
					}
				} else {
					if (Object.keys(log.after).length !== 0 && Object.keys(log.before).length === 0) {
						embed.addField(language.permissions.grantedPermissionFor, `${log.after.type === 0 ? language.role+` ${channel.guild.roles.get(log.after.id).mention}` : language.member+` <@${log.after.id}>`}`);
					} else if (Object.keys(log.before).length !== 0 && Object.keys(log.after).length === 0) {
						if (log.after && log.after.id) embed.addField(language.permissions.deletedPermissionFor, `${log.after.type === 0 ? language.role+` ${channel.guild.roles.get(log.after.id).mention}` : language.member+` <@${log.after.id}>`}`);
						if (log.before && log.before.id) embed.addField(language.permissions.deletedPermissionFor, `${log.before.type === 0 ? language.role+` ${channel.guild.roles.get(log.before.id).mention}` : language.member+` <@${log.before.id}>`}`);
					} else {
						channelOverwrites.forEach(newOverwrite => {
							const oldOverwrite = oldOverwrites.find(ow => ow.id === newOverwrite.id);
							if (!newOverwrite || !oldOverwrite) return;
							const newPerms = Object.keys(newOverwrite.json);
							const oldPerms = Object.keys(oldOverwrite.json);
							const differentPerms = (newPerms.length >= oldPerms.length ? newPerms.concat(ch.getDifference(newPerms, oldPerms)) : oldPerms.concat(oldPerms, newPerms)).filter((v, i, self) => self.indexOf(v) === i);
							if (channel.permissionOverwrites.map(o => `${o.allow}|${o.deny}`).toString() === oldChannel.permissionOverwrites.map(o => `${o.allow}|${o.deny}`).toString()) return;
							let overwriteName = newOverwrite.type == 'role' ? language.role : newOverwrite.type == 'member' ? language.member : language.unknown+' ';
							let value = '';
							if (newOverwrite.type === 'member') {
								value += `<@${newOverwrite.id}>`;
							} else if (newOverwrite.type === 'role') {
								const role = channel.guild.roles.find(r => r.id === newOverwrite.id);
								if (!role) return;
								value += role.mention;
							} else {
								value += language.unknown;
							}
							differentPerms.forEach(perm => { // source of this function: https://github.com/curtisf/logger
								if (newOverwrite.json.hasOwnProperty(perm) && oldOverwrite.json.hasOwnProperty(perm)) {
									if (newOverwrite.json[perm] === true && oldOverwrite.json[perm] === false) {
										value += `\n${Constants.switch.enable}\` ${ch.eris2Lan(perm, language)}\``;
									} else if (newOverwrite.json[perm] === false && oldOverwrite.json[perm] === true) {
										value += `\n${Constants.switch.disable}\` ${ch.eris2Lan(perm, language)}\``;
									}
								} else if (newOverwrite.json.hasOwnProperty(perm) && !oldOverwrite.json.hasOwnProperty(perm)) {
									if (newOverwrite.json[perm]) {
										value += `\n${Constants.switch.enable}\` ${ch.eris2Lan(perm, language)}\``;
									} else {
										value += `\n${Constants.switch.disable}\` ${ch.eris2Lan(perm, language)}\``;
									}
								} else if (!newOverwrite.json.hasOwnProperty(perm) && oldOverwrite.json.hasOwnProperty(perm)) {
									value += `\n${Constants.switch.neutral}\` ${ch.eris2Lan(perm, language)}\``;
								}
							});
							if (value) {
								if (value.includes('\n')) {
									embed.addField(overwriteName, value);
								}
							}
						});
					}
				}
				if (log && user) {
					if (channel.type === 13) {
						embed.addField('\u200b', language.channels.GUILD_STAGE_VOICE+' '+channel+' '+channel.topic === null ? language.closed : language.opened);
					}
					embed.setDescription(ch.stp(lan.description.withAudit, {user: log.user, channel: channel, type: language.channelsNrSorted[channel.type]}));
					send(logchannel, embed, language);
				} else {
					embed.setDescription(ch.stp(lan.description.withoutAudit, {channel: channel, type: language.channelsNrSorted[channel.type]}));
					send(logchannel, embed, language);
				}
			}
		}
	}
};

function send(logchannel, embed, language) {
	embed.fields.forEach((field) => {
		if (field.value.length > 1024) {
			const re1 = new RegExp(Constants.switch.disabledOff, 'g');
			const re2 = new RegExp(Constants.switch.disabledOn, 'g');
			const re3 = new RegExp(Constants.switch.neutralOff, 'g');
			const re4 = new RegExp(Constants.switch.neutralOn, 'g');
			const re5 = new RegExp(Constants.switch.enabledOff, 'g');
			const re6 = new RegExp(Constants.switch.enabledOn, 'g');
			field.value = field.value
				.replace(re1, '')
				.replace(re2, language.deny)
				.replace(re3, '')
				.replace(re4, language.neutral)
				.replace(re5, '')
				.replace(re6, language.allow);
		}
	});
	ch.send(logchannel, embed);
}