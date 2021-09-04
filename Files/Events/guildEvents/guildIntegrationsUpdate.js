const Discord = require('discord.js');

module.exports = {
	async execute(guild) {
		const client = guild.client;
		const ch = client.ch;
		const Constants = client.constants;
		const language = await ch.languageSelector(guild);
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.guildEvents);
			if (logchannel && logchannel.id) {
				const auditsCreate = await guild.fetchAuditLogs({limit: 3, type: 80});
				const auditsUpdate = await guild.fetchAuditLogs({limit: 3, type: 81});
				const auditsDelete = await guild.fetchAuditLogs({limit: 3, type: 82});
				let entryCreate;
				let entryUpdate;
				let entryDelete;
				if (auditsCreate && auditsCreate.entries) entryCreate = auditsCreate.entries.sort((a,b) => b.id - a.id);
				if (auditsUpdate && auditsUpdate.entries) entryUpdate = auditsUpdate.entries.sort((a,b) => b.id - a.id);
				if (auditsDelete && auditsDelete.entries) entryDelete = auditsDelete.entries.sort((a,b) => b.id - a.id);
				if (entryCreate && entryCreate.entries) entryCreate = entryCreate.first();
				if (entryUpdate && entryUpdate.entries) entryUpdate = entryUpdate.first();
				if (entryDelete && entryDelete.entries) entryDelete = entryDelete.first();
				if (entryCreate) entryCreate.timestamp = ch.getUnix(entryCreate.id);
				if (entryUpdate) entryUpdate.timestamp = ch.getUnix(entryUpdate.id);
				if (entryDelete) entryDelete.timestamp = ch.getUnix(entryDelete.id);
				let entry;
				let haveAmount = 0;
				entryCreate ? haveAmount++ : '';
				entryDelete ? haveAmount++ : '';
				entryUpdate ? haveAmount++ : '';
				if (haveAmount == 3) {
					if (entryCreate.timestamp > entryUpdate.timestamp) { 
						entry = entryCreate; 
					} else { 
						entry = entryUpdate; } 
					if (entryDelete.timestamp > entry) { 
						entry = entryDelete; 
					}
				} else if (haveAmount == 2) {
					if (entryCreate) {
						if (entryDelete) {
							if (entryCreate.timestamp > entryDelete.timestamp) { entry = entryCreate; } else {entry = entryDelete; }
						} else if (entryUpdate) {
							if (entryCreate.timestamp > entryUpdate.timestamp) { entry = entryCreate; } else {entry = entryUpdate; }
						}
					} else if (entryDelete) {
						if (entryUpdate) {
							if (entryDelete.timestamp > entryUpdate.timestamp) { entry = entryDelete; } else {entry = entryUpdate; }
						}
					}
				} else if (haveAmount == 1) {
					if (entryDelete) entry = entryDelete;
					if (entryCreate) entry = entryCreate;
					if (entryUpdate) entry = entryUpdate;
				} 
				const embed = new Discord.MessageEmbed()
					.setTimestamp();
				if (entry.actionType == 'DELETE') {
					let botBan = await guild.fetchAuditLogs({limit: 3, type: 20});
					botBan = botBan.entries.filter(e => e.target.bot == true && e.executor == entry.executor);
					let botKick = await guild.fetchAuditLogs({limit: 3, type: 22});
					botKick = botKick.entries.filter(e => e.target.bot == true && e.executor == entry.executor);
					botBan.first() ? botBan.first().timestamp = ch.getUnix(botBan.first().id) : botBan = undefined;
					botKick.first() ? botKick.first().timestamp = ch.getUnix(botKick.first().id) : botKick = undefined;
					!botBan ? botBan = undefined : botBan.first().timestamp > (+entry.timestamp - 1000) ? botBan = botBan.first() : botBan = undefined;
					!botKick ? botKick = undefined : botKick.first().timestamp > (+entry.timestamp - 1000) ? botKick = botKick.first() : botKick = undefined;
					let finalEntry;
					if (botBan && botKick) {
						if (botBan.timestamp > botKick.timestamp) {
							finalEntry = botBan;
						} else {
							finalEntry = botKick;
						}
					} else if (botBan || botKick) {
						if (botBan) finalEntry = botBan;
						if (botKick) finalEntry = botKick;
					} else {
						finalEntry = null;
					}
					const con = Constants.guildIntegrationsRemove;
					const lan = language.guildIntegrationsRemove;
					if (finalEntry !== null) {
						embed.setDescription(ch.stp(lan.description.withAudit, {user: entry.executor, integration: entry.target, bot: finalEntry.target}));
					} else {
						embed.setDescription(ch.stp(lan.description.withoutAudit, {user: entry.executor, integration: entry.target}));
					}
					embed.setAuthor(lan.author.title, con.author.image);
					embed.setColor(con.color);
					if (entry.name) embed.addField(language.name, entry.name);
					if (entry.type) embed.addField(language.type, entry.type);
					if (entry.enabled !== undefined) embed.addField(language.enabled, entry.enabled);
					if (entry.syncing !== undefined) embed.addField(language.syncing, entry.syncing);
					if (entry.user) embed.addField(language.user, entry.user);
					if (entry.account) embed.addField(language.account, entry.account.name);
					if (entry.application) embed.addField(language.application, `**${entry.application.name}**\n${entry.application.description}`);
					if (entry.expireBehavior) embed.addField(language.expireBehavior.name, entry.expireBehavior == 0 ? ch.stp(language.expireBehavior.zero, {role: entry.role}) : language.expireBehavior.one, entry.expireBehavior);
					if (entry.expireGracePeriod) embed.addField(language.expireGracePeriod, entry.expireGracePeriod);
					if (entry.subscriber_count) embed.addField(language.subscribers, entry.subscriber_count);
				}
				if (entry.actionType == 'CREATE') {
					const con = Constants.guildIntegrationsCreate;
					const lan = language.guildIntegrationsCreate;
					embed.setDescription(ch.stp(lan.description.withUser, {user: entry.executor, integration: entry.target}));
					embed.setAuthor(lan.author.title, con.author.image);
					embed.setColor(con.color);
					if (entry.name) embed.addField(language.name, entry.name);
					if (entry.type) embed.addField(language.type, entry.type);
					if (entry.enabled !== undefined) embed.addField(language.enabled, entry.enabled);
					if (entry.syncing !== undefined) embed.addField(language.syncing, entry.syncing);
					if (entry.user) embed.addField(language.user, entry.user);
					if (entry.account) embed.addField(language.account, entry.account.name);
					if (entry.application) embed.addField(language.application, `**${entry.application.name}**\n${entry.application.description}`);
					if (entry.expireBehavior) embed.addField(language.expireBehavior.name, entry.expireBehavior == 0 ? ch.stp(language.expireBehavior.zero, {role: entry.role}) : language.expireBehavior.one, entry.expireBehavior);
					if (entry.expireGracePeriod) embed.addField(language.expireGracePeriod, entry.expireGracePeriod+' '+language.time.minutes);
					if (entry.subscriber_count) embed.addField(language.subscribers, entry.subscriber_count);
					ch.logger('Integration Update Check console at '+ new Date().toUTCString());
				}
				if (entry.actionType == 'UPDATE') {
					const con = Constants.guildIntegrationsUpdate;
					const lan = language.guildIntegrationsUpdate;
					embed.setDescription(ch.stp(lan.description.withUser, {user: entry.executor, integration: entry.target}));
					embed.setAuthor(lan.author.title, con.author.image);
					embed.setColor(con.color);
					for (const change of entry.changes) {
						if (change.key == 'type') embed.addField(language.type, `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`);
						else if (change.key == 'enabled') embed.addField(language.enabled, `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`);
						else if (change.key == 'syncing') embed.addField(language.syncing, `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`);
						else if (change.key == 'role_id') embed.addField(language.role, `**${language.before}:**\n${guild.roles.cache.get(change.old) ? guild.roles.cache.get(change.old) : ''}\n\n**${language.after}:**\n${change.new} ${guild.roles.cache.get(change.new) ? guild.roles.cache.get(change.new) : ''}`);
						else if (change.key == 'enable_emoticons') embed.addField(language.enlableEmotes, `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`);
						else if (change.key == 'user') embed.addField(language.user, `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`);
						else if (change.key == 'expire_behavior') embed.addField(language.expireBehavior, `**${language.before}:**\n${change.old == 0 ? ch.stp(language.expireBehavior.zero, {role: entry.role}) : language.expireBehavior.one}\n\n**${language.after}:**\n${change.new == 0 ? ch.stp(language.expireBehavior.zero, {role: entry.role}) : language.expireBehavior.one}`);
						else if (change.key == 'account') embed.addField(language.account, `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`);
						else if (change.key == 'synced_at') embed.addField(language.syncedAt, `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`);
						else if (change.key == 'subscriber_count') embed.addField(language.subscribers, `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`);
						else if (change.key == 'revoked') embed.addField(language.revoked, `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`);
						else if (change.key == 'application') embed.addField(language.application, `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`);
						else if (change.key == 'name') embed.addField(language.name, `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`);
						else embed.addField(language.unknown, `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`);
					}
					ch.logger('Integration Update Check console at '+ new Date().toUTCString());
				}
				ch.send(logchannel, embed);
			}
		}
	}
};