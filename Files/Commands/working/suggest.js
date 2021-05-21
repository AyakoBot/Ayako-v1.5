const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'suggest',
	Category: 'Suggestion',
	description: 'Send a suggestion to the previously set Suggestion channel',
	usage: 'h!suggest [suggestion]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
    /* eslint-enable */
		if (!args[0]) return msg.reply('You have to provide a suggestion').catch(() => {});
		if (args[0]) {
			let channel;
			const res = await pool.query(`SELECT * FROM suggestionsettings WHERE guildid = '${msg.guild.id}'`);
			if (res) {
				if (res.rows[0]) {
					if (res.rows[0].blusers) {
						if (res.rows[0].blusers.includes(msg.author.id)) {
							return msg.reply('You have been banned from sending suggestions on this server.').catch(() => {});
						}
					}
					channel = client.channels.cache.get(res.rows[0].channelid);
				} else {
					msg.channel.send('There is no suggestion channel set for this server').catch(() => {});
					return;
				}
			} else {
				msg.channel.send('There is no suggestion channel set for this server').catch(() => {});
				return;
			}
			const embed = new Discord.MessageEmbed()
				.setAuthor(msg.author.tag, 'https://ayakobot.com', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setThumbnail(msg.author.displayAvatarURL())
				.setDescription(args.slice(0).join(' '))
				.setColor('b0ff00')
				.setFooter('User ID: '+msg.author.id)
				.setTimestamp();
			const m = await channel.send(embed).catch(() => {});
			m.react('670163913370894346').catch(() => {});
			m.react('746392936807268474').catch(() => {});
			const ms = await msg.reply('You suggestion was sent!').catch(() => {});
			msg.delete().catch(() => {});
			ms.delete({timeout: 10000}).catch(() => {});
		}
	} 
};