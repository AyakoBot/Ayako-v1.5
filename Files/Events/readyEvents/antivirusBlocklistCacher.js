const SA = require('superagent');
const fs = require('fs');

const linkLists = require('../../sources').antivirus;

module.exports = {
	async execute() {
		let list = new Array, url;
		for (let i = 0; i < linkLists.length; i++) {
			url = await SA.get(linkLists[i]).catch(() => { });
			url = url ? list = [...list, ...url.text.split(/\n+/)] : null;
		}
		const blacklist = [...new Set(list)];
		blacklist.forEach((entry, index) => {
			blacklist[index] = entry.replace(/#{2}-{1}/g, '');
			if (blacklist[index].startsWith('#')) blacklist.splice(index, 1);
		});
		fs.writeFileSync('./Files/blocklist.json', JSON.stringify(blacklist));
	}
};