const fs = require('fs');

module.exports = {
	name: 'reloadevent',
	permlevel: 0,
	category: 'Owner',
	aliases: ['rv'],
	description: 'Reloads an Event File',
	usage: 'h!reloadevent [Event name] (File type) (File name)\nh!reloadevent constants\nh!reloadevent ch\nh!reloadevent language [language]',
	exe(msg, args) {
		const client = msg.client;
		const ch = client.ch;
		if (!args.length) return ch.reply(msg, 'You didn\'t pass anything to reload!');
		const foldername = args[0] ? args[0]+'Events' : undefined;
		const filename = args[1] ? args[0]+args[1] : args[0];
		if (foldername.toLowerCase() == 'constants') {
			delete require.cache[require.resolve('../Constants.json')];
			try {
				client.constants = require('../Constants.json');
			} catch(e) {
				ch.reply(msg, `There was an error while reloading the Constants.json:\n\`\`\`${e.stack}\`\`\``);
			}
		} else if (foldername.toLowerCase() == 'language') {
			try {
				const lan = require(`../Languages/lan-${args[1]}.json`);
				delete require.cache[lan];
				client.languages.set(`lan-${args[1]}`, lan);
			} catch(e) {
				if (`${e}`.startsWith('Error: Cannot find module')) ch.reply(msg, `There is no Language File called \`lan-${args[1]}.json\``);
				else ch.reply(msg, `There was an error while reloading that Language File \`${filename}\`:\n\`\`\`${e.stack}\`\`\``);
			}
		} else if (foldername.toLowerCase() == 'ch') {
			delete require.cache[require.resolve('../Constants.json')];
			try {
				client.constants = require('../BaseClient/ClientHelper');
			} catch(e) {
				ch.reply(msg, `There was an error while reloading the ClientHelper:\n\`\`\`${e.stack}\`\`\``);
			}
		} else if (fs.existsSync('./Files/Events/'+foldername)) {
			if (fs.existsSync(`./Files/Events/${foldername}/${filename}`)) {
				const actualFilename = args[2];
				try {
					delete require.cache[require.resolve(`../Events/${foldername}/${filename}/${actualFilename}`)];
					ch.reply(msg, `Event \`${filename}\` in Folder \`${foldername}\` was reloaded!`);
				} catch(e) {
					if (`${e}`.startsWith('Error: Cannot find module')) ch.reply(msg, `There is no File called ${filename} or Folder called ${foldername}`);
					else ch.reply(msg, `There was an error while reloading that Event \`${filename}\`:\n\`\`\`${e.stack}\`\`\``);
				}
			} else {
				try {
					delete require.cache[require.resolve(`../Events/${foldername}/${filename}`)];
					ch.reply(msg, `Event \`${filename}\` in Folder \`${foldername}\` was reloaded!`);
				} catch(e) {
					if (`${e}`.startsWith('Error: Cannot find module')) ch.reply(msg, `There is no File called ${filename} or Folder called ${foldername}`);
					else ch.reply(msg, `There was an error while reloading that Event \`${filename}\`:\n\`\`\`${e.stack}\`\`\``);
				}
			}
		}
	}
};