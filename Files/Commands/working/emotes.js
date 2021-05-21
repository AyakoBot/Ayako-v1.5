const Discord = require('discord.js');
module.exports = {
	name: 'emotes',
	description: 'Shows a short guide on how to get the Global emotes to work',
	ThisGuildOnly: ['298954459172700181', '366219406776336385'],
	usage: 'h!emotes',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		var EmoteEmbed;
		if (msg.guild.id == '298954459172700181') {
			EmoteEmbed = new Discord.MessageEmbed()
				.setTitle('Global Emotes are no longer')
				.setColor('#b0ff00')
				.setDescription('Discord has decided to stop supporting Global Emotes\n\n**What does that mean?**\nGlobal Emotes have been deleted on **ALL** Servers, there\'s nothing we can do about it')
				.addField('Invite Ayako here:', '([click](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot))')
				.addField('More info here:', '([click](https://ptb.discordapp.com/channels/298954459172700181/388441229064667157/751199528337539204))')
				.setTimestamp();
			msg.channel.send(EmoteEmbed);
		}
		else if (msg.guild.id == '366219406776336385') {
			EmoteEmbed = new Discord.MessageEmbed()
				.setTitle('Global Emotes are no longer')
				.setColor('#b0ff00')
				.setDescription('Discord has decided to stop supporting Global Emotes\n\n**What does that mean?**\nGlobal Emotes have been deleted on **ALL** Servers, there\'s nothing we can do about it')
				.addField('Invite Ayako here:', '([click](https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot))')
				.addField('More info here:', '([click](https://ptb.discordapp.com/channels/366219406776336385/366220160413204490/751199695136751699))')
				.setTimestamp();
			msg.channel.send(EmoteEmbed);
		} else {
			return;
		}
	}};

