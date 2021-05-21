const Discord = require('discord.js');
const { pool } = require('../files/Database');
module.exports = {
	name: 'setperms',
	Category: 'ModerationAdvanced',
	requiredPermissions: 2,
	description: 'Give or remove permissions of a Staff Role (TrialModRole / ModRole / AdminRole)',
	usage: 'h!setperms [mod/trial/admin] [permission] [deny/allow]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		const role = args[0];
		if (!role) {return msg.reply('You need to tell me what perms you want to set `h!setperms [mod/trial/admin] [permission] [deny/allow]`');}
		const perm = args[1];
		const option = args[2];
		if (role == 'mod') {
			if (perm == 'ban' || perm == 'unban' || perm == 'kick' || perm == 'mute' || perm == 'unmute' || perm == 'clear' || perm == 'announce' || perm == 'tempmute' || perm == 'pardon' || perm == 'edit' || perm == 'warn' || perm == 'takerole' || perm == 'giverole') {
				if (option == 'allow') checkInsert('mod', true);
				else if (option == 'deny') checkInsert('mod', false);
				else {return msg.reply('Thats not a valid option. Please enter `deny` or `allow`');}
			} else {return msg.reply('Thats not a valid permission, please enter one of these -> `ban | unban | mute | tempmute | unmute | kick | clear | announce | pardon | edit | warn`');}
			sendfunction(msg, option, perm, 'mod');

		} else if (role == 'trial') {
			if (perm == 'ban' || perm == 'unban' || perm == 'kick' || perm == 'mute' || perm == 'unmute' || perm == 'clear' || perm == 'announce' || perm == 'tempmute' || perm == 'pardon' || perm == 'edit' || perm == 'warn' || perm == 'takerole' || perm == 'giverole') {
				if (option == 'allow') checkInsert('trial', true);
				else if (option == 'deny') checkInsert('trial', false);
				else {return msg.reply('Thats not a valid option. Please enter `deny` or `allow`');}
			} else {return msg.reply('Thats not a valid permission, please enter one of these -> `ban | unban | mute | tempmute | unmute | kick | clear | announce | pardon | edit | warn`');}
			sendfunction(msg, option, perm, 'trial');

		} else if (role == 'admin') {
			if (perm == 'ban' || perm == 'unban' || perm == 'kick' || perm == 'mute' || perm == 'unmute' || perm == 'clear' || perm == 'announce' || perm == 'tempmute' || perm == 'pardon' || perm == 'edit' || perm == 'warn' || perm == 'takerole' || perm == 'giverole') {
				if (option == 'allow') checkInsert('admin', true);
				else if (option == 'deny') checkInsert('admin', false);
				else {return msg.reply('Thats not a valid option. Please enter `deny` or `allow`');}
			} else {return msg.reply('Thats not a valid permission, please enter one of these -> `ban | unban | mute | tempmute | unmute | kick | clear | announce | pardon | edit | warn`');}
			sendfunction(msg, option, perm, 'admin');

		} else {return msg.reply('Thats not a valid moderation role. Please choose between `mod` `trial` and `admin`');}

		async function sendfunction(msg, option, perm, type) {
			const res = await pool.query(`SELECT * FROM modroles WHERE guildid = '${msg.guild.id}'`);
			let Role = type;
			if (res && res.rowCount > 0) {
				Role = msg.guild.roles.cache.find(role => role.id === (type == 'trial' ? res.rows[0].trialmodrole : type == 'mod' ? res.rows[0].modrole : res.rows[0].adminrole));
			}
			if (option == 'allow') {
				const embed = new Discord.MessageEmbed()
					.setDescription(`${Role ? Role : type} can now use the ${perm} command.`)
					.setColor('#b0ff00');
				msg.channel.send(embed);
			} else if (option == 'deny') {
				const embed = new Discord.MessageEmbed()
					.setDescription(`${Role ? Role : type} can no longer use the ${perm} command.`)
					.setColor('#b0ff00');
				msg.channel.send(embed);
			}
		}
		async function checkInsert(type, granted) {
			const res = await pool.query(`SELECT * FROM modperms WHERE guildid = '${msg.guild.id}' AND permission = '${perm}' AND type = '${type}'`);
			if (res && res.rowCount > 0) {
				pool.query(`UPDATE modperms SET granted = ${granted} WHERE guildid = '${msg.guild.id}' AND permission = '${perm}' AND type = '${type}'`);
			} else {
				pool.query(`INSERT INTO modperms (guildid, type, permission, granted) VALUES ('${msg.guild.id}', '${type}', '${perm}', ${granted})`);
			}
		}
	}};