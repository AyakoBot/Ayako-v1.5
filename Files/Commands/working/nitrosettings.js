const Discord = require('discord.js');
const { pool } = require('../files/Database');
module.exports = {
	name: 'nitrosettings',
	Category: 'Nitro',
	description: 'Dispaly the current Nitro settings of the server',
	usage: 'h!nitrosettings',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
	/* eslint-enable */
		let rolemap = '';
		let activeBoosterAmount;
		let inactiveBoosterAmount;
		let allBoosters;
		const resS = await pool.query(`SELECT * FROM nitrosettings WHERE guildid = '${msg.guild.id}'`);
		const resR = await pool.query(`SELECT * FROM nitroroles WHERE guildid = '${msg.guild.id}'`);

		const resB = await pool.query(`SELECT * FROM nitroboosters WHERE guildid = '${msg.guild.id}'`);
		if (resS.rowCount == 0) return msg.reply('There are no settings I can display, start by setting up your Nitro Boosters with `h!nitrosetup`').catch(() => {});
		if (resR.rowCount == 0) rolemap = 'No roles set.';
		if (resB.rowCount == 0) allBoosters = 0;
		if (resR.rowCount !== 0) {
			for (let i = 0; i < resR.rowCount; i++) {
				const rolecheck = await rolechecker(resR.rows[i].roleid);
				if (rolecheck == false) {
					rolemap += `<@&${resR.rows[i].roleid}> - ${resR.rows[i].days} Days\n`;
				}
			}
		}
		if (resB.rowCount !== 0) allBoosters = resB.rowCount++;
		const resI = await pool.query(`SELECT * FROM nitroboosters WHERE guildid = '${msg.guild.id}' AND stillactive = 'false'`);
		const resA = await pool.query(`SELECT * FROM nitroboosters WHERE guildid = '${msg.guild.id}' AND stillactive = 'true'`);
		if (resI.rowCount == 0) inactiveBoosterAmount = 0;
		if (resA.rowCount == 0) activeBoosterAmount = 0;
		if (resI.rowCount !== 0) inactiveBoosterAmount = resI.rowCount++;
		if (resA.rowCount !== 0) activeBoosterAmount = resA.rowCount++;
		const embed = new Discord.MessageEmbed();
		embed.setTitle(`${msg.guild.name} server Nitro settings`);
		embed.setDescription('To edit these settings visit `h!nitrosetup`\nNitro Roles: \n'+rolemap);
		embed.addFields(
			{name: '\u200b', value: '\u200b', inline: false},
			{name: 'Nitro Booster Role', value: `<@&${resS.rows[0].boosterroleid}>`, inline: false},
			{name: 'Nitro Log Channel:', value: `<#${resS.rows[0].nitrologchannelid}>`, inline: false},
			{name: '\u200b', value: '\u200b', inline: false},
			{name: '|All boosters', value: allBoosters+' Boosters', inline: true},
			{name: '|Inactive Boosters', value: inactiveBoosterAmount+' Boosters', inline: true},
			{name: '|Active Boosters', value: activeBoosterAmount+' Boosters', inline: true},
			{name: '\u200b', value: 'Number of boosters not correct?\n Wait till 2-3 am GMT', inline: false},
		);	
		embed.setColor('b0ff00');
		embed.setAuthor('Ayako Nitro Monitor [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot');
		embed.setFooter('Edit Nitro Settings in h!nitrosetup');
		msg.channel.send(embed).catch(() => {});

		async function rolechecker(roleid) {
			const role = msg.guild.roles.cache.get(roleid);
			if (!role || role == undefined) {
				pool.query(`DELETE FROM nitroroles WHERE roleid = '${roleid}' AND guildid = '${msg.guild.id}'`);
				return true;
			} else if (role && role.id) {
				return false;
			}
		}
	}};