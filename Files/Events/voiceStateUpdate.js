const Discord = require('discord.js');

module.exports = {
	async execute(oldState, newState) {
		if (!oldState || !newState) return;
		const client = oldState ? oldState.client : newState.client;
		const ch = client.ch;
		const Constants = client.constants;
		const guild = oldState.guild;
		const language = await ch.languageSelector(guild);
		const lan = language.voiceUpdate;
		const con = Constants.voiceUpdate;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
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
					embed.addField(language.deaf, `${language.before}: \`${oldState.deaf}\`\n${language.after}: \`${newState.deaf}\``);
				} else if (oldState.selfDeaf == newState.selfDeaf && oldState.serverDeaf !== newState.serverDeaf) {
					changedKey.push(language.deaf);
					const entry = await getAudit(24);
					if (entry) {
						if (ch.getUnix(entry.id) > Date.now()-3000) embed.addField(language.deaf, ch.stp(lan.deafAudit, {oldState: oldState, newState: newState, user: entry.executor}));
						else embed.addField(language.deaf, ch.stp(lan.deaf, {oldState: oldState, newState: newState}));
					} else embed.addField(language.deaf, ch.stp(lan.deafNoAudit, {oldState: oldState, newState: newState}));
				}
				if (oldState.selfMute !== newState.selfMute && oldState.serverMute == newState.serverMute) {
					changedKey.push(language.mute);
					embed.addField(language.mute, ch.stp(lan.mute, {oldState: oldState, newState: newState}));
				} else if (oldState.selfMute == newState.selfMute && oldState.serverMute !== newState.serverMute) {
					changedKey.push(language.mute);
					const entry = await getAudit(24);
					if (entry) {
						if (ch.getUnix(entry.id) > Date.now()-3000) embed.addField(language.mute, ch.stp(lan.muteAudit, {oldState: oldState, newState: newState, user: entry.executor}));
						else embed.addField(language.mute, ch.stp(lan.mute, {oldState: oldState, newState: newState}));
					} else embed.addField(language.mute, ch.stp(lan.muteNoAudit, {oldState: oldState, newState: newState}));
				}
				if (oldState.selfVideo !== newState.selfVideo) {
					changedKey.push(language.camera);
					if (oldState.selfVideo) embed.addField('\u200b', lan.stopCamera);
					else if (newState.selfVideo) embed.addField('\u200b', lan.startCamera);
				}
				if (oldState.streaming !== newState.streaming) {
					changedKey.push(language.streaming);
					if (oldState.streaming) embed.addField('\u200b', lan.stopStream);
					else if (newState.streaming) embed.addField('\u200b', lan.startStream);
				}
				if (oldState.channel && newState.channel && (oldState.channel.type == 'stage' || newState.channel.type == 'stage')) {
					if (oldState.suppress !== newState.suppress) {
						changedKey.push(language.suppress);
						if (oldState.suppress) embed.addField('\u200b', ch.stp(lan.setSuppress, {newChannel: newState.channel}));
						else if (newState.suppress) embed.addField('\u200b', ch.stp(lan.unsetSuppress, {newChannel: newState.channel}));
					}
					if (oldState.requestToSpeakTimestamp !== newState.requestToSpeakTimestamp) {
						changedKey.push(language.requestToSpeak);
						if (oldState.requestToSpeakTimestamp) embed.addField('\u200b', lan.loweredHand);
						else if (newState.requestToSpeakTimestamp) embed.addField('\u200b', lan.raisedHand);
					}
				}
				if (oldState.channel !== newState.channel) {
					changedKey.push(language.channel);
					if (oldState.channel && newState.channel) {
						const entry = await getAudit(26);
						if (entry) {
							if (ch.getUnix(entry.id) > Date.now()-3000) embed.addField(language.moved, ch.stp(lan.movedAudit, {newType: language.channels[newState.channel.type], oldType: language.channels[oldState.channel.type], user: entry.executor, oldChannel: oldState.channel, newChannel: newState.channel}));
							else embed.addField(language.moved, ch.stp(lan.moved, {newType: language.channels[newState.channel.type], oldType: language.channels[oldState.channel.type], oldChannel: oldState.channel, newChannel: newState.channel}));
						} else embed.addField(language.moved, ch.stp(lan.movedNoAudit, {newType: language.channels[newState.channel.type], oldType: language.channels[oldState.channel.type], oldChannel: oldState.channel, newChannel: newState.channel}));
					} else if (oldState.channel) {
						const entry = await getAudit(27);
						embed.setColor(con.leaveColor);
						if (entry) {
							if (ch.getUnix(entry.id) > Date.now()-3000) embed.addField(language.disconnected, ch.stp(lan.disconnectedAudit, {oldType: language.channels[oldState.channel.type], user: entry.executor, oldChannel: oldState.channel}));
							else embed.addField(language.disconnected, ch.stp(lan.disconnected, {oldType: language.channels[oldState.channel.type], oldChannel: oldState.channel}));
						} else embed.addField(language.disconnected, ch.stp(lan.disconnected, {oldType: language.channels[oldState.channel.type], oldChannel: oldState.channel}));
					} else {
						embed.addField(language.connected, ch.stp(lan.connected, {newType: language.channels[newState.channel.type], newChannel: newState.channel}));
						embed.setColor(con.joinColor);
					}
				}
				if (changedKey.length < 1) return;
				embed.setDescription(ch.stp(lan.description, {user: newState ? newState.member.user : oldState.member.user}));
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