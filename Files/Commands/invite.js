const Discord = require('discord.js');

module.exports = {
	name: 'invite',
	perm: null,
	dm: true,
	takesFirstArg: false,
	aliases: ['support'],
	type: 'info',
	async execute(msg) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.lan.author, msg.client.constants.commands.invite.author.image, msg.client.constants.standard.invite)
			.setDescription(msg.client.ch.stp(msg.lan.desc, {invite: msg.client.constants.standard.invite, help: msg.client.constants.standard.support}))
			.setColor(msg.client.constants.standard.color);
		msg.client.ch.reply(msg, embed);
	}
};


