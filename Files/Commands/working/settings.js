const { pool } = require('../files/Database.js');
module.exports = {
	name: 'settings',
	requiredPermissions: 1,
	description: 'Disable or enable a command category',
	usage: 'h!settings [disable/enable] [command category]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
        /* eslint-enable */
		const Categories = ['moderation', 'moderation (advanced)', 'fun', 'self roles', 'miscellaneous', 'info', 'suggestion', 'antispam', 'welcome', 'giveaway', 'nitro monitoring', 'leveling', 'blacklist'];
		const res = await pool.query(`SELECT * FROM disabled WHERE guildid = '${msg.guild.id}'`);
		let cmds = [];
		cmds.Moderation = true;
		cmds.ModerationAdvanced = true;
		cmds.Fun = true;
		cmds.Selfroles = true;
		cmds.Suggestion = true;
		cmds.Antispam = true;
		cmds.Giveaway = true;
		cmds.Welcome = true;
		cmds.Nitro = true;
		cmds.Leveling = true;
		cmds.Blacklist = true;
		cmds.Info = true;
		cmds.Miscellaneous = true;
		let existed = false;
		if (res) {
			if (res.rows[0]) {
				existed = true;
				const r = res.rows[0];
				if (r.moderation == false)  {cmds.Moderation = false;}
				if (r.moderationadvanced == false)  {cmds.ModerationAdvanced = false;}
				if (r.fun == false)  {cmds.Fun = false;}
				if (r.selfroles == false)  {cmds.Selfroles = false;}
				if (r.suggestion == false)  {cmds.Suggestion = false;}
				if (r.antispam == false)  {cmds.Antispam = false;}
				if (r.giveaway == false)  {cmds.Giveaway = false;}
				if (r.welcome == false)  {cmds.Welcome = false;}
				if (r.nitro == false)  {cmds.Nitro = false;}
				if (r.leveling == false)  {cmds.Leveling = false;}
				if (r.blacklist == false)  {cmds.Blacklist = false;}
				if (r.info == false)  {cmds.Info = false;}
				if (r.miscellaneous == false)  {cmds.Miscellaneous = false;}
			}
		}
		if (args[1]) {
			const arg = args.slice(1).join(' ').toLowerCase();
			if (arg == Categories[0]) {cmds.Moderation = args[0].toLowerCase().replace('disable', false).replace('enable', true);}
			if (arg == Categories[1]) {cmds.ModerationAdvanced = args[0].toLowerCase().replace('disable', false).replace('enable', true);}
			if (arg == Categories[2]) {cmds.Fun = args[0].toLowerCase().replace('disable', false).replace('enable', true);}
			if (arg == Categories[3]) {cmds.Selfroles = args[0].toLowerCase().replace('disable', false).replace('enable', true);}
			if (arg == Categories[4]) {cmds.Miscellaneous = args[0].toLowerCase().replace('disable', false).replace('enable', true);}
			if (arg == Categories[5]) {cmds.Info = args[0].toLowerCase().replace('disable', false).replace('enable', true);}
			if (arg == Categories[6]) {cmds.Suggestion = args[0].toLowerCase().replace('disable', false).replace('enable', true);}
			if (arg == Categories[7]) {cmds.Antispam = args[0].toLowerCase().replace('disable', false).replace('enable', true);}
			if (arg == Categories[8]) {cmds.Welcome = args[0].toLowerCase().replace('disable', false).replace('enable', true);}
			if (arg == Categories[9]) {cmds.Giveaway = args[0].toLowerCase().replace('disable', false).replace('enable', true);}
			if (arg == Categories[10]) {cmds.Nitro = args[0].toLowerCase().replace('disable', false).replace('enable', true);}
			if (arg == Categories[11]) {cmds.Leveling = args[0].toLowerCase().replace('disable', false).replace('enable', true);}
			if (arg == Categories[12]) {cmds.Blacklist = args[0].toLowerCase().replace('disable', false).replace('enable', true);}
		}
		if (args[0] == 'enable') {
			if (Categories.includes(args.slice(1).join(' ').toLowerCase())) {
				if (existed == false) {
					pool.query(`INSERT INTO disabled (guildid, moderation, moderationadvanced, fun, selfroles, miscellaneous, info, suggestion, antispam, welcome, giveaway, nitro, leveling, blacklist) VALUES ('${msg.guild.id}', '${cmds.Moderation}', '${cmds.ModerationAdvanced}', '${cmds.Fun}', '${cmds.Selfroles}', '${cmds.Miscellaneous}', '${cmds.Info}', '${cmds.Suggestion}', '${cmds.Antispam}', '${cmds.Welcome}', '${cmds.Giveaway}', '${cmds.Nitro}', '${cmds.Leveling}', '${cmds.Blacklist}')`);
				} else {
					pool.query(`
					UPDATE disabled SET moderation = '${cmds.Moderation}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET moderationadvanced = '${cmds.ModerationAdvanced}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET fun = '${cmds.Fun}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET selfroles = '${cmds.Selfroles}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET miscellaneous = '${cmds.Miscellaneous}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET info = '${cmds.Info}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET suggestion = '${cmds.Suggestion}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET antispam = '${cmds.Antispam}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET welcome = '${cmds.Welcome}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET giveaway = '${cmds.Giveaway}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET nitro = '${cmds.Nitro}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET leveling = '${cmds.Leveling}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET blacklist = '${cmds.Blacklist}' WHERE guildid = '${msg.guild.id}';
					`);
				}
				msg.channel.send(`Category **${args.slice(1).join(' ').toLowerCase()}** was updated`);
			} else {
				msg.reply('This Command Category does not exist or is not editable.');
				return;
			}
		} else if (args[0] == 'disable') {
			if (Categories.includes(args.slice(1).join(' ').toLowerCase())) {
				if (existed == false) {
					pool.query(`INSERT INTO disabled (guildid, moderation, moderationadvanced, fun, selfroles, miscellaneous, info, suggestion, antispam, welcome, giveaway, nitro, leveling, blacklist) VALUES ('${msg.guild.id}', '${cmds.Moderation}', '${cmds.ModerationAdvanced}', '${cmds.Fun}', '${cmds.Selfroles}', '${cmds.Miscellaneous}', '${cmds.Info}', '${cmds.Suggestion}', '${cmds.Antispam}', '${cmds.Welcome}', '${cmds.Giveaway}', '${cmds.Nitro}', '${cmds.Leveling}', '${cmds.Blacklist}')`);
				} else {
					pool.query(`
					UPDATE disabled SET moderation = '${cmds.Moderation}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET moderationadvanced = '${cmds.ModerationAdvanced}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET fun = '${cmds.Fun}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET selfroles = '${cmds.Selfroles}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET miscellaneous = '${cmds.Miscellaneous}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET info = '${cmds.Info}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET suggestion = '${cmds.Suggestion}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET antispam = '${cmds.Antispam}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET welcome = '${cmds.Welcome}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET giveaway = '${cmds.Giveaway}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET nitro = '${cmds.Nitro}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET leveling = '${cmds.Leveling}' WHERE guildid = '${msg.guild.id}';
					UPDATE disabled SET blacklist = '${cmds.Blacklist}' WHERE guildid = '${msg.guild.id}';
					`);
				}
				msg.channel.send(`Category **${args.slice(1).join(' ').toLowerCase()}** was updated`);
			} else {
				msg.reply('This Command Category does not exist or is not editable.');
				return;
			}
		} else {return msg.reply('Thats not a valid option. -> `h!settings [enable/disable] [Command Category]`');}
	}};