const ch = require('../../BaseClient/ClientHelper');
const Constants = require('../../Constants.json');
const Discord = require('discord.js');
const { client } = require('../../BaseClient/DiscordClient');
const images = require('../../sources.js');
const fs = require('fs');


module.exports = {
	async execute(msg) {
		if (msg.author.id == '318453143476371456') {
			if (msg.content.toLowerCase().startsWith('t!')) {
				const args = msg.content.slice(2).split(/ +/);
				if (args[0] == 'rv') {
					if (!args.length) return ch.send(msg.channel, `You didn't pass any event to reload, ${msg.author}!`);
					if (args[1] == 'ch') {
						try {
							const oldFile = require('../../BaseClient/ClientHelper.js');
							if (!oldFile) return ch.reply(msg, `There is no \`${args[1]}\` Folder with \`${args[2]}\` Event`);
							delete require.cache[require.resolve('../../BaseClient/ClientHelper.js')];
							ch.send(msg.channel, 'The Client Helper was reloaded');
							console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n');
						} catch (error) {
							ch.send(msg.channel, `There was an error while reloading the Client Helper:\n\`\`\`${error.stack}\`\`\``);
						}
					} else {
						const foldername = args[1] ? args[1]+'Events' : undefined;
						const filename = args[2] ? args[1]+args[2] : args[1];
						if (!foldername) return ch.reply(msg, 'You have to provide a folder.');
						if (!filename) return ch.reply(msg, 'You have to provide a file.');
						try {
							const oldFile = require(`../${foldername}/${filename}.js`);
							if (!oldFile) return ch.reply(msg, `There is no \`${args[1]}\` Folder with \`${args[2]}\` Event`);
							delete require.cache[require.resolve(`../${foldername}/${filename}.js`)];
							ch.send(msg.channel, `Event \`${filename}\` in Folder \`${foldername}\` was reloaded!`);
							console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n');
						} catch (error) {
							if (`${error}`.startsWith('Error: Cannot find module')) ch.send(msg.channel, `There is no File called ${filename} or Folder called ${foldername}`);
							else ch.send(msg.channel, `There was an error while reloading an Event \`${filename}\`:\n\`\`\`${error.stack}\`\`\``);
						}
					}
				}
				if (args[0] == 'eval') {
					try {
						let code = args.slice(1).join(' ');
						eval(`(async () => {${code}})()`);
						msg.channel.send('Done');
					}
					catch (error) {
						ch.reply(msg, `there was an error during evaluation.\n\`\`\`${error.stack}\`\`\``);
						ch.send(msg.channel, error);
					}
				}
				if (args[0] == 'test') {
					console.log(ch.stp(Constants.messageUpdateLogUpdate.author.link, {msg: msg}));
				}
				if (args[0] == 'restart') {
					await ch.send(msg.channel, 'Restarting...');
					// eslint-disable-next-line no-undef
					process.exit();
				}
			}
		}
	}
};        