const Discord = require('discord.js');
const { pool } = require('../files/Database');
module.exports = {
	name: 'selfrolesadd',
	requiredPermissions: 3,
	Category: 'Selfroles',
	aliases: ['addselfrole', 'addselfroles', 'selfroleadd'],
	description: 'Make a role Self-Assignable',
	usage: 'h!selfrolesadd [role ID or mention]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (!args[0]) {
			return msg.reply('You need to tell me what role you want to remove');
		}
		const entry = args[0];
		if (entry.length == 22) {
			if (entry.includes('<@&') && entry.includes('>')) {
				let role = msg.guild.roles.cache.find(r => r.id == entry.replace(/<@&/g, '').replace(/>/g, ''));
				gotRole(role);
				return;
			}
		} else if (entry.length == 18 && !isNaN(entry)) {
			let role = msg.guild.roles.cache.find(r => r.id == entry);
			gotRole(role);
		} else {
			const rolename = args.slice(0).join(' ');
			let role = msg.guild.roles.cache.find(r => r.name.toLowerCase() == rolename.toLowerCase());
			gotRole(role);
		}
		async function gotRole(role) {
			if (role && role.id) {
				const res = await pool.query(`SELECT * FROM selfroles WHERE guildid = '${msg.guild.id}' AND roleid = '${role.id}'`);
				if (res !== null) {
					if (res.rowCount !== 0) {
						msg.reply('This role is already self-assignable');
						return;
					} else {
						pool.query(`INSERT INTO selfroles (guildid, roleid) VALUES ('${msg.guild.id}', '${role.id}')`);
						const embed = new Discord.MessageEmbed()
							.setColor('b0ff00')
							.setDescription(`${role} is now self-assignable`);
						msg.channel.send(embed);
					}
				} else {
					pool.query(`INSERT INTO selfroles (guildid, roleid) VALUES ('${msg.guild.id}', '${role.id}')`);
					const embed = new Discord.MessageEmbed()
						.setColor('b0ff00')
						.setDescription(`${role} is now self-assignable`);
					msg.channel.send(embed);
				}
			} else {
				msg.reply('The role you provided was not valid, please try again.');
				return;
			}

		}
	}
};