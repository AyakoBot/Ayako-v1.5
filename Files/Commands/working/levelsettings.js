const Discord = require('discord.js');
const { pool } = require('../files/Database');
module.exports = {
	name: 'levelsettings',
	Category: 'Leveling',
	description: 'Display the current level settings of the server',
	usage: 'h!levelsettings',
	/* eslint-disable */
	async execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
    /* eslint-enable */
		let settings = [];
		let roles = 'Level - Role\n';
		const res = await pool.query(`SELECT * FROM levelsettings WHERE guildid = '${msg.guild.id}'`);
		if (res !== undefined && res.rows[0] !== undefined) {	
			settings = res.rows[0];
		} else {
			settings = [];
			settings.disabled = false;
			settings.xpgain = 1;
			settings.blchannelid = [];
			settings.lvlupmode = 'silent';
		}
		const resR = await pool.query(`SELECT * FROM levelroles WHERE guildid = '${msg.guild.id}'`);
		if (resR !== undefined && res.rows[0] !== undefined) {	
			resR.rows.sort((a,b) => a.level - b.level);
			for (let i = 0; i < resR.rowCount; i++) {
				const rolecheck = await rolechecker(resR.rows[i].roleid);
				if (rolecheck == false) {
					roles += `${resR.rows[i].level} - <@&${resR.rows[i].roleid}>\n`;
				}
			}
		} else {
			roles = 'No roles set';
		}
		const channelcheck = await channelchecker(settings);
		if (channelcheck == true) {
			const res2 = await pool.query(`SELECT * FROM levelsettings WHERE guildid = '${msg.guild.id}'`);
			if (res2 !== undefined && res2.rows[0] !== undefined) {	
				settings = res2.rows[0];
			} else {
				settings = [];
				settings.disabled = false;
				settings.xpgain = 1;
				settings.blchannelid = [];
				settings.lvlupmode = 'silent';
			}
		}

		let blchannels;
		let xpgain;
		let leveling;
		let embed = new Discord.MessageEmbed();
		if (settings.blchannelid) {blchannels = settings.blchannelid.map(c => `<#${c}>`);} else {blchannels = 'There are no "No level" channels';}
		if (settings.xpgain) {xpgain = settings.xpgain;} else {xpgain = '1';}
		if (settings.disabled) {leveling = '<:Cross:746392936807268474> Disabled';} else {leveling = '<:tick:670163913370894346> Enabled';}
		if (settings.lvlupmode == 'messages' && settings.lvlupchannel) settings.lvlupmode = `${settings.lvlupmode} <#${settings.lvlupchannel}>`;
		if (settings) {
			embed.setTitle(`${msg.guild.name} server Leveling settings`);
			embed.addFields(
				{name: '\u200b', value: '**Settings**', inline: false},
				{name: 'Leveling', value: '\u200b'+leveling, inline: false},
				{name: 'No Level Channels:', value: '\u200b'+blchannels, inline: false},
				{name: 'XP Gain multiplier', value: '\u200b'+xpgain+'x', inline: false},
				{name: 'Levleroles', value: '\u200b'+roles, inline: false},
				{name: 'Level-up mode', value: '\u200b'+settings.lvlupmode, inline: false},
				{name: '\u200b', value: '**Settings Edit Help**', inline: false},
				{name: '`h!leveling enable`/`h!leveling disable`', value: 'Enables or Disables Leveling Completely \n**(It is recommended to use Level-Up mode `silent` instead)**', inline: false},
				{name: '`h!leveling nolevelchannel [set/delete] [channel ID or Mention]`', value: 'Enables or Disables Leveling in a specific Channel', inline: false},
				{name: '`h!leveling xpgain [new multiplier]`', value: 'Edit the Leveling Multiplier (ranges from x0.1 to x5.0)', inline: false},
				{name: '`h!levelrole [Role ID, Mention or Name] [Level]`', value: 'Role Rewards upon advancing to the specified level (Use `0` to remove a role)', inline: false},
				{name: '`h!leveling levelupmode [silent/reactions/messages]`', value: 'Set the way Level-Ups will be indicated', inline: false},
				{name: '`h!leveling levelupchannel [channel ID or Mention/trigger]`', value: 'Set the Channel where Level-Up messages will be sent \n**(Only works on Level-Up mode `messages`)**\nOption `trigger` is the channel in which the level-up was triggered', inline: false},
			);	
			embed.setColor('b0ff00');
			embed.setAuthor('Ayako Leveling [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot');
			embed.setFooter('Edit Leveling options in h!leveling');
			msg.channel.send(embed);
		}

		async function channelchecker(settings) {
			if (settings.blchannelid == null) {
				return false;
			} else {
				settings.blchannelid.forEach((channelid) => {
					const channel = msg.guild.channels.cache.get(channelid);
					if (!channel || channel == undefined) {
						const index = settings.blchannelid.indexOf(channelid);
						if (index > -1) {
							settings.blchannelid.splice(index, 1);
						}
						if (settings.blchannelid.length == 0) {
							pool.query(`UPDATE levelsettings SET blchannelid = null WHERE guildid = '${msg.guild.id}'`);
						} else {
							pool.query(`UPDATE levelsettings SET blchannelid = ARRAY[${settings.blchannelid}] WHERE guildid = '${msg.guild.id}'`);
						}
						return true;
					} else if (channel && channel.id) {
						return false;
					}
				});
			}
		}
		async function rolechecker(roleid) {
			const role = msg.guild.roles.cache.get(roleid);
			if (!role || role == undefined) {
				pool.query(`DELETE FROM levelroles WHERE roleid = '${roleid}' AND guildid = '${msg.guild.id}'`);
				return true;
			} else if (role && role.id) {
				return false;
			}
		}
	}
};