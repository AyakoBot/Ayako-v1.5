const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'takerole',
	Category: 'Moderation',
	requiredPermissions: 3,
	description: 'Take a role from a user',
	usage: 'h!takerole [user ID or mention] [Role ID, mention or name]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {		/* eslint-enable */
		if (!msg.guild.member(client.user).permissions.has('MANAGE_ROLES')) return msg.reply('I am not able to take roles from this user. Be sure I have the "Manage Roles" permission.');
		if (msg.mentions.users.first()){
			muteFunction(msg.mentions.users.first(), logchannelid);
		} else {
			if(args[0]){
				client.users.fetch(args[0]).then(user => {

					if(user && user.id){
						muteFunction(user, logchannelid);
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


		async function muteFunction(user, logchannelid){
			if (!args[1]) msg.reply('Please mention the role or send the role ID to the role I should remove from them -> `h!takerole [user ID or mention] [role ID or mention]`');
			const rawRole = args[1];
			let role;
			if (rawRole.includes('<@&') && rawRole.includes('>')) {
				const rrole = rawRole.replace(/<@&/g, '').replace(/>/g, '');
				role = msg.guild.roles.cache.find(role => role.id === rrole);
			} else if (rawRole.length == 18 && !isNaN(rawRole)) {
				role = msg.guild.roles.cache.find(role => role.id === rawRole);
			} else {
				role = msg.guild.roles.cache.find(role => role.name.toLowerCase() === args.slice(1).join(' '));
			}
			if (!role) {
				return msg.reply('That was not a valid role, please try again -> `h!takerole [user ID or mention] [role ID or mention]`');
			}
			if (msg.guild.member(msg.author).roles.highest.rawPosition < role.rawPosition || msg.guild.member(msg.author).roles.highest.rawPosition == role.rawPosition) {
				return msg.reply('You cant manage this role since that role is either above your highest or it is your highest role.');
			} else if (msg.guild.member(client.user).roles.highest.rawPosition < role.rawPosition) {
				return msg.reply('I cant manage that role since its either my highest or above my highest role.');
			} else if (msg.guild.member(msg.author).roles.highest.rawPosition > role.rawPosition) {
				let Muterole;
				const res = await pool.query(`SELECT * FROM muterole WHERE guildid = '${msg.guild.id}'`);
				if (res !== undefined) {
					if (res.rows[0] !== undefined) {
						Muterole = msg.guild.roles.cache.find(role => role.id === res.rows[0].muteroleid);
					} else {
						Muterole = msg.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted');
					}
				} else {
					Muterole = msg.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted');
				}
				if (Muterole && Muterole == role) {
					msg.reply('You cant unmute members this way, please use the Mute commands.');
					return;
				}
				msg.guild.member(user).roles.remove(role);
				const logchannel = client.channels.cache.get(logchannelid);
				const log = new Discord.MessageEmbed()
					.setTitle(user.username + '\'s role '+ role.name+' was taken')
					.setColor('YELLOW')
					.setThumbnail(user.displayAvatarURL())
					.setDescription(`${user} got the role ${role} taken away ${msg.author}`)
					.setTimestamp()
					.setFooter('User ID: ' +user.id+ ' \nExecutor user ID: '+msg.author.id+'\n');
				const reply = new Discord.MessageEmbed()
					.setDescription(`${role} has been taken from ${user}`)
					.setColor('YELLOW')
					.setTimestamp();
				if (logchannel) logchannel.send(log).catch(() => {});
				msg.channel.send(reply).catch(() => {});
			}
		}
	} 
};