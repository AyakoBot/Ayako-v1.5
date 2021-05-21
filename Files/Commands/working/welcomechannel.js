const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'welcomechannel',
	requiredPermissions: 2, 
	Category: 'Welcome', 
	description: 'Set the welcome channel of the server',
	usage: 'h!welcomechannel [Hex color code or RANDOM] [channel ID or mention] [Ping the new member - yes or no]\nh!welcomechannel disable',
	/* eslint-disable */
    async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		let settings = [];
		const res = await pool.query(`SELECT * FROM welcome WHERE guildid = '${msg.guild.id}'`);
		if (res !== undefined) {
			if (res.rowCount !== 0) {
				settings.enabledtof = res.rows[0].enabledtof;
				settings.channelid = res.rows[0].channelid;
				settings.pingtof = res.rows[0].pingtof;
				settings.color = res.rows[0].color;
				settings.existed = true;
			} else {
				settings.enabledtof = true;
				settings.channelid = 'none';
				settings.pingtof = false;
				settings.color = 'RANDOM';
				settings.existed = false;
			}
		} else {
			settings.enabledtof = true;
			settings.channelid = 'none';
			settings.pingtof = false;
			settings.color = 'RANDOM';
			settings.existed = false;
		}

		if (args[0]) {
			if (args[0].toLowerCase() == 'disable') {
				msg.reply('Welcome Messages have been disabled');
				pool.query(`UPDATE welcome SET enabledtof = 'false' WHERE guildid = '${msg.guild.id}'`);
				return;
			}
			if (msg.mentions.channels.first()) {
				if (msg.mentions.channels.first().guild.id !== msg.guild.id) return msg.reply('You can only create welcome messages for your own server');
				welcomefunction(msg, args, msg.mentions.channels.first(), logchannelid, errorchannelID);
			} else {
				if (args[1]) {
					client.channels.fetch(args[1]).then(channel => {
						if (channel.guild.id !== msg.guild.id) return msg.reply('You can only create welcome messages for your own server');
						if (channel && channel.id) {
							welcomefunction(msg, args, channel, logchannelid, errorchannelID);
						} else {
							msg.reply('this channel doesn\'t exist, be sure to provide a valid channel ID or mention');
						}
					}).catch(() =>{msg.reply('this channel doesn\'t exist, be sure to provide a valid channel ID or mention');

					}).catch(() => {});
				} else {
					msg.reply('You need to enter a Welcome channel -> `h!welcomechannel [Hex Color Code or RANDOM] [Channel] [Ping?  yes/no]`');
				}
			}}
		if (!args[0]) return msg.reply('You need to enter a Hex Color Code or `Random` -> `h!welcomechannel [Hex Color Code or RANDOM] [Channel] [Ping?  yes/no]`');

		function welcomefunction(msg, args, channel) {
			let option;
			if (!args[2]) {return msg.reply('You have to enter a valid ping option, Should I ping the joined user? `yes` or `no` -> `h!welcomechannel [Hex Color Code or RANDOM] [Channel] [Ping?  yes/no]`');}
			if (args[2].toLowerCase() == 'yes') {
				option = true;
			} else if (args[2].toLowerCase() == 'no') {
				option = false;
			} else {
				return msg.reply('You have to enter a valid ping option, Should i ping the joined user? `yes` or `no` -> `h!welcomechannel [Hex Color Code or RANDOM] [Channel] [Ping?  yes/no]`');
			}
			var re = /[0-9A-Fa-f]{6}/g;

			if (re.test(args[0]) || args[0].toLowerCase() == 'random') {
				let text;
				settings.channelid = channel.id;
				settings.color = args[0];
				settings.pingtof = option;
				if (settings.existed == false) {
					pool.query(`INSERT INTO welcome (guildid, enabledtof, channelid, pingtof, color) VALUES ('${msg.guild.id}', 'true', '${settings.channelid}', '${settings.pingtof}', '${settings.color}')`);
				} else {
					pool.query(`
					UPDATE welcome SET enabledtof = 'true' WHERE guildid = '${msg.guild.id}';
					UPDATE welcome SET channelid = '${settings.channelid}' WHERE guildid = '${msg.guild.id}';
					UPDATE welcome SET pingtof = '${settings.pingtof}' WHERE guildid = '${msg.guild.id}';
					UPDATE welcome SET color = '${settings.color}' WHERE guildid = '${msg.guild.id}';
					`);
				}
				if (args[0].toLowerCase() == 'random') {
					text = `${channel} is now the welcome channel with a random color`;
				} else {
					text = `${channel} is now the welcome channel with\n<- This as Color`;
				}
				const embed = new Discord.MessageEmbed()
					.setColor(args[0])
					.setDescription(text);
				msg.channel.send(embed);
			} else {
				msg.reply('Whatever you entered is not a valid Hex Color Code. \nPick one here: https://htmlcolorcodes.com/ and use the `#` number of enter `random` for a random color');
			}
		}

	}};