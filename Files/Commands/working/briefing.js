const Discord = require('discord.js');
module.exports = {
	name: 'briefing',
	ThisGuildOnly: ['692452151112368218'],
	requiredPermissions: 1,
	description: 'Send a briefing message to <#751501958464012509>',
	usage: 'h!briefing [text]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		const promotion = args.slice(0).join(' ');
		if (!promotion) return msg.reply('You need to tell me what you want to suggest');
		const SuggestEmbed = new Discord.MessageEmbed()
			.setTitle('Idea from '+ msg.author.username)
			.setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL())
			.setDescription(promotion)
			.setTimestamp()
			.setColor('#b0ff00');
		msg.channel.send('<:tick:670163913370894346>');
		client.channels.cache.get('751501958464012509').send(SuggestEmbed)
			.then(m => {
				m.react('670163913370894346');
				m.react('746392936807268474');
			});

	}
};