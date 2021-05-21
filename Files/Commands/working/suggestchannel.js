const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'suggestchannel',
	Category: 'Suggestion',
	requiredPermissions: 3,
	description: 'Set a channel as suggestions channel',
	usage: 'h!suggestchannel [channel ID or mention]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
    /* eslint-enable */
		if (!args[0]) return msg.reply('You have to provide a channel ID or mention').catch(() => {});
		if (args[0]) {
			let channel = client.channels.cache.get(args[0]);
			if (!channel || !channel.id) {
				channel = client.channels.cache.get(args[0].replace(/<#/, '').replace(/>/g, ''));
			}
			if (!channel || !channel.id) {
				return msg.reply('That was not a valid channel ID or mention').catch(() => {});
			}
			if (channel.guild.id !== msg.guild.id) {
				return msg.reply('You cant set suggestion channels for other servers').catch(() => {});
			}
			const embed = new Discord.MessageEmbed()
				.setDescription('Test Message');
			const m = await channel.send(embed).catch(() => {msg.reply('I cant send messages or embeds in that channel, please give me server `ADMINISTRATOR` permissions or `ATTACH FILES`, `EMBED LINKS` and `VIEW CHANNEL` permissions in that channel').catch(() => {});});
			if (m && m.id) {
				m.delete().catch(() => {});
			}
			const res = await pool.query(`SELECT * FROM suggestionsettings WHERE guildid = '${msg.guild.id}'`);
			if (res) {
				if (res.rows[0]) {
					pool.query(`UPDATE suggestionsettings SET channelid = '${channel.id}' WHERE guildid = '${msg.guild.id}'`);
					msg.channel.send(`The suggestion channel <#${res.rows[0].channelid}> was replaced with ${channel}`).catch(() => {});
				} else {
					pool.query(`INSERT INTO suggestionsettings (guildid, channelid) VALUES ('${msg.guild.id}', '${channel.id}')`);
					msg.channel.send(`Alright, suggestions will from now on be posted in ${channel}`).catch(() => {});
				}
			} else {
				pool.query(`INSERT INTO suggestionsettings (guildid, channelid) VALUES ('${msg.guild.id}', '${channel.id}')`);
				msg.channel.send(`Alright, suggestions will from now on be posted in ${channel}`).catch(() => {});
			}
		}
	} 
};