const Discord = require('discord.js');
const { pool } = require('../files/Database');
module.exports = {
	name: 'antispamsettings',
	Category: 'Antispam',
	description: 'Displays the AntiSpam Settings of your server',
	usage: 'h!antispamsettings',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
	/* eslint-enable */
		let settings = [];
		let content;
		pool.query(`SELECT * FROM antispamsettings WHERE guildid = '${msg.guild.id}'`, (err, result) => {
			if (result.rows[0] == undefined) {
				content = 'You have not enabled AntiSpam yet, check `h!antispamsetup`';
				Continue(settings, content);
			} else {
				settings.guildid = result.rows[0].guildid;
				settings.bpchannelID = result.rows[0].bpchannelid;
				settings.bpuserID = result.rows[0].bpuserid;
				settings.bproleID = result.rows[0].bproleid;
				settings.antispamToF = result.rows[0].antispamtof;
				settings.giveofficialWarnsToF = result.rows[0].giveofficialwarnstof;
				settings.muteAfterWarnsAmount = result.rows[0].muteafterwarnsamount;
				settings.KickAfterWarnsAmount = result.rows[0].kickafterwarnsamount;
				settings.BanAfterWarnsAmount = result.rows[0].banafterwarnsamount;
				settings.ofWarnEnabeldToF = result.rows[0].readofwarnstof;
				settings.muteEnabledToF = result.rows[0].muteenabledtof;
				settings.kickEnabledToF = result.rows[0].kickenabledtof;
				settings.banEnabledToF = result.rows[0].banenabledtof;
				Continue(settings, content);
			}
		});
		async function Continue(settings, content) {
			const channelcheck = await channelchecker(settings);
			const rolecheck = await rolechecker(settings);
			if (channelcheck == true || rolecheck == true) {
				const res = await pool.query(`SELECT * FROM antispamsettings WHERE guildid = '${msg.guild.id}'`);
				if (res !== undefined) {
					if (res.rows[0] !== undefined) {
						settings.guildid = res.rows[0].guildid;
						settings.bpchannelID = res.rows[0].bpchannelid;
						settings.bpuserID = res.rows[0].bpuserid;
						settings.bproleID = res.rows[0].bproleid;
						settings.antispamToF = res.rows[0].antispamtof;
						settings.giveofficialWarnsToF = res.rows[0].giveofficialwarnstof;
						settings.muteAfterWarnsAmount = res.rows[0].muteafterwarnsamount;
						settings.KickAfterWarnsAmount = res.rows[0].kickafterwarnsamount;
						settings.BanAfterWarnsAmount = res.rows[0].banafterwarnsamount;
						settings.ofWarnEnabeldToF = res.rows[0].readofwarnstof;
						settings.muteEnabledToF = res.rows[0].muteenabledtof;
						settings.kickEnabledToF = res.rows[0].kickenabledtof;
						settings.banEnabledToF = res.rows[0].banenabledtof;
					} else {
						content = 'You have not enabled AntiSpam yet, check `h!antispamsetup`';
					}
				} else {
					content = 'You have not enabled AntiSpam yet, check `h!antispamsetup`';
				}
			}
			let bpchannels;
			let bpusers;
			let bproles;
			let antispam;
			let give_official_warnigs_tof;
			let mute_after_warns_amount;
			let kick_after_warns_amount;
			let ban_after_warns_amount;
			let of_warn_enabeld_tof;
			let mute_enabled_tof;
			let kick_enabled_tof;
			let ban_enabled_tof;
			let embed = new Discord.MessageEmbed();
			if (settings.bpchannelID) {bpchannels = settings.bpchannelID.map(c => `<#${c}>`);} else {bpchannels = 'No bypassed channels';}
			if (settings.bpuserID) {bpusers = settings.bpuserID.map(u => `<@${u}>`);} else {bpusers = 'No bypassed users';}
			if (settings.bproleID) {bproles = settings.bproleID.map(r => `<@&${r}>`);} else {bproles = 'No bypassed roles';}
			if (settings.antispamToF) {antispam = '<:tick:670163913370894346> Enabled';} else {antispam = '<:Cross:746392936807268474> Disabled';}
			if (settings.giveofficialWarnsToF) {give_official_warnigs_tof = '<:tick:670163913370894346> Enabled';} else {give_official_warnigs_tof = '<:Cross:746392936807268474> Disabled';}
			if (settings.muteAfterWarnsAmount) {mute_after_warns_amount = settings.muteAfterWarnsAmount;} else {mute_after_warns_amount = '<:Cross:746392936807268474> Not Set';}
			if (settings.KickAfterWarnsAmount) {kick_after_warns_amount = settings.KickAfterWarnsAmount;} else {kick_after_warns_amount = '<:Cross:746392936807268474> Not Set';}
			if (settings.BanAfterWarnsAmount) {ban_after_warns_amount = settings.BanAfterWarnsAmount;} else {ban_after_warns_amount = '<:Cross:746392936807268474> Not Set';}
			if (settings.ofWarnEnabeldToF) {of_warn_enabeld_tof = '<:tick:670163913370894346> Enabled';} else {of_warn_enabeld_tof = '<:Cross:746392936807268474> Disabled';}
			if (settings.muteEnabledToF) {mute_enabled_tof = '<:tick:670163913370894346> Enabled';} else {mute_enabled_tof = '<:Cross:746392936807268474> Disabled';}
			if (settings.kickEnabledToF) {kick_enabled_tof = '<:tick:670163913370894346> Enabled';} else {kick_enabled_tof = '<:Cross:746392936807268474> Disabled';}
			if (settings.banEnabledToF) {ban_enabled_tof = '<:tick:670163913370894346> Enabled';} else {ban_enabled_tof = '<:Cross:746392936807268474> Disabled';}
			if (content) {
				embed.setTitle(`${msg.guild.name} server AntiSpam settings`);
				embed.setDescription(`\u200b${content}`);
				embed.setColor('b0ff00');
				msg.channel.send(embed);
				return;
			}
			if (settings) {
				embed.setTitle(`${msg.guild.name} server AntiSpam settings`);
				embed.setDescription('To edit these settings visit `h!antispamsetup`');
				embed.addFields(
					{name: 'Antispam', value: antispam, inline: false},
					{name: 'Bypassed Channels:', value: `\u200b${`${bpchannels}`.replace(/,/g, '\n')}`, inline: false},
					{name: 'Bypassed Users', value: `\u200b${`${bpusers}`.replace(/,/g, '\n')}`, inline: false},
					{name: 'Bypassed Roles', value: `\u200b${`${bproles}`.replace(/,/g, '\n')}`, inline: false},
					{name: '\u200b', value: '\u200b', inline: false},
					{name: '|Give Official Warnings', value: give_official_warnigs_tof, inline: true},
					{name: '|Mute after warns amount', value: mute_after_warns_amount, inline: true},
					{name: '|Kick after warns amount', value: kick_after_warns_amount, inline: true},
					{name: '|Ban after warns amount', value: ban_after_warns_amount, inline: true},
					{name: '|Read Official Warnings', value: of_warn_enabeld_tof, inline: true},
					{name: '\u200b', value: '\u200b', inline: false},
					{name: '|Mute Members', value: mute_enabled_tof, inline: true},
					{name: '|Kick Members', value: kick_enabled_tof, inline: true},
					{name: '|Ban Members', value: ban_enabled_tof, inline: true},
				);	
				embed.setColor('b0ff00');
				embed.setAuthor('Ayako Antispam [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot');
				embed.setFooter('Edit AntiSpam options in h!antispamsetup');
				msg.channel.send(embed);
				return;
			} 
		}
		async function channelchecker(settings) {
			if (settings.bpchannelID == null) {
				return false;
			} else {
				settings.bpchannelID.forEach((channelid) => {
					const channel = msg.guild.channels.cache.get(channelid);
					if (!channel || channel == undefined) {
						const index = settings.bpchannelID.indexOf(channelid);
						if (index > -1) {
							settings.bpchannelID.splice(index, 1);
						}
						if (settings.bpchannelID.length == 0) {
							pool.query(`UPDATE antispamsettings SET bpchannelid = null WHERE guildid = '${msg.guild.id}'`);
						} else {
							pool.query(`UPDATE antispamsettings SET bpchannelid = ARRAY[${settings.bpchannelID}] WHERE guildid = '${msg.guild.id}'`);
						}
						return true;
					} else if (channel && channel.id) {
						return false;
					}
				});
			}
		}
		async function rolechecker(settings) {
			if (settings.bproleID == null) {
				return false;
			} else {
				settings.bproleID.forEach((roleid) => {
					const role = msg.guild.roles.cache.get(roleid);
					if (!role || role == undefined) {
						const index = settings.bproleID.indexOf(roleid);
						if (index > -1) {
							settings.bproleID.splice(index, 1);
						}
						if (settings.bproleID.length == 0) {
							pool.query(`UPDATE antispamsettings SET bproleid = null WHERE guildid = '${msg.guild.id}'`);
						} else {
							pool.query(`UPDATE antispamsettings SET bproleid = ARRAY[${settings.bproleID}] WHERE guildid = '${msg.guild.id}'`);
						}
						return true;
					} else if (role && role.id) {
						return false;
					}
				});
			}
		}
	}};