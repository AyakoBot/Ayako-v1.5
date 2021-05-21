const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'boostertop',
	Category: 'Nitro',
	description: 'Displays the Top 30 Nitro Boosters of the server',
	usage: 'h!boostertop (amount of places to display)',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		if (!args[0]) args[0] = 29;
		if (args[0] > 29) args[0] = 29;
		const result = await pool.query(`SELECT * FROM nitroboosters WHERE guildid = '${msg.guild.id}'`);
		if (result.rowCount == 0) return msg.reply('There are no Nitro Boosters to display');
		if (result.rowCount !== 0) {
			let content = '';
			result.rows.sort((a,b) => b.days - a.days);


			for (let i = 0; i < result.rowCount; i++) {
				const user = `<@${result.rows[i].userid}>`;
				const days = result.rows[i].days;
				const amount = args[0];
				if (i > amount) {content += '';} else {content += `${Math.floor(i+1)}. ${user} ~ ${days} Days\n`;}
			}
 
			const leaderboard = new Discord.MessageEmbed()
				.setTitle('Booster Leaderboard')
				.setColor('#b0ff00')
				.setDescription(content)
				.setTimestamp();
			msg.channel.send(leaderboard);
		}
	}};