const Discord = require('discord.js');
const { pool } = require('../files/Database');
module.exports = {
	name: 'iam',
	Category: 'Selfroles',
	description: 'Give yourself a Self-Assignable Role',
	usage: 'h!iam [role name]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (!msg.guild.member(client.user).permissions.has('MANAGE_ROLES')) {return msg.reply('I dont have enough permissions to do that').catch(() => {});}
		if (!args[0]) {
			return msg.reply('You need to tell me what role you want to add');
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
			msg.delete({ timeout: 5000 }).catch(() => {});
			if (role && role.id) {
				const res = await pool.query(`SELECT * FROM selfroles WHERE guildid = '${msg.guild.id}' AND roleid = '${role.id}'`);
				if (res !== undefined) {
					if (res.rowCount !== 0) {
						if (!msg.guild.member(msg.author).roles.cache.has(role.id)) {
							msg.guild.member(msg.author).roles.add(role).catch(() => {});
							const embed = new Discord.MessageEmbed()
								.setColor('b0ff00')
								.setDescription(`You now have the ${role} role`);
							msg.channel.send(embed).then((m) => {m.delete({ timeout: 10000 }).catch(() => {});}).catch(() => {});
						} else {
							msg.reply('You already have this role').then((m) => {m.delete({ timeout: 10000 }).catch(() => {});}).catch(() => {});
							return;
						}
					} else {
						msg.reply('There are no self-assignable roles yet.').then((m) => {m.delete({ timeout: 10000 }).catch(() => {});}).catch(() => {});
						return;
					}
				} else {
					msg.reply('There are no self-assignable roles yet.').then((m) => {m.delete({ timeout: 10000 }).catch(() => {});}).catch(() => {});
					return;
				}
			} else {
				return msg.reply('This role either doesnt exist or isnt self-assignable.').then((m) => {m.delete({ timeout: 10000 }).catch(() => {});}).catch(() => {});
			}
		}
	}
};