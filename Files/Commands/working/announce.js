const Discord = require('discord.js');
module.exports = {
	name: 'announce',
	Category: 'Miscellaneous',
	requiredPermissions: 4,
	description: 'Announce something to a channel in your server',
	usage: 'h!announce [channel ID or mention] [text to announce]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
	/* eslint-enable */
		if (msg.mentions.channels.first()){
			announceFunction(msg, args, msg.mentions.channels.first(), logchannelid, errorchannelID);
		} else {
			if(args[0]){
				client.channels.fetch(args[0]).then(channel => {

					if(channel && channel.id){
						announceFunction(msg, args, channel, logchannelid, errorchannelID);
					}else{
						msg.reply('this channel doesn\'t exist, be sure to provide a valid channel ID or mention 1');
					}
				}).catch(e =>{msg.reply('this channel doesn\'t exist, be sure to provide a valid channel ID or mention');
					/* eslint-disable */
									let error;
									error = e;
									/* eslint-enable */
				}).catch({});
			} else {
				msg.reply('You need to specify a channel.');
			}
		}

		async function announceFunction(msg, args, channel, logchannelid){
			const logchannel = client.channels.cache.get(logchannelid);
			
			const Text = args.slice(1).join(' ');
			if(!Text){
				msg.reply('You need to type a Text that I will announce.'); 
				return;
			}
			const AnnounceEmbed = new Discord.MessageEmbed()
				.setTitle(`Announcement by ${msg.author.username}`)
				.setColor('#b0ff00')
				.setDescription(Text)
				.setTimestamp();
			if (msg.author.id !== '318453143476371456') {
				if (channel.guild.id !== msg.guild.id) {
					msg.reply('You can\'t send cross server announcements');
					return;}}
			msg.channel.permissionsFor(client.user);
			try {
				await channel.send(AnnounceEmbed);
			} catch(error) {
				msg.reply('I cant send messages there.');
				/* eslint-disable */
				let e;
				e = error;
				/* eslint-enable */
				return; 
			}
			const AnnounceEmbedY = new Discord.MessageEmbed()
				.setColor('#b0ff00')
				.setDescription(`Announcement sent to ${channel}`)
				.setFooter(`Executed by ${msg.author.username}`)
				.setTimestamp();
			msg.channel.send(AnnounceEmbedY);
			const announceLogEmbed = new Discord.MessageEmbed()
				.setTitle(msg.author.username + ' made an announcement in the server '+ msg.guild.name)
				.setColor('#1aff00')
				.setThumbnail(msg.author.displayAvatarURL())
				.setDescription(`Announcement sent to ${channel}`)
				.setTimestamp()
				.setFooter('Executor user ID: '+msg.author.id+'\n');
			if (logchannel)logchannel.send(announceLogEmbed).catch(() => {});
		}}};