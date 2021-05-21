const Discord = require('discord.js');
module.exports = {
	name: 'inv',
	ThisGuildOnly: ['692452151112368218'],
	requiredPermissions: 5,
	description: 'Send a suggestion vote',
	usage: 'h!inv [mc or discord] [username]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		const promotion = args.slice(1).join(' ');
		const channel = args[0];
		if (!channel) return msg.reply('You need to tell me what channel you want this invite to be in -> `h!inv MC/Discord [user]`');
		if (!promotion) return msg.reply('You need to tell me who\'s up to be invited?');
		if (channel.toLowerCase() == 'mc') {
			const SuggestEmbed = new Discord.MessageEmbed()
				.setTitle('Should this player be invited to TA Infinite MC server?')
				.setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL())
				.setDescription(promotion)
				.setTimestamp()
				.setColor('#b0ff00');
			msg.channel.send('<:tick:670163913370894346>');
			client.channels.cache.get('773310464700579851').send(SuggestEmbed)
				.then(m => {
					m.react('670163913370894346');
					m.react('746392936807268474');
				});
		} else if (channel.toLowerCase() == 'discord') {
			const SuggestEmbed = new Discord.MessageEmbed()
				.setTitle('Should this player be invited to this Discord?')
				.setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL())
				.setDescription(promotion)
				.setTimestamp()
				.setColor('#b0ff00');
			msg.channel.send('<:tick:670163913370894346>');
			client.channels.cache.get('747820337361846354').send(SuggestEmbed)
				.then(m => {
					m.react('670163913370894346');
					m.react('746392936807268474');
				});
		} else {
			return msg.reply('That was not a valid channel option. -> `h!inv MC/Discord [user]`');
		}
	}
};