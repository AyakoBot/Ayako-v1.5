const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
const ms = require('ms');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
	name: 'reminder',
	Category: 'Miscellaneous',
	aliases: ['remind'],
	DMallowed: 'Yes',
	description: 'Set or delete a reminder',
	usage: 'h!reminder set [duration] [text]\nh!remidner delete [reminder ID]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (!args[0]) return msg.reply('Do you want to `set` or `delete` a reminder?\n`h!reminder set [duration] [text]`\n`h!reminder delete [reminder ID]`');
		const option = args[0].toLowerCase();
		if (option == 'set') {
			const remindertext = args.slice(2).join(' ');
			const duration = ms(args[1]);
			if (!duration) return msg.reply('You need to specify when I should remind you.');
			if (!remindertext) return msg.reply('You need to tell me what I should remind you of.');
			if (isNaN(duration)) return msg.reply('The duration you entered wasnt valid');
			if (ms(duration) < 5000) return msg.reply('You need to specify a time larger than 5 seconds');
			const RemindEmbed = new Discord.MessageEmbed()
				.setDescription('Ok! I will remind you in '+ms(duration))
				.setTimestamp()
				.setColor('#b0ff00');
			msg.channel.send(RemindEmbed);
			await pool.query(`INSERT INTO reminders (text, duration, channelid, userid) VALUES ('${remindertext}', '${Date.now() + duration}', '${msg.channel.id}', '${msg.author.id}')`);
			const res = await pool.query('SELECT * FROM reminders');
			if (res !== undefined && res.rows[0] !== undefined) {
				for (let i = 0; i < res.rowCount; i++) {
					const text = res.rows[i].text;
					const channelid = res.rows[i].channelid;
					const duration = res.rows[i].duration;
					const userid = res.rows[i].userid;
					pool.query(`UPDATE reminders SET rnr = '${i}' WHERE channelid = '${channelid}' AND duration = '${duration}' AND userid = '${userid}' AND text = '${text.replace('\'', '').replace('`', '')}';`);
				}
			}
		}
		else if (option == 'delete') {
			if (!args[1]) return msg.reply('Whats the reminder ID? -> `h!reminder delete [reminder ID]`');
			if (isNaN[args[1]]) return msg.reply('That wasnt a valid reminder ID, try again.');
			const res = await pool.query(`SELECT * FROM reminders WHERE rnr = '${args[1]}' AND userid = '${msg.author.id}';`);
			if (res == undefined || res.rows[0] == undefined) return msg.reply('I couldnt find any reminders with the matching reminder ID, check your reminders in `h!reminders`');
			const text = res.rows[0].text;
			const duration = moment.duration(res.rows[0].duration - Date.now()).format(' D [days], H [hrs], m [mins], s [secs]');
			pool.query(`DELETE FROM reminders WHERE userid = '${msg.author.id}' AND rnr = '${args[1]}';`);
			const embed = new Discord.MessageEmbed()
				.setDescription(`Deleted your reminder with the text\`\`\`${text}\`\`\``)
				.setColor('b0ff00')
				.setFooter('It would have ended in '+duration);
			msg.channel.send(embed);
		} else {
			msg.reply('Do you want to `set` or `delete` a reminder?\n`h!reminder set [duration] [text]`\n`h!reminder delete [reminder ID]`');
		}
	}};
