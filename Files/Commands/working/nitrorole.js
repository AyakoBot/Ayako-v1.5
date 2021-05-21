const Discord = require('discord.js');
const { pool } = require('../files/Database');
module.exports = {
	name: 'nitrorole',
	Category: 'Nitro',
	aliases: ['nitroroles'],
	requiredPermissions: 4,
	description: 'Set a Role reward when a user reaches a specified amount of boosting days',
	usage: 'h!nitrorole [role ID or mention] [amount of days]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
    /* eslint-enable */
		if (!args[0]) return msg.reply('You need to tell me the role you want to give to members for boosting -> `h!nitrorole [role ID or Mention] [amount of days]`').catch(() => {});
		if (!args[1]) return msg.reply('You need to tell me the after how many days boosters will receive that role -> `h!nitrorole [role ID or Mention] [amount of days]`').catch(() => {});
		const rawRole = args[0];
		const days = args[1];
		let role;
		if (rawRole.length == 22 && isNaN(rawRole) && rawRole.includes('<@&') && rawRole.includes('>')) {
			let rawrole = rawRole.replace(/<@&/g, '').replace(/>/g, '');
			const rrole = msg.guild.roles.cache.find(r => r.id == rawrole);
			if (!rrole || !rrole.id) {
				notValid('The mention you entered is not valid. Please try again.');
			} else if (rrole && rrole.id) {
				role = rrole;
			} else {
				notValid('The mention you entered is not valid. Please try again.');
			}
		} else if (rawRole.length == 18 && !isNaN(rawRole)) {
			const rrole = msg.guild.roles.cache.find(r => r.id == rawRole);
			if (!rrole || !rrole.id) {
				notValid('The mention you entered is not valid. Please try again.');
			} else if (rrole && rrole.id) {
				role = rrole;
			} else {
				notValid('The mention you entered is not valid. Please try again.');
			}
		} else {
			notValid('The mention you entered is not valid. Please try again.');
		}
		if (isNaN(days)) return msg.reply('The count of days you entered was not a valid number. Try again.').catch(() => {});
		finish();
		async function finish() {
			if (role && role.id) {
				let query;
				const res = await pool.query(`SELECT * FROM nitroroles WHERE roleid = '${role.id}' AND guildid = '${msg.guild.id}'`);
				if (res.rowCount == 1) {
					query = `UPDATE nitroroles SET days = '${days}' WHERE roleid = '${role.id}' AND guildid = '${msg.guild.id}';`;
				}
				if (res.rowCount == 0) {
					query = `INSERT INTO nitroroles (guildid, roleid, days) VALUES (${msg.guild.id}, ${role.id}, ${days});`;
				}
				pool.query(query);
				const embed = new Discord.MessageEmbed()
					.setTitle('Role Set')
					.setColor('b0ff00')
					.setDescription(`Boosters will receive the role ${role} after ${days} days of boosting.`);
				msg.channel.send(embed).catch(() => {});
			} else {
				notValid('The role you entered was not valid, try again.');
			}
		}

		function notValid(content) {
			if (!content) {content = 'That was not a valid answer, please try again.';}
			msg.reply(content).catch(() => {});
		}
	}};
