const Discord = require('discord.js');
module.exports = {
	name: 'contact',
	cooldown: 10000,
	DMallowed: 'Yes',
	description: 'Contact the Ayako Bot Devs and send them a Message',
	usage: 'h!contact [message]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		const tta = args.slice(0).join(' ');
		if (!tta) return msg.reply('You need to specify what you want me to send to the Bot Owner');
		const SuggestEmbed = new Discord.MessageEmbed()
			.setAuthor(`${msg.author.tag} / ${msg.author.id} / ${msg.guild.name}`, msg.author.displayAvatarURL())
			.setDescription(tta)
			.addField('\u200B', `${msg.url}`);
		client.channels.cache.get('745080980431175792').send(SuggestEmbed);
		const SuggestReplyEmbed = new Discord.MessageEmbed()
			.setTitle('Thank you for your contact')
			.setDescription('We will look at this as soon as we can and notify you if theres an update.')
			.addField('Your User ID has been saved, in case of command abuse we will exclude you from using this command again.', '\u200B')
			.setTimestamp()
			.setColor('#b0ff00s');
		msg.channel.send(SuggestReplyEmbed);

	}
};