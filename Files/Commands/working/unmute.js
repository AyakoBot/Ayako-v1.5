const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'unmute',
	Category: 'Moderation',
	description: 'Unmutes a User',
	usage: 'h!unmute [user ID or mention]',
	requiredPermissions: 3,
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (msg.mentions.users.first()){
			unmuteFunction(msg.mentions.users.first(), logchannelid);
		} else {
			if(args[0]){
				client.users.fetch(args[0]).then(user => {

					if(user && user.id){
						unmuteFunction(user, logchannelid);
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
				msg.reply('You need to specify a user.');
			}
		}


		function unmuteFunction(user, logchannelid){
			if (!msg.guild.member(user)) return msg.reply('This user is not a member of this server');
			const logchannel = client.channels.cache.get(logchannelid);
			let MuteRole;
			pool.query(`SELECT muteroleid FROM muterole WHERE guildid = '${msg.guild.id}'`, (err, result) => {
				const restext = `${result.rows[0]}`;
				if (restext !== 'undefined') {
					MuteRole = msg.guild.roles.cache.find(role => role.id === result.rows[0].muteroleid);
					MuteRoleF(MuteRole);
					return;
				} else {
					MuteRoleF(MuteRole);
					return;
				}
			});

			function 
			MuteRoleF(MuteRole) {
				if (!MuteRole) MuteRole = msg.guild.roles.cache.find(role => role.name === 'Muted');
				const Muteroletext = `${MuteRole}`;
				if (!MuteRole || Muteroletext == 'undefined') {
					return msg.reply('There is no MuteRole set for this server. Either create a role named `Muted` or use the `h!muterole` command.');
				}
				if (!msg.guild.member(user).roles.cache.has(MuteRole.id)) {
					return msg.reply('This user isnt muted.');
				}
				if (msg.guild.member(client.user).roles.highest.rawPosition < MuteRole.rawPosition) {
					return msg.reply('I cant unmute anyone since the MuteRole is above my highest role on the Role List.');
				}
				var DMunmuteEmbed = new Discord.MessageEmbed()
					.setDescription('You have been unmuted.')
					.setColor('#1aff00')
					.setTimestamp();
				var unmuteLogEmbed = new Discord.MessageEmbed()
					.setTitle(`${user.username} was unmuted in the server `+msg.guild.name)
					.setDescription(`${user} has been unmuted by ${msg.author}`)
					.setFooter(`Unmuted user ID: ${user.id}\nExecutor user ID: `+msg.author.id+'\n')
					.setThumbnail(user.displayAvatarURL())
					.setTimestamp()
					.setColor('#1aff00');
				const unmutedEmbed = new Discord.MessageEmbed()
					.setDescription(`${user} has been unmuted`)
					.setColor('#1aff00')
					.setTimestamp();
				msg.channel.send(unmutedEmbed);
				if (logchannel)logchannel.send(unmuteLogEmbed).catch(() => {});
				msg.guild.member(user).roles.remove(MuteRole);
				user.send(DMunmuteEmbed).catch(() => {});
				pool.query(`UPDATE warns SET closed = 'true' WHERE guildid = '${msg.guild.id}' AND userid = '${user.id}' AND type = 'Mute';`);
			}}}};

