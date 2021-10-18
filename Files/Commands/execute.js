// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');

module.exports = {
	name: 'execute',
	aliases: ['e'],
	perm: 268435456n,
	dm: true,
	takesFirstArg: false,
	// eslint-disable-next-line no-unused-vars
	async exe(msg) {
		const VT = require('../BaseClient/VTClient');
		VT.domainLookup('discordc.gift', (err, res) => {
			if (err) return console.log(err);
			return console.log(res);
		});
	}
};