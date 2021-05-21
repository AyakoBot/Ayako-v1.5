const { pool } = require('../files/Database.js');
const Discord = require('discord.js');
module.exports = {
	name: 'muterole',
	Category: 'Moderation',
	requiredPermissions: 3,
	description: 'Set a MuteRole',
	usage: 'h!muterole [role ID or mention]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		let newMuteRole = args[0];
		if (!newMuteRole) return msg.reply('You need to tell me what you want me to do -> `h!muterole [role ID or mention]` or `h!muterole clear`');
		if (isNaN(newMuteRole)){
			if (newMuteRole.includes('<@&')) {
				newMuteRole = newMuteRole.replace(/<@&/g, '').replace(/>/g, '');
				newMuteRole = msg.guild.roles.cache.get(newMuteRole);
				const txt = `${newMuteRole}`;
				if (txt == 'undefined') {
					return msg.reply('That wasnt a valid role -> `h!muterole [role ID or mention]`');
				} else {
					Finishing(newMuteRole);
				}
			} else {
				return msg.reply('That wasnt a valid role -> `h!muterole [role ID or mention]`');
			}
		} else {
			newMuteRole = msg.guild.roles.cache.get(newMuteRole);
			const txt = `${newMuteRole}`;
			if (txt == 'undefined') {
				return msg.reply('That wasnt a valid role -> `h!muterole [role ID or mention]`');
			} else {
				Finishing(newMuteRole);
			}
		}
				
		function Finishing(newMuteRole) {
			pool.query(`SELECT muteroleid FROM muterole WHERE guildid = '${msg.guild.id}'`, (err, result) => {
				let sql;
				const restext = `${result.rows[0]}`;
				if (restext == 'undefined') {
					sql = `INSERT INTO muterole (guildid, muteroleid) VALUES ('${msg.guild.id}', '${newMuteRole.id}')`;
					const logchannel = client.channels.cache.get(logchannelid);
					const LogEmbed = new Discord.MessageEmbed()
						.setTitle('Muterole was set')
						.setDescription(`${msg.author} set ${newMuteRole} to be the Muterole.`)
						.setColor('#b0ff00')
						.setTimestamp();
					if (logchannel)logchannel.send(LogEmbed).catch(() => {});
					const embed = new Discord.MessageEmbed()
						.setDescription(`MuteRole was set to ${newMuteRole}`)
						.setColor('b0ff00');
					msg.channel.send(embed);
					pool.query(sql);
				} else {
					sql = `UPDATE muterole SET muteroleid = '${newMuteRole.id}' WHERE guildid = '${msg.guild.id}'`;
					const logchannel = client.channels.cache.get(logchannelid);
					const LogEmbed = new Discord.MessageEmbed()
						.setTitle('Muterole was Updated')
						.setDescription(`${msg.author} set ${newMuteRole} to be the Muterole.`)
						.setColor('#b0ff00')
						.setTimestamp();
					if (logchannel)logchannel.send(LogEmbed).catch(() => {});
					const embed = new Discord.MessageEmbed()
						.setDescription(`MuteRole was set to ${newMuteRole}`)
						.setColor('b0ff00');
					msg.channel.send(embed);
					pool.query(sql);
				}
			});
		}
	}
};