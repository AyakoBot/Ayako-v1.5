const Discord = require('discord.js');
module.exports = {
	name: 'promotion',
	ThisGuildOnly: ['692452151112368218'],
	requiredPermissions: 5,
	description: 'Send a vote if a user should get a promotion or not',
	usage: 'h!promotion [username]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		const promotion = args.slice(1).join(' ');
		if (!promotion) return msg.reply('You need to tell me who\'s up for a promotion');

		if (args[0] == 'net') {
			var channel = client.channels.cache.get('746668871611842621');
		} else if (args[0] == 'gold') {
			channel = client.channels.cache.get('747820337361846354');
		} else {return msg.reply('That is not a valid option. Options avaliable -> `gold` for Gold voting, `net` for Netherite Voting') ;}
		msg.channel.send('<:tick:670163913370894346>');
		const SuggestEmbed = new Discord.MessageEmbed()
			.setTitle('Should this player be promoted?')
			.setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL())
			.setDescription(promotion)
			.setTimestamp()
			.setColor('#b0ff00');
		channel.send(SuggestEmbed).then(m => {
			m.react('670163913370894346');
			m.react('746392936807268474');
		});
	}
};