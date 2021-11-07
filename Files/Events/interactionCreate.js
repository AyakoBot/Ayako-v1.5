const fs = require('fs');

module.exports = {
	async execute(interaction) {
		if (interaction.customId == 'CHANGE_LINK_TO_BAD') {
			const link = new URL(interaction.message.embeds[0].description.split(/`+/)[1]);
			const whitelist = fs.readFileSync('S:/Bots/ws/CDN/whitelisted.txt', 'utf8').toString();
			if (whitelist.includes(link.hostname)) fs.writeFileSync('S:/Bots/ws/CDN/whitelisted.txt', whitelist.replace(`\n${link.hostname}`, ''));
			fs.appendFile('S:/Bots/ws/CDN/blacklisted.txt', `\n${link.hostname}`, () => { });
		}
	}
};