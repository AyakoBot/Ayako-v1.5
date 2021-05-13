const { client } = require('../../BaseClient/DiscordClient');
const Discord = require('discord.js');

module.exports = {
	async execute(oldUser, newUser) {
		const ch = client.ch;
		const Constants = client.constants;
        if (oldUser.id !== '564052925828038658') return;
        console.log(oldUser.presence, newUser.presence);

	}
};