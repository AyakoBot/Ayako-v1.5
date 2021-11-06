const client = require('../../../BaseClient/DiscordClient');
const urlCheck = require('valid-url');
const SA = require('superagent');
const request = require('request');
const linkLists = require('../../../sources').antivirus;
const auth = require('../../../BaseClient/auth.json');
const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
	async execute(msg) {
		let check = false;
		if (!msg.content) return;
		if (msg.channel.type == 'DM') check = true;
		msg.language = await msg.client.ch.languageSelector(check ? null : msg.guild);
		msg.lan = check ? msg.language.antivirus.dm : msg.language.antivirus.guild;
		if (check) return run(msg, check);
		const res = await msg.client.ch.query('SELECT * FROM antivirus WHERE guildid = $1;', [msg.guild.id]);
		if (res && res.rowCount > 0) {
			const r = res.rows[0];
			if (r.active !== true) return;
			run(msg, check);
		}
	}
};

async function run(msg, check) {
	const content = msg.content;
	const args = content.replace(new RegExp('\\n', 'g'), ' ').split(/ +/);
	const links = new Array;
	args.forEach((arg) => {
		if (urlCheck.isUri(arg)) links.push(arg);
	});
	let list = new Array, url;
	for (let i = 0; i < linkLists.length; i++) {
		url = await SA.get(linkLists[i]).catch(() => { });
		url = url ? url.text.split(/\n+/) : null;
		list = [...list, ...url];
	}
	const blacklist = [...new Set(list)];
	blacklist.forEach((entry, index) => {
		blacklist[index] = entry.replace(/#{2}-{1}/g, '');
		if (blacklist[index].startsWith('#')) blacklist.splice(index, 1);
	});

	let whitelistRes = await SA.get('https://ayakobot.com/cdn/whitelisted.txt').catch(() => { });
	whitelistRes = whitelistRes ? whitelistRes.text.split(/\n+/) : [];
	whitelistRes.forEach((entry, index) => whitelistRes[index] = entry.replace(/\r/g, ''));
	let blacklistRes = await SA.get('https://ayakobot.com/cdn/blacklisted.txt').catch(() => { });
	blacklistRes = blacklistRes ? blacklistRes.text.split(/\n+/) : [];
	blacklistRes.forEach((entry, index) => blacklistRes[index] = entry.replace(/\r/g, ''));

	const FullLinks = new Array;
	for (let i = 0; i < links.length; i++) {
		const url = new URL(links[i]);
		const res = await new Promise((resolve) => {
			request({ method: 'HEAD', url: url, followAllRedirects: true },
				function (_, response) {
					if (response && response.request && response.request.href) resolve(response.request.href);
					else resolve(null);
				});
		});
		if (res) {
			FullLinks.push(res);
		} else FullLinks.push(url);
	}

	let included = false;
	FullLinks.forEach(async (url) => {
		const embed = new Discord.MessageEmbed();
		if (!url.hostname) url = new URL(url);
		if (url.hostname) {
			if (check) embed.setDescription(`${msg.lan.checking} \`${url}\``);
			else embed.setDescription('');
			console.log('Link Detected: ' + url);
			if (blacklistRes.includes(`${url.hostname}`)) {
				console.log('Blacklist included Link');
				end({ text: 'BLACKLISTED_LINK', link: url.hostname, msg: msg }, check, embed);
				end({ msg: msg, text: 'DB_INSERT', url: url.hostname, severity: null }, check, embed);
				if (!check) included = true;
			} else if (!whitelistRes.includes(`${url.hostname}`)) {
				console.log('Link is not Whitelisted');
				if (included == false) {
					embed
						.setDescription(embed.description + '\n\n' + msg.client.ch.stp(msg.lan.notWhitelisted, { warning: msg.client.constants.emotes.warning, loading: msg.client.constants.emotes.loading }))
						.setColor('#ffff00');
					if (msg.m) msg.m.edit({ embeds: [embed] }).catch(() => { });
					else msg.m = await msg.client.ch.reply(msg, { embeds: [embed] }).catch(() => { });
					console.log('Message did not contain any Links yet');
					if (blacklist.includes(url.hostname)) {
						console.log('Blacklist included Link');
						end({ text: 'BLACKLISTED_LINK', link: url.hostname, msg: msg }, check, embed);
						end({ msg: msg, text: 'DB_INSERT', url: url.hostname, severity: null }, check, embed);
						if (!check) included = true;
					} else {
						console.log('Blacklist did not include Link');
						embed
							.setDescription(embed.description + '\n\n' + msg.client.ch.stp(msg.lan.notBlacklisted, { warning: msg.client.constants.emotes.warning, loading: msg.client.constants.emotes.loading }))
							.setColor('#ffff00');
						if (msg.m) msg.m.edit({ embeds: [embed] }).catch(() => { });
						else msg.m = await msg.client.ch.reply(msg, { embeds: [embed] }).catch(() => { });
						const spamHausRes = await SA
							.get(`https://apibl.spamhaus.net/lookup/v1/dbl/${url.hostname}`)
							.set('Authorization', `Bearer ${auth.spamhausToken}`)
							.set('Content-Type', 'application/json').catch(() => { });
						if (spamHausRes && spamHausRes.status == 200) {
							console.log('SpamHaus included Link');
							end({ msg: msg, text: 'DB_INSERT', url: url.hostname, severity: null }, check, embed);
							end({ text: 'BLACKLISTED_LINK', link: url.hostname, msg: msg }, check, embed);
						} else {
							console.log('SpamHaus did not include Link');
							let res;
							const VTget = await SA
								.get(`https://www.virustotal.com/api/v3/domains/${url.hostname}`)
								.set('x-apikey', auth.VTtoken).catch(() => { });
							if (VTget) res = JSON.parse(VTget.text).error ? JSON.parse(VTget.text).error.code : JSON.parse(VTget.text).data.attributes.last_analysis_stats;
							if (JSON.parse(VTget.text).data.attributes.last_analysis_stats) console.log('VT knows Link');
							else console.log('VT does not know Link');
							if (res == 'NotFoundError') {
								console.log('VT has to analyze Link');
								embed
									.setDescription(embed.description + '\n\n' + msg.client.ch.stp(msg.lan.VTanalyze, { warning: msg.client.constants.emotes.warning }))
									.setColor('#ffff00');
								if (msg.m) msg.m.edit({ embeds: [embed] }).catch(() => { });
								else msg.m = await msg.client.ch.reply(msg, { embeds: [embed] }).catch(() => { });
								const VTpost = await SA
									.post('https://www.virustotal.com/api/v3/urls')
									.set('x-apikey', auth.VTtoken)
									.set('Content-Type', 'multipart/form-data')
									.field('url', url.hostname).catch(() => { });
								if (VTpost) res = JSON.parse(VTpost.text).data.id;
								setTimeout(async () => {
									console.log('VT analyze done');
									const VTsecondGet = await SA
										.get(`https://www.virustotal.com/api/v3/analyses/${res}`)
										.set('x-apikey', auth.VTtoken).catch(() => { });
									if (VTsecondGet) res = JSON.parse(VTsecondGet.text).error ? JSON.parse(VTsecondGet.text).error.code : JSON.parse(VTsecondGet.text).data.attributes.stats;
									evaluation(msg, res, url, JSON.parse(VTsecondGet?.text)?.data?.attributes, check, embed);
								}, 60000);
							} else evaluation(msg, res, url, JSON.parse(VTget?.text)?.data?.attributes, check, embed);
						}
					}
				}
			} else end({ msg: msg, text: 'DB_INSERT', url: url.hostname, severity: 0 }, check, embed);
		}
	});
}

async function evaluation(msg, VTresponse, url, attributes, check, embed) {
	console.log('Evaluation called');
	if (VTresponse == 'QuotaExceededError' || (VTresponse.suspicious == undefined || VTresponse.suspicious == null)) {
		embed
			.addField(msg.language.result, msg.client.ch.stp(msg.lan.VTfail, { cross: msg.client.constants.emotes.cross }))
			.setColor('#ffff00');
		if (msg.m) msg.m.edit({ embeds: [embed] }).catch(() => { });
		else msg.m = await msg.client.ch.reply(msg, { embeds: [embed] }).catch(() => { });
		return end({ msg: msg, text: 'DB_INSERT', url: new URL(url).hostname, severity: severity }, check, embed);
	}
	let severity = 0;

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

	end({ msg: msg, text: 'DB_INSERT', url: new URL(url).hostname, severity: severity }, check, embed);

	console.log('Link Severity: ' + severity);

	if (severity > 2) end({ msg: msg, text: 'SEVERE_LINK', res: VTresponse, severity: severity, link: url }, check, embed);
	else if (attributes && +attributes.creation_date + '000' > Date.now() - 604800000) end({ msg: msg, text: 'NEW_URL', res: VTresponse, severity: severity, link: url }, check, embed);
	else if (attributes) {
		embed
			.addField(msg.language.result, msg.client.ch.stp(msg.lan.VTharmless, { tick: msg.client.constants.emotes.tick }))
			.setColor('#ffff00');
		if (msg.m) msg.m.edit({ embeds: [embed] }).catch(() => { });
		else msg.m = await msg.client.ch.reply(msg, { embeds: [embed] }).catch(() => { });
		fs.appendFile('S:/Bots/ws/CDN/whitelisted.txt', `\n${new URL(url).hostname}`, () => {});
	}
	else client.ch.send(client.channels.cache.get('726252103302905907'), `${url}\n\`\`\`${JSON.stringify(VTresponse)}\`\`\``); 
}

async function end(data, check, embed) {
	if (data.text == 'BLACKLISTED_LINK') {
		embed
			.addField(data.msg.language.result, data.msg.client.ch.stp(data.msg.lan.blacklisted, { cross: data.msg.client.constants.emotes.cross }))
			.setColor('#ff0000');
		if (data.msg.m) data.msg.m.edit({ embeds: [embed] }).catch(() => { });
		else data.msg.m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] }).catch(() => { });
		if (!check) client.emit('antivirusHandler', data.msg, data.link, 'blacklist');
	}
	if (data.text == 'SEVERE_LINK') {
		embed
			.addField(data.msg.language.result, data.msg.client.ch.stp(data.msg.lan.VTmalicious, { cross: data.msg.client.constants.emotes.cross, severity: data.severity }))
			.setColor('#ff0000');
		if (data.msg.m) data.msg.m.edit({ embeds: [embed] }).catch(() => { });
		else data.msg.m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] }).catch(() => { });
		if (!check) client.emit('antivirusHandler', data.msg, data.link, 'virustotal');
	}
	if (data.text == 'NEW_URL') {
		console.log('Link is too new');
		embed
			.addField(data.msg.language.result, data.msg.client.ch.stp(data.msg.lan.newLink, { cross: data.msg.client.constants.emotes.cross }))
			.setColor('#ff0000');
		if (data.msg.m) data.msg.m.edit({ embeds: [embed] }).catch(() => { });
		else data.msg.m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] }).catch(() => { });
		if (!check) client.emit('antivirusHandler', data.msg, data.link, 'newurl');
	}
	if (data.text == 'DB_INSERT') {
		if (check && (data.severity !== null && data.severity < 2)) {
			embed
				.addField(data.msg.language.result, data.msg.client.ch.stp(data.msg.lan.whitelisted, { tick: data.msg.client.constants.emotes.tick }))
				.setColor('#00ff00');
			if (data.msg.m) data.msg.m.edit({ embeds: [embed] }).catch(() => { });
			else data.msg.m = await data.msg.client.ch.reply(data.msg, { embeds: [embed] }).catch(() => { });
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