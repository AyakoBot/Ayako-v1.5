module.exports = {
	name: 'eval',
	perm: 0,
	category: 'Owner',
	description: 'Evaluates any JavaScript Code',
	usage: 'h!eval [code]',
	exe(msg) {
		const args = msg.args;
		if (!args.length) return msg.client.ch.reply(msg, 'You need to provide Code to evaluate.');
		try {
			let code = args.slice(0).join(' ');
			eval(`(async () => {${code}})()`);
			msg.client.ch.reply(msg, 'Done');
		} catch (error) {
			msg.client.ch.reply(msg, `there was an error during evaluation.\n\`\`\`${error.stack}\`\`\``);
		}
		// eslint-disable-next-line no-unused-vars
		async function send(content) {
			const m = await msg.client.ch.send(msg.channel, content);
			return m;
		}
		// eslint-disable-next-line no-unused-vars
		function log(content) {
			console.log(content);
		}
	}
};