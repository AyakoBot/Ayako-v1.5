
const Discord = require('discord.js');
const { pool } = require('../files/Database.js');

module.exports = {
	name: 'messagelog',
	Category: 'Miscellaneous',
	requiredPermissions: 2,
	aliases: ['msglog'],
	description: 'Set Ayakos Message logging channel',
	usage: 'h!messagelog [channel ID or mention]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (args[0] == 'disable') {
			const res = await pool.query(`SELECT * FROM logchannel WHERE guildid = '${msg.guild.id}'`);
			if (res && res.rowCount > 0) {
				if (res.rows[0].modlogs) pool.query(`UPDATE logchannel SET msglogs = null WHERE guildid = '${msg.guild.id}'`);
				else pool.query(`DELETE FROM logchannel WHERE guildid = '${msg.guild.id}'`);
			}
			msg.reply('Message Logs are now disabled. To enable them again restart the Logchannel setup process');}
		else if (args[0]) {
			if (msg.mentions.channels.first()){
				modlogFunction(msg, args, msg.mentions.channels.first(), logchannelid, errorchannelID);
			} else {
				if(args[0]){
					client.channels.fetch(args[0]).then(channel => {

						if(channel && channel.id){
							modlogFunction(msg, args, channel, logchannelid, errorchannelID);
						}else{
							msg.reply('this channel doesn\'t exist, be sure to provide a valid channel ID or mention');
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
			}}
		if (!args[0]) {msg.reply('Please provide an valid Channel ID or `disable` to disable message logging.');}

		async function modlogFunction(msg, args, channel){
			try {
				const LogEmbed = new Discord.MessageEmbed()
					.setTitle('This is now the Message Log channel')
					.setDescription(`${msg.author} set this channel as Message Log channel.`)
					.setColor('#b0ff00')
					.setTimestamp();
				channel.send(LogEmbed).catch(e=>{msg.reply('Please provide an valid Channel ID and be sure I am allowed to `View Channel` `Send Messages` `Embed Links` `Attach files`.');
					/* eslint-disable */
					let error;
					error = e;
					/* eslint-enable */
				});
				const res = await pool.query(`SELECT * FROM logchannel WHERE guildid = '${msg.guild.id}'`);
				if (res && res.rowCount > 0) {
					if (res.rows[0].modlogs) msg.reply(`The earlier msglogs channel <#${res.rows[0].msglogs}> has been switched to ${channel}`);
					else msg.reply(`Alright I will from now on post Message Logs in ${channel}.`);
					pool.query(`UPDATE logchannel SET msglogs = '${channel.id}' WHERE guildid = '${msg.guild.id}'`);
				} else {
					pool.query(`INSERT INTO logchannel (guildid, msglogs) VALUES ('${msg.guild.id}', '${channel.id}')`);
					msg.reply(`Alright I will from now on post Message Logs in ${channel}.`);
				}
			} catch(error) {msg.reply('Please provide an valid Channel ID and be sure I am allowed to `View Channel` `Send Messages` `Embed Links` `Attach files`.');
				/* eslint-disable */
				let e;
				e = error;
				/* eslint-enable */
			}}
	}
};