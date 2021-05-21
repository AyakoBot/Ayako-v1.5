const Discord = require('discord.js');
const NekoClient = require('nekos.best-api');
const Neko = new NekoClient();

module.exports = {
	name: 'neko',
	Category: 'Fun',
	description: 'Shows a random Neko picture',
	usage: 'h!neko (category)',
	aliases: ['nekos'],
/* eslint-disable */
  async execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
    /* eslint-enable */
		const arg = args[0] ? args[0].toLowerCase() : 'none';
		const embed = new Discord.MessageEmbed()
			.setAuthor('Random Neko', 'https://ayakobot.com', 'https://nekos.best-api.com')
			.setFooter('Powered by nekos.best')
			.setColor('b0ff00');
		let image;
		if (arg == 'cuddle') {
			image = Neko.cuddle();
		} else 
		if (arg == 'feed') {
			image = Neko.feed();
		} else 
		if (arg == 'hug') {
			image = Neko.hug();
		} else     
		if (arg == 'kiss') {
			image = Neko.kiss();
		} else     
		if (arg == 'pat') {
			image = Neko.pat();
		} else     
		if (arg == 'poke') {
			image = Neko.poke();
		} else     
		if (arg == 'slap') {
			image = Neko.slap();
		} else 
		if (arg == 'tickle') {
			image = Neko.tickle();
		} else {
			image = Neko.nekos();
		}
		embed.setImage(image);
		msg.channel.send(embed);
	}
};