const Discord = require('discord.js');
const { pool } = require('../files/Database');
module.exports = {
	name: 'blacklist',
	Category: 'Blacklist',
	requiredPermissions: 4,
	description: 'Add or remove a word from the Blacklist',
	usage: 'h!blacklist add [word]\nh!blacklist remove [word]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
            /* eslint-enable */
		const res = await pool.query(`SELECT * FROM blacklists WHERE guildid = '${msg.guild.id}'`);
		if (res !== undefined) {
			if (res.rows[0] == undefined) {
				msg.reply('You have no Blacklist settings set yet. Use `h!blacklistsetup` to start the Setup.');
				return;
			}
		} else {
			msg.reply('You have no Blacklist settings set yet. Use `h!blacklistsetup` to start the Setup.');
			return;
		}
		if (args[0]) {
			if (args[0].toLowerCase() == 'add') {
				if (!args[1]) return msg.reply('You need to tell me what word you want to add to the blacklist.');
				let word = args.slice(1).join(' ').toLowerCase();
				word = word.replace(/'/g, '');
				word = word.replace(/`/g, '\\`');
				let newwords;
				if (res.rows[0].words) {
					if (res.rows[0].words.includes(word)) {
						msg.reply('This word is already blacklisted.');
						return;
					}
					newwords = `${res.rows[0].words}${word}, `;
				} else {
					newwords = `${word}, `;
				}
				pool.query(`UPDATE blacklists SET words = '${newwords}' WHERE guildid = '${msg.guild.id}'`).catch((e) => {console.log(1, e);});
				const embed = new Discord.MessageEmbed()
					.setDescription(`\`${word}\` was added to the blacklist.`)
					.setColor('YELLOW');
				msg.channel.send(embed);	
			} else if (args[0].toLowerCase() == 'remove') {
				if (!args[1]) return msg.reply('You need to tell me what word you want to remove from the blacklist.');
				let word = args.slice(1).join(' ').toLowerCase().replace(/`/g, '\\`').replace(/'/g, '');
				if (res.rows[0].words) {
					if (res.rows[0].words.includes(word)) {
						const newwords = res.rows[0].words.replace(`${word}, `, '');
						pool.query(`UPDATE blacklists SET words = '${newwords}' WHERE guildid = '${msg.guild.id}'`);
						const embed = new Discord.MessageEmbed()
							.setDescription(`\`${word}\` was remove from the blacklist.`)
							.setColor('YELLOW');
						msg.channel.send(embed);
					} else {
						msg.reply('That word isnt blacklisted.');
					}
				} else {
					msg.reply('There are no blacklisted words yet.');
					return;
				}
			}
		} else {
			let words = '';
			if (`${res.rows[0].words}` == '') {words = 'No blacklisted words';} else if (res.rows[0].words !== null) {words = `${res.rows[0].words}`;} else {words = 'No blacklisted words';}
			const embed = new Discord.MessageEmbed();
			embed.setTitle(`${msg.guild.name} server Blacklist settings`);
			embed.addFields(
				{name: 'Blacklisted Words', value: `${words.replace(/, /g, ' | ')}\u200b`, inline: false},
				{name: '\u200b', value: '\u200b', inline: false},
				{name: '|Warn enabled', value: res.rows[0].warntof, inline: true},
				{name: '|Warn after words amount', value: res.rows[0].warnafteramount, inline: false},
				{name: '|Mute enabled', value: res.rows[0].mutetof, inline: false},
				{name: '|Mute after words amount', value: +res.rows[0].muteafteramount + +res.rows[0].warnafteramount, inline: true},
			);	
			embed.setColor('b0ff00');
			embed.setAuthor('Ayako Blacklist settings [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot');
			embed.setFooter('Edit Blacklist settings in h!blacklistsetup');
			msg.channel.send(embed);
		}
	}
};