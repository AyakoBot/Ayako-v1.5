const Discord = require('discord.js');
module.exports = {
	name: 'customembed',
	Category: 'Miscellaneous',
	requiredPermissions: 4,
	description: 'Create a custom Embed and send it to any channel',
	usage: 'h!customembed [channel ID or mention]',
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
						msg.reply('this channel doesn\'t exist, be sure to provide a valid channel ID or mention');
					}
				}).catch(e=>{
					msg.reply('this channel doesn\'t exist, be sure to provide a valid user ID or mention.');
					/* eslint-disable */
				let error;
				error = e;
				/* eslint-enable */
				}).catch({});
			} else {
				msg.reply('You need to specify a channel. -> `h!customembed [channel ID or mention]`');
			}
		}

		async function announceFunction(msg, args, channel, logchannelid){
			const logchannel = client.channels.cache.get(logchannelid);
			let color;
			let title;
			let description;
			msg.channel.send(`Ok I will be sending your custom embed to ${channel}\nWhat should its title be?`);
			msg.channel.awaitMessages(m => m.author.id == msg.author.id,
				{max: 1, time: 60000}).then(collected => {
				title = collected.first().content;
				msg.channel.send(`Great, ${title} will be the title\nNext up choose the Embed Description`);
				DescFunction(msg, title);
			}).catch(() => {
				msg.reply('Time ran out. If you still want your embed, start over ');
			});
			function DescFunction(msg, title) {
				msg.channel.awaitMessages(m => m.author.id == msg.author.id,
					{max: 1, time: 60000}).then(collected => {
					description = collected.first().content;
					msg.channel.send('Awesome, last thing is the color.\nGive me a hex color code for that -> Pick one here https://htmlcolorcodes.com/color-picker/ and I need the HEX # Code');
					ColorFunction(msg, title, description);
				}).catch(() => {
					msg.reply('Time ran out. If you still want your embed, start over ');
				});
			}
			function ColorFunction(msg, title, description) {
				msg.channel.awaitMessages(m => m.author.id == msg.author.id,
					{max: 1, time: 60000}).then(collected => {
					color = collected.first().content.toUpperCase();
					var re = /[0-9A-Fa-f]{6}/g;
					if(re.test(color) || color == 'RANDOM') {
						const embed = new Discord.MessageEmbed()
							.setTitle(title)
							.setDescription(description)
							.setColor(color)
							.setTimestamp();
						channel.send(embed).catch(e =>{return msg.reply('I wasnt able to send the embed, be sure i have `Send Messages` `Embed Links` and `Attach Files` permissions in that channel\n' +e);});
						const announceLogEmbed = new Discord.MessageEmbed()
							.setTitle(msg.author.username + ' sent a custom embed to '+ channel.name)
							.setColor('#1aff00')
							.setThumbnail(msg.author.displayAvatarURL())
							.setDescription(`Custom embed sent to ${channel}`)
							.setTimestamp()
							.setFooter('Executor user ID: '+msg.author.id+'\n');
						if (logchannel)logchannel.send(announceLogEmbed).catch((e) => {console.log(e);});
						msg.channel.send(`Perfect, ive sent your Embed to ${channel}`);
					} else {msg.reply('Ohno, something was wrong with the color! Try again. What color do you want?');ColorFunction(msg, title, description);}
				}).catch((e) => {
					console.log(e);
					msg.reply('Time ran out. If you still want your embed, start over ');
				});

			}


		}}};