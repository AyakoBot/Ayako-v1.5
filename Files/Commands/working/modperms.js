const Discord = require('discord.js');
const { pool } = require('../files/Database');

module.exports = {
	name: 'modperms',
	Category: 'ModerationAdvanced',
	requiredPermissions: 6,
	description: 'Display the permissions of the current ModRole',
	usage: 'h!modperms',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        /* eslint-enable */
		const res = await pool.query(`SELECT * FROM modroles WHERE guildid = '${msg.guild.id}'`);
		if (res && res.rowCount > 0 && res.rows[0].modrole) {
			const role = res.rows[0].modrole;
			const res2 = await pool.query(`SELECT * FROM modperms WHERE guildid = '${msg.guild.id}' AND type = 'mod'`);
			let ban = '<:Cross:746392936807268474> No';
			let unban = '<:Cross:746392936807268474> No';
			let kick = '<:Cross:746392936807268474> No';
			let mute = '<:Cross:746392936807268474> No';
			let unmute = '<:Cross:746392936807268474> No';
			let clear = '<:Cross:746392936807268474> No';
			let announce = '<:Cross:746392936807268474> No';
			let tempmute = '<:Cross:746392936807268474> No';
			let pardon = '<:Cross:746392936807268474> No';
			let edit = '<:Cross:746392936807268474> No';
			let warn = '<:Cross:746392936807268474> No';
			let giverole = '<:Cross:746392936807268474> No';
			let takerole = '<:Cross:746392936807268474> No';
			if (res2 && res2.rowCount > 0) {
				for (let i = 0; res2.rows.length > i; i++) {
					const r = res2.rows[i];
					if (r.permission == 'ban' && r.granted) ban = '<:tick:670163913370894346> Yes';
					if (r.permission == 'unban' && r.granted) unban = '<:tick:670163913370894346> Yes';
					if (r.permission == 'kick' && r.granted) kick = '<:tick:670163913370894346> Yes';
					if (r.permission == 'mute' && r.granted) mute = '<:tick:670163913370894346> Yes';
					if (r.permission == 'unmute' && r.granted) unmute = '<:tick:670163913370894346> Yes';
					if (r.permission == 'clear' && r.granted) clear = '<:tick:670163913370894346> Yes';
					if (r.permission == 'announce' && r.granted) announce = '<:tick:670163913370894346> Yes';
					if (r.permission == 'tempmute' && r.granted) tempmute = '<:tick:670163913370894346> Yes';
					if (r.permission == 'pardon' && r.granted) pardon = '<:tick:670163913370894346> Yes';
					if (r.permission == 'edit' && r.granted) edit = '<:tick:670163913370894346> Yes';
					if (r.permission == 'warn' && r.granted) warn = '<:tick:670163913370894346> Yes';
					if (r.permission == 'takerole' && r.granted) takerole = '<:tick:670163913370894346> Yes';
					if (r.permission == 'giverole' && r.granted) giverole = '<:tick:670163913370894346> Yes';
				}
			}
			const Embed = new Discord.MessageEmbed()
				.setTitle('ModRole permissions')
				.setColor('#b0ff00')
				.setDescription('Edit Role with the command \n`h!setperms [mod/trial/admin] [permission] [deny/allow]`\n Role: <@&'+role+'>')
				.addFields(
					{ name:'Ban Members' , value:ban , inline: true },
					{ name:'Unban Users' , value:unban , inline: true },
					{ name:'Kick Members' , value:kick , inline: true },
					{ name:'Mute Members' , value:mute , inline: true },
					{ name:'Tempmute Members' , value:tempmute , inline: true},
					{ name:'Unmute Members' , value:unmute , inline: true},
					{ name:'Clear Messages', value:clear , inline: true},
					{ name:'Announce' , value:announce , inline: true},
					{ name:'Warn Members' , value:warn , inline: true},
					{ name:'Edit Warnings' , value:edit , inline: true},
					{ name:'Pardon Warnings' , value:pardon , inline: true},
					{ name:'Give Roles' , value:giverole , inline: true},
					{ name:'Take Roles' , value:takerole , inline: true},
				);
			msg.channel.send(Embed);
		} else {
			msg.reply('You have to set a ModRole before you can use this command.');
		}
	}
};