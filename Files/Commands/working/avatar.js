const Discord = require('discord.js');
module.exports = {
	name: 'avatar',
	Category: 'Info',
	aliases: ['av', 'pfp'],
	DMallowed: 'Yes',
	description: 'Display your or the avatar of someone else in big',
	usage: 'h!avatar (user ID or mention)',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
	/* eslint-enable */
		if (msg.mentions.users.first()){
			avatarFunction(msg.mentions.users.first());
		} else {
			if(args[0]){
				client.users.fetch(args[0]).then(user => {

					if(user && user.id){
						avatarFunction(user);
					}else{
						msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 1');
					}
				}).catch(e=>{
					msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 2');
					/* eslint-disable */
				let error;
				error = e;
				/* eslint-enable */
				}).catch({});
			} else {
				let user = msg.author;
				avatarFunction(user);
			}
		}
		function avatarFunction(user){
			const avatarEmbed = new Discord.MessageEmbed()
				.setTitle(`Avatar of ${user.username}`)
				.setImage(user.displayAvatarURL({
					dynamic: true,
					size: 2048,
					format: 'png'
				}))
				.setTimestamp()
				.setColor('#b0ff00')
				.setFooter(`Requested by ${msg.author.username}`);
			msg.channel.send(avatarEmbed);
		}
	}};