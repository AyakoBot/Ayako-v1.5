const Discord = require('discord.js');
const { pool } = require('../files/Database');
module.exports = {
	name: 'levelrole',
	Category: 'Leveling',
	aliases: ['levelroles'],
	requiredPermissions: 4,
	description: 'Set a levelrole which will be given when a user reaches a specified level',
	usage: 'h!levelrole [role ID or mention] [required Level]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
    /* eslint-enable */
		if (!args[0]) return msg.reply('You need to tell me the role you want to give to members for leveling -> `h!levelrole [role ID or Mention] [amount of levels]`');
		if (!args[1]) return msg.reply('You need to tell me the after how many levels members will receive that role -> `h!levelrole [role ID or Mention] [amount of levels]`');
		const rawRole = args[0];
		const level = args[1];
		let role;
		if (args[0].toLowerCase() == 'delete') {
			if (!args[1]) return msg.reply('You need to tell me what role you want to delete **IMPORTANT** for this task, I need the Role **ID**');
			if (isNaN(args[1])) return msg.reply('That was not a valid Role ID\nTo get the role ID, mention the role and put a \\ directly infront of the mentioned role, **no spaces or anything**, then send the message. The Role ID will appear');
			pool.query(`DELETE FROM levelroles WHERE guildid = '${msg.guild.id}' AND roleid = '${args[1]}'`,);
			msg.reply('The role was successfully deleted.');
		} else{
			role = msg.guild.roles.cache.get(rawRole.replace(/\D+/g, ''));
			if (!role || !role.id) {
				role = msg.guild.roles.cache.find(r => r.name.toLowerCase = rawRole.toLowerCase());
			}
			if (!role || !role.id) {
				notValid('The role you mentioned was not valid, try again');
			}
		}
		if (isNaN(level)) return msg.reply('The amount of levels you entered was not a valid number. Try again.');
		if (role && role.id) {
			finish();
		} else {
			notValid('That role was not valid, try again');
		}
		async function finish() {
			let query;
			const res = await pool.query(`SELECT * FROM levelroles WHERE roleid = '${role.id}' AND guildid = '${msg.guild.id}'`);
			if (res.rowCount == 1) {
				query = `UPDATE levelroles SET level = '${level}' WHERE roleid = '${role.id}' AND guildid = '${msg.guild.id}';`;
			}
			if (res.rowCount == 0) {
				query = `INSERT INTO levelroles (guildid, roleid, level) VALUES ('${msg.guild.id}', '${role.id}', '${level}');`;
			}
			pool.query(query);
			const embed = new Discord.MessageEmbed()
				.setTitle('Role Set')
				.setColor('b0ff00')
				.setDescription(`Members will receive the role ${role} after achieving level ${level}.`);
			msg.channel.send(embed);
		}

		function notValid(content) {
			if (!content) {content = 'That was not a valid answer, please try again.';}
			msg.reply(content);
		}
	}};
