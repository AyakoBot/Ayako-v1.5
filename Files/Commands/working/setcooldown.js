const Discord = require('discord.js');
const ms = require('ms');
const { pool } = require('../files/Database.js');

module.exports = {
	name: 'setcooldown',
	requiredPermissions: 2,
	DMallowed: 'No',
	aliases: ['setcd'],
	description: 'Assing a cooldown to a command\nThe word `channel` will apply the cooldown to the channel the command is executed in\nThe word `server` will apply the cooldown to the whole server',
	usage: 'h!setcooldown [command name] [channel / server] [cooldown]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		let cmds;
		const logchannel = client.channels.cache.get(logchannelid);
		const AllCmds = client.commands;
		AllCmds.forEach(element => {
			if (!element.ThisGuildOnly) {
				cmds += ` \`${element.name}\` `;}
		});
		if (!args[0]) return msg.reply('What command do you want to put a cooldown on? -> `h!setcooldown [command name] [channel/server] [cooldown]`\n  View a list of all commands with `h!categories`');
		if (!args[1]) return msg.reply('Do you want this command to have a cooldown on the whole server or just this channel? -> `h!setcooldown [command name] [channel/server] [cooldown]`');
		if (!args[2]) return msg.reply('How long should the cooldown be? -> `h!setcooldown [command name] [channel/server] [cooldown]`\n If you want to remove a cooldown put `0s`');
		if(cmds.includes(args[0])){
			if (!args[2].includes('s')) return msg.reply('You need to enter a time in seconds. Example: `20s` -> `h!setcooldown [command name] [channel/server] [cooldown]`');
			if (!isNaN(ms(`${args[2]}`))) {
				if (args[1] == 'channel') {
					if (args[2] == '0s') {
						pool.query(`DELETE FROM cooldowns WHERE channelid = '${msg.channel.id}' AND command = '${args[0]}'`);
						msg.reply('Cooldown deleted.');
						const embed = new Discord.MessageEmbed()
							.setTitle('Channel Cooldown removed')
							.setDescription(`${msg.author} removed the Cooldown on command \`${args[0]}\``)
							.setTimestamp()
							.setColor('b0ff00');
						if (logchannel)logchannel.send(embed).catch(() => {});
					} else {
						const res = await pool.query(`SELECT * FROM cooldowns WHERE channelid = '${msg.channel.id}' AND command = '${args[0]}'`);
						if (res && res.rowCount > 0) pool.query(`UPDATE cooldowns SET cooldown = '${ms(args[2])}' WHERE channelid = '${msg.channel.id}' AND command = '${args[0]}'`);
						else pool.query(`INSERT INTO cooldowns (channelid, command, cooldown) VALUES ('${msg.channel.id}', '${args[0]}', '${ms(args[2])}')`);
						msg.reply('Cooldown set.');
						const embed = new Discord.MessageEmbed()
							.setTitle('Channel Cooldown set')
							.setDescription(`${msg.author} set a Cooldown on command \`${args[0]}\` - Duration: \`${args[2]}\``)
							.setTimestamp()
							.setColor('b0ff00');
						if (logchannel)logchannel.send(embed).catch(() => {});}
				} else if (args[1] == 'server') {
					if (args[2] == '0s') {
						pool.query(`DELETE FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${args[0]}'`);
						msg.reply('Cooldown deleted.');
						const embed = new Discord.MessageEmbed()
							.setTitle('Server Cooldown removed')
							.setDescription(`${msg.author} removed the Cooldown on command \`${args[0]}\``)
							.setTimestamp()
							.setColor('b0ff00');
						if (logchannel)logchannel.send(embed).catch(() => {});
					} else {
						const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${args[0]}'`);
						if (res && res.rowCount > 0) pool.query(`UPDATE cooldowns SET cooldown = '${ms(args[2])}' WHERE guildid = '${msg.guild.id}' AND command = '${args[0]}'`);
						else pool.query(`INSERT INTO cooldowns (guildid, command, cooldown) VALUES ('${msg.guild.id}', '${args[0]}', '${ms(args[2])}')`);
						msg.reply('Cooldown set.');
						const embed = new Discord.MessageEmbed()
							.setTitle('Server Cooldown set')
							.setDescription(`${msg.author} set a Cooldown on command \`${args[0]}\` - Duration: \`${args[2]}\``)
							.setTimestamp()
							.setColor('b0ff00');
						if (logchannel)logchannel.send(embed).catch(() => {});}
				} else {return msg.reply('You didnt enter a valid option `server` or `channel` -> `h!setcooldown [command name] [channel/server] [cooldown]`');}
			} else {return msg.reply('You need to enter a valid time in seconds. Example: `20s` -> `h!setcooldown [command name] [channel/server] [cooldown]`\n If you want to remove a cooldown put `0s`');}
		} else {return msg.reply('Whatever you entered isnt a valid command. -> `h!setcooldown [command name] [channel/server] [cooldown]`\n  View a list of all commands with `h!categories`');}

		
	}};