const Discord = require('discord.js');
module.exports = {
	name: 'avatar',
	aliases: ['av', 'pfp'],
	perm: null,
	dm: true,
	takesFirstArg: false,
	async exe(msg) {
		const user = msg.args[0] ? await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')) : msg.author;
		const avatarEmbed = new Discord.MessageEmbed()
			.setAuthor(msg.client.ch.stp(msg.lan.avatarOf, {user: user}), msg.client.constants.standard.image, msg.client.ch.displayAvatarURL(user))
			.setImage(msg.client.ch.displayAvatarURL(user))
			.setTimestamp()
			.setColor(msg.client.ch.colorGetter(msg.guild ? msg.guild.me : null))
			.setFooter(msg.client.ch.stp(msg.language.requestedBy, {user: msg.author}));
		msg.channel.send(avatarEmbed);
	}
};