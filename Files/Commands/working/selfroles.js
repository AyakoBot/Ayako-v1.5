const Discord = require('discord.js');
const { pool } = require('../files/Database');
module.exports = {
	name: 'selfroles',
	Category: 'Selfroles',
	aliases: ['listselfroles', 'lsar'],
	description: 'Show all selfroles of a server',
	usage: 'h!selfroles',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		let rolemap = '';
		const res = await pool.query(`SELECT * FROM selfroles WHERE guildid = '${msg.guild.id}'`);
		if (res !== null) {
			if (res.rowCount !== 0) {
				for (let i = 0; i < res.rowCount; i++) {
					const role = msg.guild.roles.cache.get(res.rows[i].roleid);
					if (role && role.id) {
						rolemap += `${role} - ${role.name}\n`;
					} else {
						pool.query(`DELETE FROM selfroles WHERE guildid = '${msg.guild.id}' AND roleid = '${res.rows[i].roleid}'`);
					}
				}
			} else {
				return msg.reply('There are no self assignable roles on this server yet.');
			}
		} else {
			return msg.reply('There are no self assignable roles on this server yet.');
		}

		const embed = new Discord.MessageEmbed()
			.setTitle(`${msg.guild.name} self assignable roles`)
			.setColor('b0ff00')
			.setDescription(`\u200b${rolemap}`)
			.addField('Use the roles name to un/assign them.', '`h!iam [rolename]`/`h!iamnot [rolename]`', false);
		msg.channel.send(embed);
	}};