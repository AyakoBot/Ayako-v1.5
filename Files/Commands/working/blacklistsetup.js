const Discord = require('discord.js');
const { pool } = require('../files/Database');
module.exports = {
	name: 'blacklistsetup',
	Category: 'Blacklist',
	requiredPermissions: 4,
	description: 'Starts the Automoderation Blacklist Setup',
	usage: 'h!blacklistsetup',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
        	/* eslint-enable */
		const oldsettings = [];
		const newsettings = [];
		let editing;
		oldsettings.guildid = msg.guild.id;
		const res = await pool.query(`SELECT * FROM blacklists WHERE guildid = '${msg.guild.id}'`);
		if (res !== undefined) {
			if (res.rows[0] !== undefined) {
				oldsettings.warntof = res.rows[0].warntof;
				oldsettings.mutetof = res.rows[0].mutetof;
				oldsettings.warnafteramount = res.rows[0].warnafteramount;
				oldsettings.muteafteramount = res.rows[0].muteafteramount;
				oldsettings.existed = true;
			} else {
				oldsettings.warntof = true;
				oldsettings.mutetof = true;
				oldsettings.warnafteramount = 4;
				oldsettings.muteafteramount = 4;    
				oldsettings.existed = false;
			}
		}
		const embed = new Discord.MessageEmbed()
			.setTitle('Blacklist Setup')
			.setTimestamp()
			.setFooter('You can cancel anytime by typing [cancel]')
			.setColor('b0ff00');
		embed.setDescription('Welcome to the Ayako Blacklist Setup Process.\n Do you want to use the recommended Settings?\nValid answers: `Yes` or `No`');
		send(embed);
		Step1();
		function Step1() {
			msg.channel.awaitMessages(m => m.author.id == msg.author.id,
				{max: 1, time: 60000}).then(collected => {
				const answer = collected.first().content.toLowerCase();
				if (answer == 'cancel') {
					send('Ok, aborted.');
					return;
				} else if (answer == 'yes') {
					newsettings.warntof = true;
					newsettings.mutetof = true;
					newsettings.warnafteramount = 4;
					newsettings.muteafteramount = 4;
					recommended();
				} else if (answer == 'no') {
					embed.setDescription('What setting do you want to edit?\n`Warn` - Edit if I will warn members for saying Blacklisted words\n`Mute` - Edit if I will tempmute members for saying Blacklisted words\n`WarnAmount` `wa` - Edit the amount of verbal warnings needed before an actual warn is given (Requires `Warn` to be enabled to work)\n`MuteAmount` `ma` - Edit the amount of verbal warnings needed before I tempmute the Member (Requires `Mute` to be enabled to work)');
					send(embed);
					Step2();
				} else {
					notvalid();
					Step1();
					return;
				}
			}).catch(() => msg.channel.send('Time ran out, please start over'));
		}
		function Step2() {
			msg.channel.awaitMessages(m => m.author.id == msg.author.id,
				{max: 1, time: 60000}).then(collected => {
				const answer = collected.first().content.toLowerCase();
				editing = answer;
				if (answer == 'cancel') {
					send('Ok, aborted.');
					return;
				} else if (answer == 'warn') {
					embed.setDescription(`Old Value: \`${oldsettings.warntof}\`\nRecommended Value: \`True\`\nValid answer: \`True\` or \`False\``);
					send(embed);
					Step3();
					return;
				} else if (answer == 'mute') {
					embed.setDescription(`Old Value: \`${oldsettings.mutetof}\`\nRecommended Value: \`True\`\nValid answer: \`True\` or \`False\``);
					send(embed);
					Step3();
					return;
				} else if (answer == 'wa' || answer == 'warnamount') {
					embed.setDescription(`Old Value: \`${oldsettings.warnafteramount}\`\nRecommended Value: \`4\`\nValid answer: Any Number`);
					send(embed);
					Step3();
					return;
				} else if (answer == 'ma' || answer == 'muteamount') {
					embed.setDescription(`Old Value: \`${oldsettings.muteafteramount}\`\nRecommended Value: \`8\`\nValid answer: Any Number`);
					send(embed);
					Step3();
					return;
				} else {
					notvalid();
					Step2();
					return;
				}   
			}).catch(() => msg.channel.send('Time ran out, please start over'));
		}
		function Step3() {
			msg.channel.awaitMessages(m => m.author.id == msg.author.id,
				{max: 1, time: 60000}).then(collected => {
				const answer = collected.first().content.toLowerCase();
				if (answer == 'cancel') {
					send('Ok, aborted.');
					return;
				} else {
					if (editing == 'warn') {
						if (answer == 'true' || answer == 'false') {
							newsettings.warntof = answer;
							finish();
						} else {
							notvalid();
							Step3();
							return;
						}
					} else if (editing == 'mute') {
						if (answer == 'true' || answer == 'false') {
							newsettings.mutetof = answer;
							finish();
						} else {
							notvalid();
							Step3();
							return;
						}
					} else if (editing == 'wa' || editing == 'warnamount') {
						if (!isNaN(answer)) {
							newsettings.warnafteramount = answer;
							finish();
						} else {
							notvalid();
							Step3();
							return;
						}
					} else if (editing == 'ma' || editing == 'muteamount') {
						if (!isNaN(answer)) {
							newsettings.muteafteramount = answer;
							finish();
						} else {
							notvalid();
							Step3();
							return;
						}
					}
				}
			}).catch(() => msg.channel.send('Time ran out, please start over'));
		}
		function finish() {
			const embed = new Discord.MessageEmbed()
				.setTitle('Blacklist Setup finished')
				.setDescription('To add words to the blacklist use `h!blacklist add [word]`\nTo remove words from the blacklist use `h!blacklist remove [word]`')
				.setColor('b0ff00')
				.setFooter('View the settings in h!blacklistsettings');
			send(embed);
			if (oldsettings.existed == true) {
				if (editing == 'warn') {
					pool.query(`UPDATE blacklists SET warntof = '${newsettings.warntof}' WHERE guildid = '${msg.guild.id}'`);
				} else if (editing == 'mute') {
					pool.query(`UPDATE blacklists SET mutetof = '${newsettings.mutetof}' WHERE guildid = '${msg.guild.id}'`);
				} else if (editing == 'wa' || editing == 'warnamount') {
					pool.query(`UPDATE blacklists SET warnafteramount = '${newsettings.warnafteramount}' WHERE guildid = '${msg.guild.id}'`);
				} else if (editing == 'ma' || editing == 'muteamount') {
					pool.query(`UPDATE blacklists SET muteafteramount = '${newsettings.muteafteramount}' WHERE guildid = '${msg.guild.id}'`);
				}
			} else if (oldsettings.existed == false) {
				if (oldsettings.existed == true) {
					if (editing == 'warn') {
						pool.query(`INSERT INTO blacklists(guildid, warntof, mutetof) VALUES ('${msg.guild.id}', '${newsettings.warntof}', 'false')`);
					} else if (editing == 'mute') {
						pool.query(`INSERT INTO blacklists(guildid, warntof, mutetof) VALUES ('${msg.guild.id}', 'false', '${newsettings.mutetof}')`);
					} else if (editing == 'wa' || editing == 'warnamount') {
						pool.query(`INSERT INTO blacklists(guildid, warnafteramount, warntof, mutetof) VALUES ('${msg.guild.id}', '${newsettings.warnafteramount}', 'false', 'false')`);
					} else if (editing == 'ma' || editing == 'muteamount') {
						pool.query(`INSERT INTO blacklists(guildid, warntof, muteafteramount, mutetof) VALUES ('${msg.guild.id}', 'false', '${newsettings.muteafteramount}', 'false')`);
					}
				}
			}

		}
		function recommended() {
			const embed = new Discord.MessageEmbed()
				.setTitle('Blacklist Setup finished')
				.setDescription('To add words to the blacklist use `h!blacklist add [word]`\nTo remove words from the blacklist use `h!blacklist remove [word]`')
				.setColor('b0ff00')
				.setFooter('View the settings in h!blacklistsettings');
			send(embed);
			if (oldsettings.existed == true) {
				pool.query(`
            UPDATE blacklists SET warntof = '${newsettings.warntof}' WHERE guildid = '${msg.guild.id}';
            UPDATE blacklists SET mutetof = '${newsettings.mutetof}' WHERE guildid = '${msg.guild.id}';
            UPDATE blacklists SET warnafteramount = '${newsettings.warnafteramount}' WHERE guildid = '${msg.guild.id}';
            UPDATE blacklists SET muteafteramount = '${newsettings.muteafteramount}' WHERE guildid = '${msg.guild.id}';
            `); 
			} else if (oldsettings.existed == false) {
				pool.query(`INSERT INTO blacklists(guildid, warnafteramount, warntof, muteafteramount, mutetof) VALUES ('${msg.guild.id}', '${newsettings.warnafteramount}', '${newsettings.warntof}', '${newsettings.muteafteramount}', '${newsettings.mutetof}')`);
			}
		}
		function notvalid() {
			msg.channel.send('That was not a valid reply, please try again.');
		}
		function send(content) {
			msg.channel.send(content);
		}
	}
};