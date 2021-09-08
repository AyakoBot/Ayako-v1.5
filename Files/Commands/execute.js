const Discord = require('discord.js');

module.exports = {
	name: 'execute',
	aliases: ['e'],
	perm: 268435456n, 
	dm: true,
	takesFirstArg: false,
	// eslint-disable-next-line no-unused-vars
	async exe(msg) {
		const answer = 'abc';
		const collected = await msg.channel.awaitMessages({time: 60000, max: 1}).catch((e) => {console.log(e)});
		if (!collected.first()) return msg.channel.send({content: 'no one answered in time'});
		const replied = collected.first().content;
		if (replied.toLowerCase() == answer) collected.first().reply({content: 'yay you made it'});
		else collected.first().reply({content: 'you screwed up'});	}
};