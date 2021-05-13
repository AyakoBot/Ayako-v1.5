const auth = require('../BaseClient/auth.json');
const reg = new RegExp(auth.token, 'g');

module.exports = {
	name: 'eval',
	perm: 0,
	category: 'Owner',
	description: 'Evaluates any JavaScript Code',
	usage: 'h!eval [code]',
	async exe(msg) {
		if (msg.author.id !== '318453143476371456') return;
		const clean = (text) => { 
			if (typeof text === 'string') return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)).replace(reg, 'TOKEN'); 
			else return text; }; 
		try { 
			let code = msg.args.slice(0).join(' ');
			let evaled = await eval(`(async () => {${code}})()`);
			if (typeof evaled !== 'string') evaled = require('util').inspect(evaled); 
			
			msg.client.ch.reply(msg, `\`\`\`q\n${clean(evaled)}\`\`\``); 
		} catch (err) { 
			msg.client.ch.reply(msg, `\`ERROR\` \`\`\`q\n${clean(err)}\n\`\`\``); 
		}
		// eslint-disable-next-line no-unused-vars
		async function send(text) {
			msg.client.ch.send(msg.channel, clean(text));
		}
	}
};
