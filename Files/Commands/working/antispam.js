const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'antispam',
	Category: 'Antispam',
	requiredPermissions: 2,
	description: 'Disable or Enable Ayako AntiSpam',
	usage: 'h!antispam [enable or disable]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
    /* eslint-enable */
		const logchannel = client.channels.cache.get(logchannelid);
		let settings = [];
		let content;
		pool.query(`SELECT * FROM antispamsettings WHERE guildid = '${msg.guild.id}'`, (err, result) => {
			if (result == undefined) {
				content = 'You have not set-up AntiSpam yet, check `h!antispamsetup`';
				Continue(content);
			}
			if (result.rows[0] == undefined) {
				content = 'You have not set-up AntiSpam yet, check `h!antispamsetup`';
				Continue(content);
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
				settings.ofWarnEnabeldToF = result.rows[0].ofwarnenabeldtof;
				settings.muteEnabledToF = result.rows[0].muteenabledtof;
				settings.kickEnabledToF = result.rows[0].kickenabledtof;
				settings.banEnabledToF = result.rows[0].banenabledtof;
				settings.deleteToF = result.rows[0].deletetof;
				Continue(settings);
			}
		});
		function Continue(settings) {
			let query;
			if (settings == 'You have not set-up AntiSpam yet, check `h!antispamsetup`') {
				return msg.reply(settings);
			}
			if (!args[0]) return msg.reply('Please enter a valid option. `Enable` or `Disable`');
			const option = args[0].toLowerCase();
			if (option == 'enable') {
				if (settings.antispamToF == true) return msg.reply('AntiSpam is already enabled.');
				query = `
                UPDATE antispamsettings SET antispamtof = 'true' WHERE guildid = '${msg.guild.id}';
				`;
				pool.query(query);
				const reply = new Discord.MessageEmbed()
					.setDescription('Anti Spam is now enabled')
					.setColor('#b0ff00');
				msg.channel.send(reply);
				const LogEmbed = new Discord.MessageEmbed()
					.setTitle('Anti Spam is now enabled')
					.setDescription(`${msg.author} enabled Anti Spam.`)
					.setColor('#b0ff00')
					.setTimestamp();
				if (logchannel)logchannel.send(LogEmbed).catch(() => {});
			}
			if (option == 'disable') {
				if (settings.antispamToF == false) return msg.reply('AntiSpam is already disabled.');
				query = `
                UPDATE antispamsettings SET antispamtof = 'false' WHERE guildid = '${msg.guild.id}';
                `;
				pool.query(query);
				const reply = new Discord.MessageEmbed()
					.setDescription('Anti Spam is now disabled')
					.setColor('#b0ff00');
				msg.channel.send(reply);

				const LogEmbed = new Discord.MessageEmbed()
					.setTitle('Anti Spam is now disabled')
					.setDescription(`${msg.author} disabled Anti Spam.`)
					.setColor('#b0ff00')
					.setTimestamp();
				if (logchannel)logchannel.send(LogEmbed).catch(() => {});
			}
		}
	}};