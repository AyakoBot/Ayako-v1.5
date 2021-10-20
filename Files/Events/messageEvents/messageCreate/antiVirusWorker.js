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
		url = await SA.get(linkLists[i]);
		url = url ? url.text.split(/\n+/) : null;
		list = [...list, ...url];
	}

	let whitelistRes = await SA.get('https://ayakobot.com/cdn/whitelisted.txt');
	whitelistRes = whitelistRes ? whitelistRes.text.split(/\n+/) : null;

	const blacklist = new Set(list);
	let included = false;
	links.forEach(async (link) => {
		if (!whitelistRes.includes(new URL(link).hostname)) {
			if (included == false) {
				if (blacklist.includes(`${link.split(/\/+/)[0]}`)) parentPort.postMessage('BLACKLISTED_LINK', { link: link.split(/\/+/)[0], msgid: data.msgid, channelid: data.channelid, row: r}), included = true;
				else {
					let res;
					const VTget = await SA
						.get(`https://www.virustotal.com/api/v3/domains/${new URL(link).host}`)
						.set('x-apikey', auth.VTtoken);
					if (VTget) res = VTget.error ? VTget.error.code : VTget.data.attributes.last_analysis_stats;
					if (res == 'NotFoundError') {
						const VTpost = await SA
							.post('https://www.virustotal.com/api/v3/urls')
							.set('x-apikey', auth.VTtoken)
							.set('Content-Type', 'multipart/form-data')
							.field('url', new URL(link).host);
						if (VTpost) res = VTpost.data.id;
						setTimeout(async () => {
							const VTsecondGet = await SA
								.get(`https://www.virustotal.com/api/v3/analyses/${res}`)
								.set('x-apikey', auth.VTtoken);
							if (VTsecondGet) res = VTsecondGet.error ? VTsecondGet.error.code : VTsecondGet.data.attributes.stats;
							evaluation({ msgid: data.msgid, channelid: data.channelid}, res, link, r);
						}, 60000);
					} else evaluation({ msgid: data.msgid, channelid: data.channelid}, res, link, r);
				}
			}
		}
	});
}

async function evaluation(msg, VTresponse, url, r) {
	if (VTresponse == 'QuotaExceededError' || !VTresponse.suspicious) return;
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

	if (severity > 2) parentPort.postMessage('SEVERE_LINK', { msg: msg, res: VTresponse, severity: severity, row: r, link: url});
	else fs.appendFile('S:/Bots/ws/CDN/whitelisted.txt', `\n${new URL(url).hostname}`, (err) => { if (err) throw err; });
}