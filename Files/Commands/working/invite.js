const Discord = require('discord.js');

module.exports = {
	name: 'invite',
	DMallowed: 'Yes',
	aliases: ['support'],
	description: 'Displays Ayako\'s Invite and Support Server Invite',
	usage: 'h!invite',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		const inviteEmbed = new Discord.MessageEmbed()
			.setTitle('Click here to invite the bot')
			.setURL('https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
			.setAuthor('Click here to join the Ayako support server', client.user.displayAvatarURL(), 'https://discord.gg/GNpcspBbDr')
			.setColor('#b0ff00')
			.setTimestamp();
		msg.channel.send(inviteEmbed);
	}
};