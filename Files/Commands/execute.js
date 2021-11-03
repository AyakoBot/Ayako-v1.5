// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const request = require('request');

module.exports = {
	name: 'execute',
	aliases: ['e'],
	perm: 268435456n,
	dm: true,
	takesFirstArg: false,
	// eslint-disable-next-line no-unused-vars
	async execute(msg) {
		request({ method: 'HEAD', url: 'https://bit.ly/3BHTbJk', followAllRedirects: true },
			function (error, response) {
				console.log(response.request.href);
			});
	}
};