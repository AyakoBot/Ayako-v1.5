const Discord = require('discord.js');
module.exports = {
	name: 'vote',
	DMallowed: 'Yes',
	description: 'Displays all websites you can vote on for Ayako',
	usage: 'h!vote',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		const url1 = 'https://bots.discordlabs.org/bot/650691698409734151';
		const url2 = 'https://discordbotlist.com/bots/tmh';
		const url3 = 'https://top.gg/bot/650691698409734151';

		const VoteEmbed = new Discord.MessageEmbed()
			.setTitle('Vote for Ayako')
			.setAuthor('\u200b', client.user.displayAvatarURL())
			.addFields(
				{name: 'Discord Labs', value: url1, inline: false },
				{name: 'Discord Bot List', value: url2, inline: false },
				{name: 'top.gg', value: url3, inline: false },
			)
			.setColor('b0ff00')
			.setFooter('Thank you for your Support ♡');
		msg.channel.send(VoteEmbed);



	}};