const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'welcomemessage',
	requiredPermissions: 2, 
	Category: 'Welcome', 
	description: 'Set a welcome message new members will be greeted with\n`{user} will be replaced with a mention of the new joined member',
	usage: 'h!welcomemessage [message]',
	/* eslint-disable */
    async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (!args[0]) return msg.reply('You need to enter a Welcome Message -> `h!welcomemessage [message]`');
		const res = await pool.query(`SELECT * FROM welcome WHERE guildid = '${msg.guild.id}'`);
		if (res !== undefined) {
			if (res.rowCount !== 0) {
				let Message = args.slice(0).join(' ');
				let NewMessage;
				if (Message.includes('{user}')) {
					NewMessage = Message.replace(/{user}/g, msg.author);
				} else {
					NewMessage = Message;
				}
				const embed = new Discord.MessageEmbed()
					.setTitle('This is now the Welcome Message')
					.setColor('b0ff00')
					.setDescription(NewMessage);
				msg.channel.send(embed);
				Message = Message.replace(/'/g, '%u205').replace(/`/g, '%o205').replace(/{user}/g, '%i205');
				pool.query(`UPDATE welcome SET text = '${Message}' WHERE guildid = '${msg.guild.id}'`);
			} else {
				return msg.reply('Start the Welcome Message Setup first -> `h!welcomechanne`');
			}
		} else {
			return msg.reply('Start the Welcome Message Setup first -> `h!welcomechanne`');
		}
	}
};