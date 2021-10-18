const { parentPort } = require('worker_threads');
const SA = require('superagent');
const URLCheck = require('valid-url');
const linkLists = require('../../../sources').antivirus;
const VT = require('../../../BaseClient/VTClient');

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

	const blacklist = new Set(list);

	links.forEach((link) => {
		if (blacklist.includes(`${link.split(/\/+/)[0]}`)) parentPort.postMessage('BLACKLISTED_LINK', { link: link.split(/\/+/)[0], msgid: data.msgid, channelid: data.channelid});
		else {
			VT.domainLookup(link, (err, res) => {
				if (err) return;
				return parentPort.postMessage('VT_RES', { link: link.split(/\/+/)[0], msgid: data.msgid, channelid: data.channelid, res: res });
			});
		}
	});
}