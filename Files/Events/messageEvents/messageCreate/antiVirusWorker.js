const { parentPort } = require('worker_threads');
const SA = require('superagent');
const URLCheck = require('valid-url');
const linkLists = require('../../../sources').antivirus;
const auth = require('../../../BaseClient/auth.json');
const fs = require('fs');

parentPort.on('message', (data) => {
	start(data);
});

async function start(data) {
	const content = data.content, r = data.row;
	const args = content.split(/ +/);
	const links = new Array;
	args.forEach(arg => {
		if (URLCheck.isUri(arg)) links.push(arg);
	});
	if (links.length == 0) return parentPort.postMessage('NO_LINKS');
	let list = new Array, url;
	for (let i = 0; i < linkLists.length; i++) {
		url = await SA.get(linkLists[i]).catch(() => {});
		url = url ? url.text.split(/\n+/) : null;
		list = [...list, ...url];
	}
	const blacklist = [...new Set(list)];
	blacklist.forEach((entry, index) => {
		blacklist[index] = entry.replace(/#{2}-{1}/g, '');
		if (blacklist[index].startsWith('#')) blacklist.splice(index, 1);
	});

	let whitelistRes = await SA.get('https://ayakobot.com/cdn/whitelisted.txt').catch(() => {});
	whitelistRes = whitelistRes ? whitelistRes.text.split(/\n+/) : null;

	whitelistRes.forEach((entry, index) => whitelistRes[index] = entry.replace(/\r/g, ''));

	let included = false;
	links.forEach(async (link) => {
		if (new URL(link).hostname) {
			if (!whitelistRes.includes(`${new URL(link).hostname}`)) {
				if (included == false) {
					if (blacklist.includes(new URL(link).hostname)) {
						parentPort.postMessage({ text: 'BLACKLISTED_LINK', link: new URL(link).hostname, msgid: data.msgid, channelid: data.channelid, authorid: data.authorid, row: r});
						parentPort.postMessage({ text: 'DB_INSERT', url: new URL(link).hostname, severity: null });
						included = true;
					} else {
						const spamHausRes = await SA
							.get(`https://apibl.spamhaus.net/lookup/v1/dbl/${new URL(link).hostname}`)
							.set('Authorization', `Bearer ${auth.spamhausToken}`)
							.set('Content-Type', 'application/json').catch(() => {});
						if (spamHausRes && spamHausRes.status == 200) { 
							parentPort.postMessage({ text: 'DB_INSERT', url: new URL(link).hostname, severity: null });
							parentPort.postMessage({ text: 'BLACKLISTED_LINK', link: new URL(link).hostname, msgid: data.msgid, channelid: data.channelid, authorid: data.authorid, row: r });
						} else {
							let res;
							const VTget = await SA
								.get(`https://www.virustotal.com/api/v3/domains/${new URL(link).host}`)
								.set('x-apikey', auth.VTtoken);
							if (VTget) res = JSON.parse(VTget.text).error ? JSON.parse(VTget.text).error.code : JSON.parse(VTget.text).data.attributes.last_analysis_stats;
							if (res == 'NotFoundError') {
								const VTpost = await SA
									.post('https://www.virustotal.com/api/v3/urls')
									.set('x-apikey', auth.VTtoken)
									.set('Content-Type', 'multipart/form-data')
									.field('url', new URL(link).host).catch(() => { });
								if (VTpost) res = JSON.parse(VTpost.text).data.id;
								setTimeout(async () => {
									const VTsecondGet = await SA
										.get(`https://www.virustotal.com/api/v3/analyses/${res}`)
										.set('x-apikey', auth.VTtoken).catch(() => { });
									if (VTsecondGet) res = JSON.parse(VTsecondGet.text).error ? JSON.parse(VTsecondGet.text).error.code : JSON.parse(VTsecondGet.text).data.attributes.stats;
									evaluation({ msgid: data.msgid, channelid: data.channelid, authorid: data.authorid}, res, link, r);
								}, 60000);
							} else evaluation({ msgid: data.msgid, channelid: data.channelid, authorid: data.authorid}, res, link, r);
						}
					}
				}
			} else parentPort.postMessage({ text: 'DB_INSERT', url: new URL(link).hostname, severity: 0 });
		}
	});
}

async function evaluation(msg, VTresponse, url, r) {
	if (VTresponse == 'QuotaExceededError' || (VTresponse.suspicious == undefined || VTresponse.suspicious == null)) return;
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

	parentPort.postMessage({ text: 'DB_INSERT', url: new URL(url).hostname, severity: severity});

	if (severity > 2) parentPort.postMessage({ text: 'SEVERE_LINK',  msg: msg, res: VTresponse, severity: severity, row: r, link: url});
	else fs.appendFile('S:/Bots/ws/CDN/whitelisted.txt', `\n${new URL(url).hostname}`, (err) => { if (err) throw err; });
}