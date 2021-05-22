module.exports = {
	name: 'addcmd',
	perm: 0,
	dm: true,
	category: 'Owner',
	description: 'Adds a Command File',
	usage: 'h!addcmd [command Name]',
	/* eslint-disable */
	exe(msg) {
        /* eslint-enable */
		const args = msg.args;
		if (!args[0]) return msg.client.ch.reply(msg, 'Please enter a valid command');
		const newCommand = require(`./${args[0]}.js`);
		try {
			msg.client.commands.set(newCommand.name, newCommand);
			msg.client.ch.reply(msg, `Command \`${newCommand.name}\` was added!`);
		} catch (error) {
			msg.client.ch.reply(msg, `There was an error while adding a command \`${args[0]}\`:\n\`\`\`${error.stack}\`\`\``);
		}
	}
};