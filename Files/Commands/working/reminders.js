const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
const moment = require('moment');
require('moment-duration-format');
module.exports = {
	name: 'reminders',
	Category: 'Miscellaneous',
	description: 'Show your current reminders',
	usage: 'h!reminders',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		const embed = new Discord.MessageEmbed()
			.setColor('b0ff00')
			.setTitle(`Reminders of ${msg.author.username}`)
			.setFooter('Remove reminders with [h!reminder delete]');
		const res = await pool.query(`SELECT * FROM reminders WHERE userid = '${msg.author.id}'`);
		if (res !== undefined && res.rows[0] !== undefined) {
			for (let i = 0; i < res.rowCount; i++) {
				const duration = moment.duration(res.rows[i].duration - Date.now()).format(' D [days], H [hrs], m [mins], s [secs]');
				embed.addField(`Ends in: \`${duration}\`\nReminder ID: \`${res.rows[i].rnr}\``, `Set in: <#${res.rows[i].channelid}>\n\`\`\`${res.rows[i].text}\`\`\`\n᲼`);
			}
			msg.channel.send(embed);
		} else {
			msg.reply('You have no reminders set.');
		}
	}};