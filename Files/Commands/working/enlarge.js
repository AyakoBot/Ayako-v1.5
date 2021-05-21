const Discord = require('discord.js');
module.exports = {
	name: 'enlarge',
	Category: 'Info',
	DMallowed: 'Yes',
	description: 'Shows a enlarged version of an emote as well as the source link',
	usage: 'h!enlarge [emote]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
                /* eslint-enable */
		if (!args[0]) return msg.reply('You need to enter an emote I should enlarge');
		for (let i = 0; args.length > i; i++) {
			const arg = args[i];
			const emote = Discord.Util.parseEmoji(arg);
			if (emote && emote.id) {
				const embed = new Discord.MessageEmbed()
					.setImage(`https://cdn.discordapp.com/emojis/${emote.id}.${emote.animated ? 'gif' : 'png'}`)
					.setColor('b0ff00')
					.setDescription(`Emote Link: https://cdn.discordapp.com/emojis/${emote.id}.${emote.animated ? 'gif' : 'png'}`)
					.setAuthor(emote.name, `https://cdn.discordapp.com/emojis/${emote.id}.${emote.animated ? 'gif' : 'png'}`, `https://cdn.discordapp.com/emojis/${emote.id}.${emote.animated ? 'gif' : 'png'}`);
				msg.channel.send(embed);
			}
		}
	}
};