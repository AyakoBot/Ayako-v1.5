const Discord = require('discord.js');

module.exports = {
	name: '8ball',
	perm: null,
	dm: true,
	takesFirstArg: true,
	async exe(msg) {
		const random = Math.floor(Math.random() * 15);
		const question = msg.args.slice(0).join(' ');
		const answer = msg.lan.answers[random];
		const Embed = new Discord.MessageEmbed()
			.setColor(msg.client.ch.colorGetter(msg.guild ? msg.guild.me : null))
			.setAuthor(msg.lan.author, msg.client.constants.standard.image, msg.client.constants.standard.invite)
			.addFields(
				{name: msg.lan.question, value: `${question}\u200b`, inline: false},
				{name: msg.lan.answer, value: `${answer}\u200b`, inline: false},
			);
		msg.client.ch.reply(msg, Embed);
	}
};