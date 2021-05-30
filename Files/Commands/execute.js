const Discord = require('discord.js');

module.exports = {
	name: 'execute',
	aliases: ['e'],
	perm: 268435456n, 
	dm: true,
	takesFirstArg: false,
	// eslint-disable-next-line no-unused-vars
	exe(msg) {
		return require('superagent').post(`https://discord.com/api/channels/${msg.channel.id}/messages`).set('Authorization', `Bot ${msg.client.token}`).send({ content: 'hi', components: [{ type: 1, components: [{ custom_id: '1', style: 1, type: 2, label: 'Enter' }]}]});
	}
};