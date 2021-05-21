const Discord = require('discord.js');
module.exports = {
	name: 'delemote',
	requiredPermissions: 0,
	Category: 'Owner',
	description: 'Deletes an emote',
	usage: 'h!delemote [server] [emote name]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		const errorchannel = client.channels.cache.get(errorchannelID);
		if (!msg.guild.member(msg.author).permissions.has('MANAGE_EMOJIS')) return;
		let Server = '';
		if (args[0] == 'a') {
			Server = client.guilds.cache.get('298954459172700181');
		} 
		if (args[0] == 'b') {
			Server = client.guilds.cache.get('720173111445684285');  
		}
		if (args[0] == 'c') {
			Server = msg.guild;
		}
		const Emojiname = args[1];
		const emote = client.emojis.cache.find(emoji => emoji.name === args[1]); 
    
		setTimeout(() => {
			msg.delete();
		}, 1);
		const emoji = new Discord.GuildEmoji(client, emote, Server);
		emoji.delete();
		msg.reply(`Deleted emoji with name ${Emojiname}`).catch(error => { 
			const errorEmbed = new Discord.MessageEmbed()
				.setColor('RED')
				.setDescription(`${msg}\n\`\`\`${error}\`\`\``)
				.setTimestamp();
			errorchannel.send(errorEmbed);
		}).then(send => { setTimeout(function(){ try{ send.delete(); }catch(error) {                
			const errorEmbed = new Discord.MessageEmbed()
				.setColor('RED')
				.setDescription(`${msg}\n\`\`\`${error}\`\`\``)
				.setTimestamp();
			errorchannel.send(errorEmbed);}  }, 4000);  }).catch();
	}};