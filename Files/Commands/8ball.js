const Discord = require('discord.js');
module.exports = {
	name: '8ball',
	perm: null,
	dm: true,
	category: 'Fun',
	description: 'Let 8ball decide!',
	usage: 'h!8ball [yes or no question]',
	async exe(msg) {
		console.log(3);
		const random = Math.floor(Math.random() * 15);
		const question = msg.args.slice(0).join(' ');
		const answer = msg.lan.answers[random];
		const Embed = new Discord.MessageEmbed()
			.setColor(msg.guild.me.displayHexColor)
			.setAuthor(msg.lan.author, msg.client.constants.standard.image, msg.client.constants.standard.invite)
			.addFields(
				{name: msg.lan.question, value: `${question}\u200b`, inline: false},
				{name: msg.lan.answer, value: `${answer}\u200b`, inline: false},
			);
		msg.client.ch.reply(msg, Embed);
	}
};