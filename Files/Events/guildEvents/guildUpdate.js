const Discord = require('discord.js');


/* eslint-disable no-case-declarations */
module.exports = {
	async execute(oldGuild, newGuild) {
		const client = oldGuild ? oldGuild.client : newGuild.client;
		const ch = client.ch;
		const Constants = client.constants;
		const language = await ch.languageSelector(newGuild);
		const lan = language.guildUpdate;
		const con = Constants.guildUpdate;
		const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [newGuild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			const logchannel = client.channels.cache.get(r.channelEvents);
			if (logchannel && logchannel.id) {
				const embed = new Discord.MessageEmbed()
					.setAuthor(lan.author.name, con.author.image)
					.setTimestamp()
					.setColor(con.color);
				let entry;
				oldGuild.change = [];
				if (oldGuild.available == false && newGuild.available == true) {
					oldGuild.change.push('available');
					ch.query(`UPDATE antispamsettings SET forceDisabled = false WHERE guildid = '${newGuild.id}';`);
					embed.setDescription(lan.antispam);
				} else if (oldGuild.available == true && newGuild.available == false) {
					ch.query(`UPDATE antispamsettings SET forceDisabled = true WHERE guildid = '${newGuild.id}';`);
					return;
				}
				if (oldGuild.name !== newGuild.name) {
					oldGuild.change.push('name');
					entry = await getAudits(newGuild);
					embed.addField(language.name, `${language.before}: \`${oldGuild.name}\`\n${language.after}: \`${newGuild.name}\``);
				}
				let path;
				if (oldGuild.icon !== newGuild.icon) {
					oldGuild.change.push('icon');
					entry = await getAudits(newGuild);
					oldGuild.wanted = 'icon';
					newGuild.wanted = 'icon';
					const oldPath = await ch.downloader(oldGuild, ch.iconURL(oldGuild));
					if (oldPath) {
						path = oldPath;
						const name = await ch.getName(oldPath);
						embed.setImage(`attachment://${name}`);
						embed.addField('\u200b', lan.IconOld);
					}
				}
				if (oldGuild.splash !== newGuild.splash) {
					oldGuild.change.push('splash');
					entry = await getAudits(newGuild);
					oldGuild.wanted = 'splash';
					newGuild.wanted = 'splash';
					const oldPath = await ch.downloader(oldGuild, ch.splashURL(oldGuild));
					if (oldPath) {
						path = oldPath;
						const name = await ch.getName(oldPath);
						embed.setImage(`attachment://${name}`);
						embed.addField('\u200b', lan.splashOld);
					}
				}
				if (oldGuild.discoverySplash !== newGuild.discoverySplash) {
					oldGuild.change.push('discoverySplash');
					entry = await getAudits(newGuild);
					oldGuild.wanted = 'discoverySplash';
					newGuild.wanted = 'discoverySplash';
					const oldPath = await ch.downloader(oldGuild, ch.discoverySplashURL(oldGuild));
					if (oldPath) {
						path = oldPath;
						const name = await ch.getName(oldPath);
						embed.setImage(`attachment://${name}`);
						embed.addField('\u200b', lan.discoverySplashOld);
					}
				}
				if (oldGuild.banner !== newGuild.banner) {
					oldGuild.change.push('banner');
					entry = await getAudits(newGuild);
					oldGuild.wanted = 'banner';
					newGuild.wanted = 'banner';
					const oldPath = await ch.downloader(oldGuild, ch.bannerURL(oldGuild));
					if (oldPath) {
						path = oldPath;
						const name = await ch.getName(oldPath);
						embed.setImage(`attachment://${name}`);
						embed.addField('\u200b', lan.bannerOld);
					}
				}
				if (oldGuild.region !== newGuild.region) {
					oldGuild.change.push('region');
					entry = await getAudits(newGuild);
					embed.addField(language.rtc_region, `${language.before}: \`${oldGuild.region}\`\n${language.after}: \`${newGuild.region}\``);
				}
				if (oldGuild.features !== newGuild.features) {
					entry = await getAudits(newGuild);
					const uniques = ch.getDifference(oldGuild.features, newGuild.features);
					if (uniques.length > 0) {
						embed.addField(language.enabled, `${uniques.map(f => `${language.features[f]}\n`)}`);
						oldGuild.change.push('featuresName');
					}
				}
				if (oldGuild.afkTimeout !== newGuild.afkTimeout) {
					oldGuild.change.push('afkTimeout');
					entry = await getAudits(newGuild);
					embed.addField(language.afkTimeout, `${language.before}: \`${oldGuild.afkTimeout / 60} ${language.time.minutes}\`\n${language.after}: \`${newGuild.afkTimeout / 60} ${language.time.minutes}\``);
				}
				if (oldGuild.afkChannelID !== newGuild.afkChannelID) {
					oldGuild.change.push('afkChannelID');
					entry = await getAudits(newGuild);
					embed.addField(language.afkChannelID, `${language.before}: ${oldGuild.afkChannelID ? `<#${oldGuild.afkChannelID}>` : language.none}\n${language.after}: ${newGuild.afkChannelID ? `<#${newGuild.afkChannelID}>` : language.none}`);
				}
				if (oldGuild.systemChannelID !== newGuild.systemChannelID) {
					oldGuild.change.push('systemChannelID');
					entry = await getAudits(newGuild);
					embed.addField(language.systemChannelID, `${language.before}: ${oldGuild.systemChannelID ? `<#${oldGuild.systemChannelID}>` : language.none}\n${language.after}: ${newGuild.systemChannelID ? `<#${newGuild.systemChannelID}>` : language.none}`);
				}
				if (oldGuild.embedEnabled == true && newGuild.embedEnabled == false || oldGuild.embedEnabled == false && newGuild.embedEnabled == true) {
					oldGuild.change.push('embedEnabled');
					entry = await getAudits(newGuild);
					embed.addField(language.embedEnabled, `${language.before}: \`${oldGuild.embedEnabled ? language.enabled : language.disabled}\`\n${language.after}: \`${newGuild.embedEnabled ? language.enabled : language.disabled}\``);
				}
				if (oldGuild.premiumSubscriptionCount !== newGuild.premiumSubscriptionCount) {
					oldGuild.change.push('premiumSubscriptionCount');
					if (oldGuild.premiumTier > newGuild.premiumTier) embed.setDescription(ch.stp(lan.BoostRemove, {boosters: newGuild.premiumSubscriptionCount, tier: newGuild.premiumTier}));
					else embed.setDescription(ch.stp(lan.BoostAdd, {boosters: newGuild.premiumSubscriptionCount, tier: newGuild.premiumTier}));
				}
				if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
					oldGuild.change.push('verificationLevelName');
					entry = await getAudits(newGuild);
					embed.addField(language.verificationLevel.verificationLevel, `${language.before}: ${language.verificationLevel[oldGuild.verificationLevel]}\n${language.after}: ${language.verificationLevel[newGuild.verificationLevel]}`);
				}
				if (oldGuild.explicitContentFilter !== newGuild.explicitContentFilter) {
					oldGuild.change.push('explicitContentFilterName');
					entry = await getAudits(newGuild);
					embed.addField(language.explicitContentFilter.explicitContentFilter, `${language.before}: ${language.explicitContentFilter[oldGuild.explicitContentFilter]}\n${language.after}: ${language.explicitContentFilter[newGuild.explicitContentFilter]}`);
				}
				if (oldGuild.mfaLevel !== newGuild.mfaLevel) {
					oldGuild.change.push('mfaLevelName');
					entry = await getAudits(newGuild);
					embed.addField(language.mfaLevel.mfaLevel, `${language.before}: ${language.mfaLevel[oldGuild.mfaLevel]}\n${language.after}: ${language.mfaLevel[newGuild.mfaLevel]}`);
				}
				if (oldGuild.defaultMessageNotifications !== newGuild.defaultMessageNotifications) {
					oldGuild.change.push('defaultMessageNotificationsName');
					entry = await getAudits(newGuild);
					embed.addField(language.defaultMessageNotificationsName, `${language.before}: ${language.defaultMessageNotifications[oldGuild.defaultMessageNotifications]}\n${language.after}: ${language.defaultMessageNotifications[newGuild.defaultMessageNotifications]}`);
				}
				if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
					oldGuild.change.push('vanityURLCode');
					entry = await getAudits(newGuild);
					embed.addField(language.vanityURLCode, `${language.before}: \`${oldGuild.vanityURLCode ? oldGuild.vanityURLCode : language.none}\`\n${language.after}: \`${newGuild.vanityURLCode ? newGuild.vanityURLCode : language.none}\``);
				}
				if (oldGuild.description !== newGuild.description) {
					oldGuild.change.push('description');
					entry = await getAudits(newGuild);
					embed.addField(language.description, `${language.before}: \`${oldGuild.description ? oldGuild.description : language.none}\`\n${language.after}: \`${newGuild.description ? newGuild.description : language.none}\``);
				}
				if (oldGuild.rulesChannelID !== newGuild.rulesChannelID) {
					oldGuild.change.push('rulesChannelID');
					entry = await getAudits(newGuild);
					embed.addField(language.rulesChannelID, `${language.before}: ${oldGuild.rulesChannelID ? `<#${oldGuild.rulesChannelID}>` : language.none}\n${language.after}: ${newGuild.rulesChannelID ? `<#${newGuild.rulesChannelID}>` : language.none}`);
				}
				if (oldGuild.publicUpdatesChannelID !== newGuild.publicUpdatesChannelID) {
					oldGuild.change.push('publicUpdatesChannelID');
					entry = await getAudits(newGuild);
					embed.addField(language.publicUpdatesChannelID, `${language.before}: ${oldGuild.publicUpdatesChannelID ? `<#${oldGuild.publicUpdatesChannelID}>` : language.none}\n${language.after}: ${newGuild.publicUpdatesChannelID ? `<#${newGuild.publicUpdatesChannelID}>` : language.none}`);
				}
				if (oldGuild.preferredLocale !== newGuild.preferredLocale) {
					oldGuild.change.push('preferredLocale');
					entry = await getAudits(newGuild);
					embed.addField(language.preferredLocale, `${language.before}: \`${oldGuild.preferredLocale}\`\n${language.after}: \`${newGuild.preferredLocale}\``);
				}
				if (oldGuild.nsfw !== newGuild.nsfw) {
					oldGuild.change.push('nsfw');
					entry = await getAudits(newGuild);
					embed.addField(language.nsfw, `${language.before}: \`${oldGuild.nsfw}\`\n${language.after}: \`${newGuild.nsfw}\``);
				}
				if (oldGuild.ownerID !== newGuild.ownerID) {
					embed.setDescription(ch.stp(lan.ownerSwitch, {user: await client.users.fetch(oldGuild.ownerID), target: await client.users.fetch(newGuild.ownerID)}));
				}
				if (oldGuild.change) {
					if (!embed.description) {
						if (entry) {
							let text = oldGuild.change.map(change => ` \`${language[change]}\``);
							embed.setDescription(ch.stp(lan.standardWithAudit, {user: entry.executor})+text);
						}
						else {
							let text = oldGuild.change.map(change => ` \`${language[change]}\``);
							embed.setDescription(ch.stp(lan.standardWithoutAudit, {change: text}));
						}
					}
				}
				if (embed.description) {
					if (path) ch.send(logchannel, {embeds: [embed], files: [path]});
					else ch.send(logchannel, {embeds: [embed]});
				}
			}
		}
	}
};				

async function getAudits(guild) {
	const audits = await guild.fetchAuditLogs({limit: 5, type: 1}).catch(() => {});
	let entry;
	if (audits && audits.entries) {
		entry = audits.entries.sort((a,b) => b.id - a.id);
		entry = entry.first();
	}
	if (entry && entry.id) return entry;
	else return null;
}