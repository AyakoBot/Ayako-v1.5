const urlCheck = require('valid-url');
const SA = require('superagent');
const request = require('request');
const fs = require('fs');
const Discord = require('discord.js');
const blocklist = require('../../../blocklist.json');
const auth = require('../../../BaseClient/auth.json');
const client = require('../../../BaseClient/DiscordClient');

module.exports = {
	async execute(msg) {
		let check = false;
		if (!msg.content || msg.author.id === msg.client.user.id) return;
		if (msg.channel.type === 'DM') check = true;
		// eslint-disable-next-line no-param-reassign
		msg.language = await msg.client.ch.languageSelector(check ? null : msg.guild);
		const lan = check ? msg.language.antivirus.dm : msg.language.antivirus.guild;
		if (check) {
			run(msg, check, lan);
			return;
		}
		const res = await msg.client.ch.query('SELECT * FROM antivirus WHERE guildid = $1;', [msg.guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			if (r.active !== true) return;
			run(msg, check, lan, r);
		}
	},
};

async function run(msg, check, lan) {
	const { content } = msg;
	const args = content.replace(/\\n/g, ' ').replace(/^https:\/\//g, ' https://').replace(/^http:\/\//, ' http://').split(/ +/);
	const links = [];
	args.forEach((arg) => {
		if (urlCheck.isUri(arg)) links.push(arg);
	});

	const blacklist = [...new Set(blocklist)];
	blacklist.forEach((entry, index) => {
		blacklist[index] = entry.replace(/#{2}-{1}/g, '');
		if (blacklist[index].startsWith('#')) blacklist.splice(index, 1);
	});

	let whitelistRes = await SA.get('https://ayakobot.com/cdn/whitelisted.txt').catch(() => { });
	whitelistRes = whitelistRes ? whitelistRes.text.split(/\n+/) : [];
	whitelistRes.forEach((entry, index) => {
		whitelistRes[index] = entry.replace(/\r/g, '');
	});
	let blacklistRes = await SA.get('https://ayakobot.com/cdn/blacklisted.txt').catch(() => { });
	blacklistRes = blacklistRes ? blacklistRes.text.split(/\n+/) : [];
	blacklistRes.forEach((entry, index) => blacklistRes[index] = entry.replace(/\r/g, ''));
	let whitelistCDNRes = await SA.get('https://ayakobot.com/cdn/whitelistedCDN.txt').catch(() => { });
	whitelistCDNRes = whitelistCDNRes ? whitelistCDNRes.text.split(/\n+/) : [];
	whitelistCDNRes.forEach((entry, index) => whitelistCDNRes[index] = entry.replace(/\r/g, ''));

	let FullLinks = new Array();
	for (let i = 0; i < links.length; i++) {
		const url = new URL(links[i]);
		const res = await new Promise((resolve) => {
			request(
				{ method: 'HEAD', url, followAllRedirects: true },
				(_, response) => {
					if (response && response.request && response.request.href) resolve([response.request.href, response.headers['content-type']]);
					else resolve([null]);
				},
			);
		});
		if (res[0] !== null) {
			if (res[1].includes('audio') || res[1].includes('video') || res[1].includes('image')) FullLinks.push(`CheckThis-${res[0]}`);
			else FullLinks.push(res[0]);
		} else FullLinks.push(url.href);
	}

	FullLinks.forEach((link, i) => {
		if (!link.startsWith('CheckThis-')) {
			const urlParts = new URL(link).hostname.split('.');
			const newUrl = `${new URL(link).protocol}//${urlParts
				.slice(0)
				.slice(-(urlParts.length == 4 ? 3 : 2))
				.join('.')}`;
			if (!FullLinks.includes(newUrl)) FullLinks.push(newUrl);
		} else FullLinks[i] = link;
	});

	FullLinks.forEach((link, i) => {
		if (link.hostname) FullLinks[i] = `${link.protocol}//${link.hostname}`;
		if (FullLinks[i].endsWith('/')) FullLinks[i] = FullLinks[i].slice(0, -1);
	});
	FullLinks = [...new Set(FullLinks)];

	let included = false;
	FullLinks.forEach(async (url) => {
		const embed = new Discord.MessageEmbed();
		if (!url.hostname) url = new URL(url);
		if (url.hostname) {
			let enteredWebsite; let
				baseWebsite;
			const checkthis = !!url.protocol.includes('checkthis-');
			if (checkthis) url = new URL(url.href.replace('checkthis-', ''));
			enteredWebsite = await SA.head(url.href).catch((e) => enteredWebsite = e);
			baseWebsite = await SA.head(url.hostname).catch((e) => baseWebsite = e);
			if ((!enteredWebsite || enteredWebsite.text == 'Domain not found') && (!baseWebsite || baseWebsite.text == 'Domain not found') || (`${enteredWebsite}`.includes('ENOTFOUND') || `${baseWebsite}`.includes('ENOTFOUND'))) {
				return end({
					msg, text: 'NOT_EXISTENT', res: null, severity: null, link: url,
				}, check, embed, null, lan);
			}
			if (check) embed.setDescription(`${lan.checking} \`${url}\``);
			else embed.setDescription('');
			let include = false;
			blacklistRes.forEach((entry, index) => {
				if (entry.includes('|') && entry.split(new RegExp(' | ', 'g'))[0] == url.hostname) include = index;
			});
			if (!whitelistRes.includes(`${url.hostname}`) || checkthis) {
				if (checkthis && whitelistCDNRes.includes(`${url.hostname}`)) {
					return end({
						msg, text: 'WHITELISTED', res: null, severity: null, link: url,
					}, check, embed, null, lan);
				}
				if (included == false) {
					embed
						.setDescription(`${embed.description.replace(msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading }), msg.client.ch.stp(lan.done, { tick: msg.client.constants.emotes.tick }))}\n\n${msg.client.ch.stp(lan.notWhitelisted, { warning: msg.client.constants.emotes.warning })}${msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading })}`)
						.setColor('#ffff00');
					if (blacklistRes.includes(`${url.hostname}`) || include !== false) {
						await end({ text: 'BLACKLISTED_LINK', link: url.hostname, msg }, check, embed, blacklistRes[include], lan);
						if (!check) included = true;
					} else if (blacklist.includes(url.hostname)) {
						await end({ text: 'BLACKLISTED_LINK', link: url.hostname, msg }, check, embed, null, lan);
						if (!check) included = true;
					} else {
						embed
							.setDescription(`${embed.description.replace(msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading }), msg.client.ch.stp(lan.done, { tick: msg.client.constants.emotes.tick }))}\n\n${msg.client.ch.stp(lan.notBlacklisted, { warning: msg.client.constants.emotes.warning })}${msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading })}`)
							.setColor('#ffff00');
						const spamHausRes = await SA
							.get(`https://apibl.spamhaus.net/lookup/v1/dbl/${url.hostname}`)
							.set('Authorization', `Bearer ${auth.spamhausToken}`)
							.set('Content-Type', 'application/json').catch(() => { });
						if (spamHausRes && spamHausRes.status == 200) await end({ text: 'BLACKLISTED_LINK', link: url.hostname, msg }, check, embed, null, lan);
						else {
							let ageInDays;
							const ip2whoisRes = await SA.get(`https://api.ip2whois.com/v2?key=${auth.ip2whoisToken}&domain=${url.hostname}&format=json`).catch(() => {});
							if (ip2whoisRes && ip2whoisRes.text && JSON.parse(ip2whoisRes.text).domain_age) ageInDays = JSON.parse(ip2whoisRes.text).domain_age;
							if (!ageInDays) {
								const promptapiRes = await SA.get(`https://api.promptapi.com/whois/query?domain=${url.hostname}`)
									.set('apikey', auth.promptAPIToken)
									.catch(() => { });
								if (promptapiRes && promptapiRes.text
									&& JSON.parse(promptapiRes.text).result
									&& JSON.parse(promptapiRes.text).result.creation_date
								) ageInDays = Math.ceil(Math.abs(new Date(JSON.parse(promptapiRes.text).result.creation_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
							}
							if (ageInDays !== undefined && ageInDays !== null && +ageInDays < 7) {
								return await end({
									msg, text: 'NEW_URL', res: null, severity: null, link: url,
								}, check, embed, null, lan);
							}
							let res1; let res2; let
								res;
							const VTget = await SA
								.get(`https://www.virustotal.com/api/v3/domains/${url.hostname}`)
								.set('x-apikey', auth.VTtoken).catch(() => { });
							if (VTget) res1 = JSON.parse(VTget.text).error ? JSON.parse(VTget.text).error.code : JSON.parse(VTget.text).data.attributes.last_analysis_stats;
							const VTdomainGet = await SA
								.get(`https://www.virustotal.com/api/v3/urls/${btoa(url.href).replace(/={1,2}$/, '')}`)
								.set('x-apikey', auth.VTtoken).catch(() => { });
							if (VTdomainGet) res2 = JSON.parse(VTdomainGet.text).error ? JSON.parse(VTdomainGet.text).error.code : JSON.parse(VTdomainGet.text).data.attributes.last_analysis_stats;
							if (res2 == 'NotFoundError' && res1 == 'NotFoundError') {
								embed
									.setDescription(`${embed.description.replace(msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading }), msg.client.ch.stp(lan.done, { tick: msg.client.constants.emotes.tick }))}\n\n${msg.client.ch.stp(lan.VTanalyze, { warning: msg.client.constants.emotes.warning })}${msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading })}`)
									.setColor('#ffff00');
								const VTpost = await SA
									.post('https://www.virustotal.com/api/v3/urls')
									.set('x-apikey', auth.VTtoken)
									.set('Content-Type', 'multipart/form-data')
									.field('url', url.hostname)
									.catch(() => { });
								if (VTpost) res = JSON.parse(VTpost.text).data.id;
								setTimeout(async () => {
									const VTsecondGet = await SA
										.get(`https://www.virustotal.com/api/v3/analyses/${res}`)
										.set('x-apikey', auth.VTtoken).catch(() => { });
									if (VTsecondGet) res = JSON.parse(VTsecondGet.text).error ? JSON.parse(VTsecondGet.text).error.code : JSON.parse(VTsecondGet.text).data.attributes.stats;
									evaluation(msg, res, url, JSON.parse(VTsecondGet?.text)?.data?.attributes, check, embed, lan);
								}, 60000);
							} else evaluation(msg, [res1, res2], url, VTget ? JSON.parse(VTget.text)?.data.attributes : null, check, embed, lan);
						}
					}
				}
			} else {
				end({
					msg, text: 'DB_INSERT', url: url.hostname, severity: 0,
				}, check, embed, null, lan);
			}
		}
	});
}

async function evaluation(msg, VTresponse, url, attributes, check, embed, lan) {
	if (Array.isArray(VTresponse)) VTresponse = VTresponse[0].suspicious > 0 || VTresponse[0].malicious > 0 ? VTresponse[0] : VTresponse[1];

	if (msg.m && !msg.m.logged) msg.client.ch.send(msg.client.channels.cache.get(msg.client.constants.standard.trashLogChannel), { content: msg.m.url }), msg.m.logged = true;
	if (VTresponse && (VTresponse == 'QuotaExceededError' || (VTresponse.suspicious == undefined || VTresponse.suspicious == null))) {
		if (embed.fields.length == 0) {
			embed
				.addField(msg.language.result, msg.client.ch.stp(lan.VTfail, { cross: msg.client.constants.emotes.cross }))
				.setDescription(embed.description.replace(msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading })))
				.setColor('#ffff00');
		}
		return end({
			msg, text: 'DB_INSERT', url: new URL(url).hostname, severity,
		}, check, embed, null, lan);
	}
	let severity = 0;

	if (VTresponse) {
		if (VTresponse.suspicious > 10) severity = 1;
		if (VTresponse.suspicious > 20) severity = 2;
		if (VTresponse.suspicious > 30) severity = 3;
		if (VTresponse.suspicious > 40) severity = 4;
		if (VTresponse.suspicious > 50) severity = 5;
		if (VTresponse.suspicious > 60) severity = 6;

		if (VTresponse.malicious > 50) severity = 100;
		else if (VTresponse.malicious > 40) severity = 80 + severity;
		else if (VTresponse.malicious > 30) severity = 60 + severity;
		else if (VTresponse.malicious > 20) severity = 40 + severity;
		else if (VTresponse.malicious > 10) severity = 20 + severity;
		else if (VTresponse.malicious > 5) severity = 10 + severity;
		else if (VTresponse.malicious > 1) severity = 6 + severity;
	}

	if (severity > 2) {
		return await end({
			msg, text: 'SEVERE_LINK', res: VTresponse, severity, link: url,
		}, check, embed, null, lan);
	}
	if (attributes && `${+attributes.creation_date}000` > Date.now() - 604800000) {
		return await end({
			msg, text: 'NEW_URL', res: VTresponse, severity, link: url,
		}, check, embed, null, lan);
	}
	if (!check) setTimeout(() => msg.m?.delete().catch(() => { }), 10000);
	if (attributes) {
		if (embed.fields.length == 0) {
			embed
				.addField(msg.language.result, msg.client.ch.stp(lan.VTharmless, { tick: msg.client.constants.emotes.tick }))
				.setDescription(embed.description.replace(msg.client.ch.stp(lan.check, { loading: msg.client.constants.emotes.loading }), msg.client.ch.stp(lan.done, { tick: msg.client.constants.emotes.tick })))
				.setColor('#00ff00');
		}
		fs.appendFile('S:/Bots/ws/CDN/whitelisted.txt', `\n${new URL(url).hostname}`, () => {});
	}
}

async function end(data, check, embed, note, lan) {
	if (data.msg.m && !data.msg.m.logged) data.msg.client.ch.send(data.msg.client.channels.cache.get(data.msg.client.constants.standard.trashLogChannel), { content: data.msg.m.url }), data.msg.m.logged = true;
	if (data.text == 'NOT_EXISTENT') {
		if (embed.fields.length == 0) {
			embed
				.addField(data.msg.language.result, data.msg.client.ch.stp(lan.notexistent, { url: data.link.hostname }))
				.setDescription(data.msg.client.ch.stp(lan.done, { tick: data.msg.client.constants.emotes.tick }))
				.setColor('#00ff00');
			const m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] }).catch(() => { });
			if (!check) setTimeout(() => m.delete().catch(() => { }), 10000);
		}
		end({
			msg: data.msg, text: 'DB_INSERT', url: data.link, severity: data.severity,
		}, check, embed, null, lan);
		return true;
	}
	if (data.text == 'BLACKLISTED_LINK') {
		if (note && note !== false) {
			if (embed.fields.length == 0) {
				embed
					.addField(data.msg.language.result, data.msg.client.ch.stp(lan.blacklisted, { cross: data.msg.client.constants.emotes.cross }))
					.addField(data.msg.language.attention, note.split(/\|+/)[1])
					.setDescription(embed.description.replace(data.msg.client.ch.stp(lan.check, { loading: data.msg.client.constants.emotes.loading }), data.msg.client.ch.stp(lan.done, { tick: data.msg.client.constants.emotes.tick })))
					.setColor('#ff0000');
				data.msg.m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] }).catch(() => { });
			}
		} else {
			if (embed.fields.length == 0) {
				embed
					.addField(data.msg.language.result, data.msg.client.ch.stp(lan.blacklisted, { cross: data.msg.client.constants.emotes.cross }))
					.setDescription(embed.description.replace(data.msg.client.ch.stp(lan.check, { loading: data.msg.client.constants.emotes.loading }), data.msg.client.ch.stp(lan.done, { tick: data.msg.client.constants.emotes.tick })))
					.setColor('#ff0000');
				data.msg.m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] }).catch(() => { });
			}
			if (!check) client.emit('antivirusHandler', data.msg, data.link, 'blacklist');
		}
		end({
			msg: data.msg, text: 'DB_INSERT', url: data.link, severity: data.severity,
		}, check, embed, null, lan);
		return true;
	}
	if (data.text == 'SEVERE_LINK') {
		if (embed.fields.length == 0) {
			embed
				.addField(data.msg.language.result, data.msg.client.ch.stp(lan.VTmalicious, { cross: data.msg.client.constants.emotes.cross, severity: data.severity }))
				.setDescription(embed.description.replace(data.msg.client.ch.stp(lan.check, { loading: data.msg.client.constants.emotes.loading }), data.msg.client.ch.stp(lan.done, { tick: data.msg.client.constants.emotes.tick })))
				.setColor('#ff0000');
			data.msg.m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] }).catch(() => { });
		}
		if (!check) client.emit('antivirusHandler', data.msg, data.link, 'virustotal');
		end({
			msg: data.msg, text: 'DB_INSERT', url: data.link, severity: data.severity,
		}, check, embed, null, lan);
		return true;
	}
	if (data.text == 'NEW_URL') {
		if (embed.fields.length == 0) {
			embed
				.addField(data.msg.language.result, data.msg.client.ch.stp(lan.newLink, { cross: data.msg.client.constants.emotes.cross }))
				.setDescription(embed.description.replace(data.msg.client.ch.stp(lan.check, { loading: data.msg.client.constants.emotes.loading }), data.msg.client.ch.stp(lan.done, { tick: data.msg.client.constants.emotes.tick })))
				.setColor('#ff0000');
			data.msg.m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] }).catch(() => { });
		}
		if (!check) client.emit('antivirusHandler', data.msg, data.link, 'newurl');
		end({
			msg: data.msg, text: 'DB_INSERT', url: data.link, severity: data.severity,
		}, check, embed, null, lan);
		return true;
	}
	if (data.text == 'DB_INSERT') {
		if (check && (data.severity !== null && data.severity < 2) && embed.fields.length == 0) {
			embed
				.addField(data.msg.language.result, data.msg.client.ch.stp(lan.whitelisted, { tick: data.msg.client.constants.emotes.tick }))
				.setDescription(embed.description.replace(data.msg.client.ch.stp(lan.check, { loading: data.msg.client.constants.emotes.loading }), data.msg.client.ch.stp(lan.done, { tick: data.msg.client.constants.emotes.tick })))
				.setColor('#00ff00');
			data.msg.m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] }).catch(() => { });
			if (!check) setTimeout(() => data.msg.m?.delete().catch(() => { }), 10000);
		}
		client.ch.query(`
		INSERT INTO antiviruslinks
		(link, severity, uses) VALUES
		($1, $2, $3)
		ON CONFLICT (link) DO
		UPDATE SET uses = antiviruslinks.uses + 1, severity = $2;
		`, [data.url, data.severity, 1]);
	}
}
