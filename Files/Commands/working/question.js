const Discord = require('discord.js');
module.exports = {
	name: 'question',
	ThisGuildOnly: ['298954459172700181'],
	cooldown: 60,
	aliases: ['ask'],
	description: 'Send a question in the Question of the Day channel',
	usage: 'h!question [question]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		if (msg.channel.id == '715136490526474261') {
			const question = args.slice(0).join(' ');
			const QOTDembed = new Discord.MessageEmbed()
				.setTitle(question)
				.setColor('#b0ff00')
				.setFooter(`Asked by ${msg.author.username}`)
				.setTimestamp();
			msg.channel.send(QOTDembed).then(m => {m.pin();});
		}else{return;}
	}};