const auth = require('../BaseClient/auth.json');
const reg = new RegExp(auth.token, 'g');
// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const ms = require('ms');

module.exports = {
	name: 'eval',
	perm: 0,
	dm: true,
	takesFirstArg: true,
	async exe(msg) {
		if (msg.author.id !== auth.ownerID) return;
		const clean = (text) => { 
			if (typeof text === 'string') return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)).replace(reg, 'TOKEN'); 
			else return text; }; 
		try { 
			let code = `${msg.args.slice(0).join(' ')}`;
			if (code.startsWith('```')) code = code.replace(/```js/g, '').replace(/```/g, '');
			let evaled = await eval(`(async () => {${code}})()`);
			if (typeof evaled !== 'string') evaled = require('util').inspect(evaled); 
			
			if (evaled.length > 2000) msg.client.ch.reply(msg, 'Too long, check console'), console.log(evaled); 
			else msg.client.ch.reply(msg, `\`\`\`q\n${clean(evaled)}\`\`\``); 
		} catch (err) { 
			if (err.length > 2000) msg.client.ch.reply(msg, 'Too long, check console'), console.log(err); 
			else msg.client.ch.reply(msg, `\`ERROR\` \`\`\`q\n${clean(err)}\n\`\`\``); 
		}
		// eslint-disable-next-line no-unused-vars
		async function send(text) {
			msg.client.ch.send(msg.channel, {content: clean(text)});
		}
	}
};
