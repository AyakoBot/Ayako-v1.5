module.exports = {
	name: 'reloadevent',
	perm: 0,
	dm: true,
	takesFirstArg: true,
	aliases: ['rv'],
	exe(msg) {
		const args = msg.args;
		const client = msg.client;
		const ch = client.ch;
		if (!args.length) return ch.reply(msg, 'You didn\'t pass anything to reload!');
		const name = args[0].toLowerCase();
		if (name.toLowerCase() == 'constants') {
			delete require.cache[require.resolve('../Constants.json')];
			try {
				client.constants = require('../Constants.json');
				ch.reply(msg, 'File `Constants.json` was reloaded!');
			} catch(e) {
				ch.reply(msg, `There was an error while reloading the \`Constants.json\`\n\`\`\`${e.stack}\`\`\``);
			}
		} else if (name.toLowerCase() == 'lan') {
			try {
				delete require.cache[require.resolve(`../Languages/lan-${args[1]}.json`)];
				const lan = require(`../Languages/lan-${args[1]}.json`);
				client.languages.set(`lan-${args[1]}`, lan);
				ch.reply(msg, `Language File \`lan-${args[1]}.json\` was reloaded!`);
			} catch(e) {
				if (`${e}`.startsWith('Error: Cannot find module')) ch.reply(msg, `There is no Language File called \`lan-${args[1]}.json\``);
				else ch.reply(msg, `There was an error while reloading that Language File \`${name}\`:\n\`\`\`${e.stack}\`\`\``);
			}
		} else if (name.toLowerCase() == 'ch') {
			delete require.cache[require.resolve('../BaseClient/ClientHelper')];
			try {
				client.ch = require('../BaseClient/ClientHelper');
				ch.reply(msg, 'The Client Helper was reloaded!');
			} catch(e) {
				ch.reply(msg, `There was an error while reloading the ClientHelper:\n\`\`\`${e.stack}\`\`\``);
			}
		} else {
			const eventArr = [];
			for (const rawevent of [...client.events.entries()]) {
				if (name == rawevent[0].toLowerCase()) {
					const event = client.events.get(rawevent[0]);
					eventArr.push(rawevent[0]);
					delete require.cache[require.resolve(event.path)];
					try {
						const newEvent = require(event.path);
						newEvent.path = event.path;
						client.events.set(rawevent[0], newEvent);
						ch.reply(msg, `The Event \`${rawevent[0]}\` in path \`${newEvent.path}\` was reloaded!`);
					} catch(e) {
						ch.reply(msg, `There was an error while reloading Event \`${rawevent[0]}\` in path \`${event.path}\`\n\`\`\`${e.stack}\`\`\``);
					}
				}
			}
			if (!eventArr[0]) ch.reply(msg, `Event \`${name}\` not found.`);

		}
	}
};