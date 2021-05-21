const { pool } = require('../files/Database.js');
const Discord = require('discord.js');
module.exports = {
	name: 'giveawaydelete',
	Category: 'Giveaway',
	requiredPermissions: 2,
	description: 'Delete a running Giveaway',
	usage: 'h!giveawaydelete [message ID]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID) {
        /* eslint-enable */
		if(!args[0] || isNaN(args[0])) return msg.reply('You need to enter a valid Message ID -> `h!giveawaydelete [message ID]`');
		const res = await pool.query(`SELECT * FROM giveawaysettings WHERE messageid = '${args[0]}'`);
		if (res) {
			if (res.rows[0]) {
				msg.reply('Are you sure you want to delete this giveaway? Reply with `yes`');
				const collected = await msg.channel.awaitMessages(m => m.author.id == msg.author.id, {max: 1, time: 60000});
				if (!collected) return;
				const answer = collected.first().content.toLowerCase();
				if (answer == 'y' || answer == 'yes' || answer == 'confirm') {
					const gmsg = await client.channels.cache.get(res.rows[0].channelid).messages.fetch(res.rows[0].messageid).catch(() => {});
					const embed = new Discord.MessageEmbed()
						.setColor('b0ff00')
						.setDescription('This Giveaway was deleted');
					gmsg.edit(embed).catch(() => {});
					pool.query(`DELETE FROM giveawaysettings WHERE messageid = '${args[0]}'`);
					msg.reply('Giveaway was deleted.');
				} else {
					msg.reply('Aborted.');
					return;
				}
			} else {
				msg.reply('I wasn\'t able to find that Giveaway, please check the Message ID');
			}
		} else {
			msg.reply('I wasn\'t able to find that Giveaway, please check the Message ID');
		}
	}
};