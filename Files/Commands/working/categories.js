const Discord = require('discord.js');
const { pool } = require('../files/Database.js');

module.exports = {
	name: 'categories',
	DMallowed: 'Yes',
	description: 'Display all of Ayako\'s Command Categories',
	usage: 'h!categories',
	/* eslint-disable */
	async execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
        /* eslint-enable */
		const AllCmds = client.commands;
		let cmds = [];
		cmds.Moderation = [];
		cmds.Moderation.cmds = '';
		cmds.ModerationAdvanced = [];
		cmds.ModerationAdvanced.cmds = '';
		cmds.Fun = [];
		cmds.Fun.cmds = '';
		cmds.Selfroles = [];
		cmds.Selfroles.cmds = '';
		cmds.Miscellaneous = [];
		cmds.Miscellaneous.cmds = '';
		cmds.Info = [];
		cmds.Info.cmds = '';
		cmds.Suggestion = [];
		cmds.Suggestion.cmds = '';
		cmds.Antispam = [];
		cmds.Antispam.cmds = '';
		cmds.Welcome = [];
		cmds.Welcome.cmds = '';
		cmds.Giveaway = [];
		cmds.Giveaway.cmds = '';
		cmds.Nitro = [];
		cmds.Nitro.cmds = '';
		cmds.Leveling = [];
		cmds.Leveling.cmds = '';
		cmds.Blacklist = [];
		cmds.Blacklist.cmds = '';
		cmds.Unsorted = [];
		cmds.Unsorted.cmds = '';
		cmds.Owner = [];
		cmds.Owner.cmds = '';
		
		AllCmds.forEach(async element => {
			let cooldownAmount;
			if (element.Category == 'Moderation') {				
				if (!element.ThisGuildOnly) {
					const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${element.name}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						cooldownAmount = r.cooldown;
					}
					if (cooldownAmount) {cmds.Moderation.cmds += ` \`${element.name}\` Cd: ${cooldownAmount / 1000}s | `;}
					else {cmds.Moderation.cmds += ` \`${element.name}\``;}
				}
			}
			if (element.Category == 'ModerationAdvanced') {				
				if (!element.ThisGuildOnly) {
					const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${element.name}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						cooldownAmount = r.cooldown;
					}
					if (cooldownAmount) {cmds.ModerationAdvanced.cmds += ` \`${element.name}\` Cd: ${cooldownAmount / 1000}s | `;}
					else {cmds.ModerationAdvanced.cmds += ` \`${element.name}\``;}
				}
			}
			if (element.Category == 'Fun') {				
				if (!element.ThisGuildOnly) {
					const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${element.name}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						cooldownAmount = r.cooldown;
					}
					if (cooldownAmount) {cmds.Fun.cmds += ` \`${element.name}\` Cd: ${cooldownAmount / 1000}s | `;}
					else {cmds.Fun.cmds += ` \`${element.name}\``;}
				}
			}
			if (element.Category == 'Selfroles') {				
				if (!element.ThisGuildOnly) {
					const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${element.name}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						cooldownAmount = r.cooldown;
					}
					if (cooldownAmount) {cmds.Selfroles.cmds += ` \`${element.name}\` Cd: ${cooldownAmount / 1000}s | `;}
					else {cmds.Selfroles.cmds += ` \`${element.name}\``;}
				}
			}
			if (element.Category == 'Miscellaneous') {				
				if (!element.ThisGuildOnly) {
					const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${element.name}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						cooldownAmount = r.cooldown;
					}
					if (cooldownAmount) {cmds.Miscellaneous.cmds += ` \`${element.name}\` Cd: ${cooldownAmount / 1000}s | `;}
					else {cmds.Miscellaneous.cmds += ` \`${element.name}\``;}
				}
			}
			if (element.Category == 'Info') {				
				if (!element.ThisGuildOnly) {
					const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${element.name}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						cooldownAmount = r.cooldown;
					}
					if (cooldownAmount) {cmds.Info.cmds += ` \`${element.name}\` Cd: ${cooldownAmount / 1000}s | `;}
					else {cmds.Info.cmds += ` \`${element.name}\``;}
				}
			}
			if (element.Category == 'Suggestion') {				
				if (!element.ThisGuildOnly) {
					const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${element.name}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						cooldownAmount = r.cooldown;
					}
					if (cooldownAmount) {cmds.Suggestion.cmds += ` \`${element.name}\` Cd: ${cooldownAmount / 1000}s | `;}
					else {cmds.Suggestion.cmds += ` \`${element.name}\``;}
				}
			}
			if (element.Category == 'Antispam') {				
				if (!element.ThisGuildOnly) {
					const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${element.name}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						cooldownAmount = r.cooldown;
					}
					if (cooldownAmount) {cmds.Antispam.cmds += ` \`${element.name}\` Cd: ${cooldownAmount / 1000}s | `;}
					else {cmds.Antispam.cmds += ` \`${element.name}\``;}
				}
			}
			if (element.Category == 'Welcome') {				
				if (!element.ThisGuildOnly) {
					const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${element.name}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						cooldownAmount = r.cooldown;
					}
					if (cooldownAmount) {cmds.Welcome.cmds += ` \`${element.name}\` Cd: ${cooldownAmount / 1000}s | `;}
					else {cmds.Welcome.cmds += ` \`${element.name}\``;}
				}
			}
			if (element.Category == 'Giveaway') {				
				if (!element.ThisGuildOnly) {
					const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${element.name}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						cooldownAmount = r.cooldown;
					}
					if (cooldownAmount) {cmds.Giveaway.cmds += ` \`${element.name}\` Cd: ${cooldownAmount / 1000}s | `;}
					else {cmds.Giveaway.cmds += ` \`${element.name}\``;}
				}
			}
			if (element.Category == 'Nitro') {				
				if (!element.ThisGuildOnly) {
					const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${element.name}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						cooldownAmount = r.cooldown;
					}
					if (cooldownAmount) {cmds.Nitro.cmds += ` \`${element.name}\` Cd: ${cooldownAmount / 1000}s | `;}
					else {cmds.Nitro.cmds += ` \`${element.name}\``;}
				}
			}
			if (element.Category == 'Leveling') {				
				if (!element.ThisGuildOnly) {
					const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${element.name}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						cooldownAmount = r.cooldown;
					}
					if (cooldownAmount) {cmds.Leveling.cmds += ` \`${element.name}\` Cd: ${cooldownAmount / 1000}s | `;}
					else {cmds.Leveling.cmds += ` \`${element.name}\``;}
				}
			}
			if (element.Category == 'Blacklist') {				
				if (!element.ThisGuildOnly) {
					const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${element.name}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						cooldownAmount = r.cooldown;
					}
					if (cooldownAmount) {cmds.Blacklist.cmds += ` \`${element.name}\` Cd: ${cooldownAmount / 1000}s | `;}
					else {cmds.Blacklist.cmds += ` \`${element.name}\``;}
				}
			}
			if (!element.Category) {				
				if (!element.ThisGuildOnly) {
					const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${element.name}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						cooldownAmount = r.cooldown;
					}
					if (cooldownAmount) {cmds.Unsorted.cmds += ` \`${element.name}\` Cd: ${cooldownAmount / 1000}s | `;}
					else {cmds.Unsorted.cmds += ` \`${element.name}\``;}
				}
			}
			if (element.reqiredPermissions == 0) {				
				if (!element.ThisGuildOnly) {
					const res = await pool.query(`SELECT * FROM cooldowns WHERE guildid = '${msg.guild.id}' AND command = '${element.name}'`);
					if (res && res.rowCount > 0) {
						const r = res.rows[0];
						cooldownAmount = r.cooldown;
					}
					if (cooldownAmount) {cmds.Owner.cmds += ` \`${element.name}\` Cd: ${cooldownAmount / 1000}s | `;}
					else {cmds.Owner.cmds += ` \`${element.name}\``;}
				}
			}
		});
		const res = await pool.query(`SELECT * FROM disabled WHERE guildid = '${msg.guild.id}'`);
		cmds.Moderation.state = '<:tick:670163913370894346> Enabled';
		cmds.ModerationAdvanced.state = '<:tick:670163913370894346> Enabled';
		cmds.Fun.state = '<:tick:670163913370894346> Enabled';
		cmds.Selfroles.state = '<:tick:670163913370894346> Enabled';
		cmds.Suggestion.state = '<:tick:670163913370894346> Enabled';
		cmds.Antispam.state = '<:tick:670163913370894346> Enabled';
		cmds.Giveaway.state = '<:tick:670163913370894346> Enabled';
		cmds.Welcome.state = '<:tick:670163913370894346> Enabled';
		cmds.Nitro.state = '<:tick:670163913370894346> Enabled';
		cmds.Leveling.state = '<:tick:670163913370894346> Enabled';
		cmds.Blacklist.state = '<:tick:670163913370894346> Enabled';
		cmds.Info.state = '<:tick:670163913370894346> Enabled';
		cmds.Miscellaneous.state = '<:tick:670163913370894346> Enabled';
		if (res) {
			if (res.rows[0]) {
				const r = res.rows[0];
				if (r.moderation == false)  {cmds.Moderation.state = '<:Cross:746392936807268474> Disabled';}
				if (r.moderationadvanced == false)  {cmds.ModerationAdvanced.state = '<:Cross:746392936807268474> Disabled';}
				if (r.fun == false)  {cmds.Fun.state = '<:Cross:746392936807268474> Disabled';}
				if (r.selfroles == false)  {cmds.Selfroles.state = '<:Cross:746392936807268474> Disabled';}
				if (r.suggestion == false)  {cmds.Suggestion.state = '<:Cross:746392936807268474> Disabled';}
				if (r.antispam == false)  {cmds.Antispam.state = '<:Cross:746392936807268474> Disabled';}
				if (r.giveaway == false)  {cmds.Giveaway.state = '<:Cross:746392936807268474> Disabled';}
				if (r.welcome == false)  {cmds.Welcome.state = '<:Cross:746392936807268474> Disabled';}
				if (r.nitro == false)  {cmds.Nitro.state = '<:Cross:746392936807268474> Disabled';}
				if (r.leveling == false)  {cmds.Leveling.state = '<:Cross:746392936807268474> Disabled';}
				if (r.blacklist == false)  {cmds.Blacklist.state = '<:Cross:746392936807268474> Disabled';}
				if (r.info == false)  {cmds.Info.state = '<:Cross:746392936807268474> Disabled';}
				if (r.miscellaneous == false)  {cmds.Miscellaneous.state = '<:Cross:746392936807268474> Disabled';}
			}
		}
		const CategoryEmbed = new Discord.MessageEmbed()
			.setTitle('All Command Categories')
			.setColor('b0ff00')
			.setDescription('Enable or Disable Command Categories by typing \n`h!settings [enable / disable] [command Category]`')
			.addFields(
				{name: `Moderation ${cmds.Moderation.state}`, value:`${cmds.Moderation.cmds}\u200b`, inline: false},
				{name: `Moderation (Advanced) ${cmds.ModerationAdvanced.state}`, value:`${cmds.ModerationAdvanced.cmds}\u200b` , inline: false},
				{name: `Fun ${cmds.Fun.state}`, value:`${cmds.Fun.cmds}\u200b` , inline: false},
				{name: `Self Roles ${cmds.Selfroles.state}`, value:`${cmds.Selfroles.cmds}\u200b` , inline: false},
				{name: `Suggestion ${cmds.Suggestion.state}`, value:`${cmds.Suggestion.cmds}\u200b` , inline: false},
				{name: `Antispam ${cmds.Antispam.state}`, value:`${cmds.Antispam.cmds}\u200b` , inline: false},
				{name: `Giveaway ${cmds.Giveaway.state}`, value:`${cmds.Giveaway.cmds}\u200b` , inline: false},
				{name: `Welcome ${cmds.Welcome.state}`, value:`${cmds.Welcome.cmds}\u200b` , inline: false},
				{name: `Nitro Monitoring ${cmds.Nitro.state}`, value:`${cmds.Nitro.cmds}\u200b` , inline: false},
				{name: `Leveling ${cmds.Leveling.state}`, value:`${cmds.Leveling.cmds}\u200b` , inline: false},
				{name: `Blacklist ${cmds.Blacklist.state}`, value:`${cmds.Blacklist.cmds}\u200b` , inline: false},
				{name: `Info  ${cmds.Info.state}`, value:`${cmds.Info.cmds}\u200b` , inline: false},
				{name: `Miscellaneous ${cmds.Miscellaneous.state}`, value:`${cmds.Miscellaneous.cmds}\u200b` , inline: false},
				{name: 'Unsorted | Not editable', value:`${cmds.Unsorted.cmds}\u200b` , inline: false}, 
				{name: '**Bot Owner** Only | Not editable (No one can use these anyways)', value:`${cmds.Owner.cmds}\u200b` , inline: false},
			);
		msg.channel.send(CategoryEmbed);

	}};