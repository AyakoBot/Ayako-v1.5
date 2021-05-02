const { client } = require('../../BaseClient/DiscordClient');
const ch = require('../../BaseClient/ClientHelper'); 
const Constants = require('../../Constants.json');
const Discord = require('discord.js');

module.exports = {
	async execute(oldState, newState) {
		const guild = oldState.guild;
		const language = await ch.languageSelector(guild);
		const lan = language.voiceUpdate;
		const con = Constants.voiceUpdate;
		const res = await ch.query(`SELECT * FROM logchannels WHERE guildid = '${guild.id}'`);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.roleEvents);
			if (logchannel && logchannel.id) {
				const embed  = new Discord.MessageEmbed()
					.setTimestamp()
					.setColor(con.color)
					.setAuthor(lan.author.name, con.author.image);
				const changedKey = [];
				if (oldState.selfDeaf !== newState.selfDeaf && oldState.serverDeaf == newState.serverDeaf) {
					changedKey.push(language.deaf);
					embed.setDescription(ch.stp(lan.updated, {user: newState.member.user}));
					embed.addField(language.deaf, `${language.before}: \`${oldState.deaf}\`\n${language.after}: \`${newState.deaf}\``);
				} else if (oldState.selfDeaf == newState.selfDeaf && oldState.serverDeaf !== newState.serverDeaf) {
					changedKey.push(language.deaf);
					const entry = await getAudit(24);
					if (entry) {
						if (ch.getUnix(entry.id) > Date.now()-3000) embed.setDescription(ch.stp(lan.wasDeafenedWithAudit, {executor: entry.executor, target: entry.target}));
						else embed.setDescription(ch.stp(lan.wasDeafenedWithoutAudit, {target: newState.member.user}));
					} else embed.setDescription(ch.stp(lan.wasDeafenedWithoutAudit, {target: newState.member.user}));
					embed.addField(language.deaf, `${language.before}: \`${oldState.deaf}\`\n${language.after}: \`${newState.deaf}\``);
				}
				if (oldState.selfMute !== newState.selfMute && oldState.serverMute == newState.serverMute) {
					changedKey.push(language.mute);
					embed.setDescription(ch.stp(lan.updated, {user: newState.member.user}));
					embed.addField(language.mute, `${language.before}: \`${oldState.mute}\`\n${language.after}: \`${newState.mute}\``);
				} else if (oldState.selfMute == newState.selfMute && oldState.serverMute !== newState.serverMute) {
					changedKey.push(language.mute);
					const entry = await getAudit(24);
					if (entry) {
						if (ch.getUnix(entry.id) > Date.now()-3000) embed.setDescription(ch.stp(lan.wasMutedWithAudit, {executor: entry.executor, target: entry.target}));
						else embed.setDescription(ch.stp(lan.wasMutedWithoutAudit, {target: newState.member.user}));
					} else embed.setDescription(ch.stp(lan.wasMutedWithoutAudit, {target: newState.member.user}));
					embed.addField(language.mute, `${language.before}: \`${oldState.mute}\`\n${language.after}: \`${newState.mute}\``);
				}
				if (oldState.selfVideo !== newState.selfVideo) {
					changedKey.push(language.camera);
					if (oldState.selfVideo) embed.addField('\u200b', ch.stp(lan.stopCamera, {user: newState.member.user}));
					else if (newState.selfVideo) embed.addField('\u200b', ch.stp(lan.startCamera, {user: newState.member.user}));
				}
				if (oldState.streaming !== newState.streaming) {
					changedKey.push(language.streaming);
					if (oldState.streaming) embed.addField('\u200b', ch.stp(lan.stopStream, {user: newState.member.user}));
					else if (newState.streaming) embed.addField('\u200b', ch.stp(lan.startStream, {user: newState.member.user}));
				}
				if (oldState.suppress !== newState.suppress) {
					changedKey.push(language.suppress);
					if (oldState.suppress) embed.addField('\u200b', ch.stp(lan.setSuppress, {user: newState.member.user, newChannel: newState.channel}));
					else if (newState.suppress) embed.addField('\u200b', ch.stp(lan.unsetSuppress, {user: newState.member.user, newChannel: newState.channel}));
				}
				if (oldState.requestToSpeakTimestamp !== newState.requestToSpeakTimestamp) {
					changedKey.push(language.requestToSpeak);
					if (oldState.requestToSpeakTimestamp) embed.addField('\u200b', ch.stp(lan.loweredHand, {user: newState.member.user}));
					else if (newState.requestToSpeakTimestamp) embed.addField('\u200b', ch.stp(lan.raisedHand, {user: newState.member.user}));
				}
				if (oldState.channel !== newState.channel) {
					changedKey.push(language.channel);
					if (oldState.channel && newState.channel) {
						const entry = await getAudit(26);
						if (entry) {
							if (ch.getUnix(entry.id) > Date.now()-3000) embed.setDescription(ch.stp(lan.wasMoved, {newType: language.channels[newState.channel.type], oldType: language.channels[oldState.channel.type], user: entry.executor, target: newState.member.user, oldChannel: oldState.channel, newChannel: newState.channel}));
							else embed.setDescription(ch.stp(lan.moved, {newType: language.channels[newState.channel.type], oldType: language.channels[oldState.channel.type], user: newState.member.user, oldChannel: oldState.channel, newChannel: newState.channel}));
						} else embed.setDescription(ch.stp(lan.moved, {newType: language.channels[newState.channel.type], oldType: language.channels[oldState.channel.type], user: newState.member.user, oldChannel: oldState.channel, newChannel: newState.channel}));
					} else if (oldState.channel) {
						const entry = await getAudit(27);
						embed.setColor(con.leaveColor);
						if (entry) {
							if (ch.getUnix(entry.id) > Date.now()-3000) embed.setDescription(ch.stp(lan.wasDisconnected, {type: language.channels[oldState.channel.type], user: entry.executor, target: newState.member.user, oldChannel: oldState.channel}));
							else embed.setDescription(ch.stp(lan.disconnected, {type: language.channels[oldState.channel.type], user: newState.member.user, oldChannel: oldState.channel}));
						} else embed.setDescription(ch.stp(lan.disconnected, {type: language.channels[oldState.channel.type], user: newState.member.user, oldChannel: oldState.channel}));
					} else {
						embed.setDescription(ch.stp(lan.connected, {type: language.channels[newState.channel.type], user: newState.member.user, newChannel: newState.channel}));
						embed.setColor(con.joinColor);
					}
				}
				if (changedKey.length < 1) return;
				embed.description = embed.description ? embed.description+'\n\n'+language.changes+': '+changedKey.map(o => ` \`${o}\``) : language.changes+': '+changedKey.map(o => ` \`${o}\``);
				if (embed.description) ch.send(logchannel, embed);
			}
		}
		async function getAudit(type) {
			const audits = await guild.fetchAuditLogs({limit: 3, type: type});
			let entry;
			if (audits && audits.entries) {
				const audit = audits.entries.filter((a) => a.target ? a.target.id == newState.member.user.id : a.extra.channel ? a.extra.channel.id : '' == newState.channel ? newState.channel.id : oldState.channel.id);
				entry = audit.sort((a,b) => b ? b.id : '' - a ? a.id : '');
				entry = entry.first();
			}
			return entry;
		}
	}
};