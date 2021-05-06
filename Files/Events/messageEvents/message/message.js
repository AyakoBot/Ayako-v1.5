const Discord = require('discord.js');
const { client } = require('../../BaseClient/DiscordClient');
const images = require('../../sources.js');
const fs = require('fs');


module.exports = {
	async execute(msg) {
		const Constants = client.constants;
		if (msg.author.id == '318453143476371456') {
			if (msg.content.toLowerCase().startsWith('t!')) {
				const args = msg.content.slice(2).split(/ +/);
				split(args);
				
			}
		}
		async function split(args) {
			if (args[0] == 'eval') {
				try {
					let code = args.slice(1).join(' ');
					eval(`(async () => {${code}})()`);
					msg.channel.send('Done');
				}
				catch (error) {
					client.ch.reply(msg, `there was an error during evaluation.\n\`\`\`${error.stack}\`\`\``);
					client.ch.send(msg.channel, error);
				}
			}
			if (args[0] == 'test') {
				console.log(client.ch.stp(Constants.messageUpdateLogUpdate.author.link, {msg: msg}));
			}
			if (args[0] == 'restart') {
				await client.ch.send(msg.channel, 'Restarting...');
				// eslint-disable-next-line no-undef
				process.exit();
			}
		}
	}
};        