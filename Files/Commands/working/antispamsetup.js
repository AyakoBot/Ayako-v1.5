const Discord = require('discord.js');
const { pool } = require('../files/Database');
module.exports = {
	name: 'antispamsetup',
	Category: 'Antispam',
	requiredPermissions: 4,
	description: 'Starts the setup for your AntiSpam',
	usage: 'h!antispamsetup',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
	/* eslint-enable */
		let oldsettings = [];
		let newsettings = [];
		pool.query(`SELECT * FROM antispamsettings WHERE guildid = '${msg.guild.id}'`, (err, result) => {
			if (result.rows[0] == undefined) {
				const query = `
                INSERT INTO antispamsettings (guildid, antispamtof, giveofficialwarnstof, muteafterwarnsamount, kickafterwarnsamount, banafterwarnsamount, readofwarnstof, muteenabledtof, kickenabledtof, banenabledtof)
                    VALUES (${msg.guild.id}, false, false, 0, 0, 0, false, false, false, false)
                    `;
				pool.query(query);
				newsettings.guildid = msg.guild.id;
				start(newsettings, oldsettings);
			} else {
				newsettings.guildid = msg.guild.id;   
				oldsettings.antispamToF = result.rows[0].antispamtof;
				oldsettings.giveofficialWarnsToF = result.rows[0].giveofficialwarnstof;
				oldsettings.muteAfterWarnsAmount = result.rows[0].muteafterwarnsamount;
				oldsettings.KickAfterWarnsAmount = result.rows[0].kickafterwarnsamount;
				oldsettings.BanAfterWarnsAmount = result.rows[0].banafterwarnsamount;
				oldsettings.readOfWarnsToF = result.rows[0].readofwarnstof;
				oldsettings.muteEnabledToF = result.rows[0].muteenabledtof;
				oldsettings.kickEnabledToF = result.rows[0].kickenabledtof;
				oldsettings.banEnabledToF = result.rows[0].banenabledtof;
				start(newsettings, oldsettings);
			}
		});
		function start(newsettings, oldsettings) {
			let embed1 = new Discord.MessageEmbed();
			let editing;
			embed1.setDescription('Welcome to the Ayako AntiSpam Setup guide.\nDo you want to use the recommended Settings?');
			embed1.addField('`Yes` or `No`', '\u200b');
			embed1.setFooter('Type "cancel" anytime to abort the process');
			embed1.setAuthor('Ayako AntiSpam Setup Guide', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot');
			embed1.setColor('b0ff00');
			send(embed1);
			step1();
			function step1() {
				msg.channel.awaitMessages(m => m.author.id == msg.author.id,
					{max: 1, time: 60000}).then(collected => {
					const answer = collected.first().content.toLowerCase();
					if (answer == 'yes') {
						newsettings.giveofficialWarnsToF = true;
						newsettings.muteAfterWarnsAmount = 3;
						newsettings.KickAfterWarnsAmount = 5;
						newsettings.BanAfterWarnsAmount = 6;
						newsettings.readOfWarnsToF = true;
						newsettings.muteEnabledToF = true;
						newsettings.kickEnabledToF = false;
						newsettings.banEnabledToF = true;
						editing = 'rec';
						finish();
					} else if (answer == 'no') {
						let embed2 = new Discord.MessageEmbed();
						embed2.setFooter('Type "cancel" anytime to abort the process');
						embed2.setAuthor('Ayako AntiSpam Setup Guide', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot');
						embed2.setColor('b0ff00');            
						embed2.setDescription('What do you want to change?');
						embed2.addField('`Give Official Warns` (`gow`)\n`Mute After Warns Amount` (`mawa`)\n`Kick After Warns Amount` (`kawa`)\n`Ban After Warns Amount` (`bawa`)\n`Read Official Warnings` (`row`)\n`Mute` (`m`)\n`Kick` (`k`)\n`Ban` (`b`)', '\u200b');
						send(embed2);
						step2();
					} else if (answer == 'cancel') {
						msg.channel.send('Ok, aborted.').catch(() => {});
						return;
					} else {
						notvalid();
						step1();
					}
				}).catch(() => {
					msg.reply('Time ran out. Please start over.').catch(() => {});
				});
			}
			function step2() {
				msg.channel.awaitMessages(m => m.author.id == msg.author.id,
					{max: 1, time: 60000}).then(collected => {
					const answer = collected.first().content.toLowerCase();
					if (answer == 'give official warns' || answer == 'gow') {
						editing = 'gow';
						step3();
					} else if (answer == 'mute after warns amount' || answer == 'mawa') {
						editing = 'mawa';
						step3();
					} else if (answer == 'kick after warns amount' || answer == 'kawa') {
						editing = 'kawa';
						step3();
					} else if (answer == 'ban after warns amount' || answer == 'bawa') {
						editing = 'bawa';
						step3();
					} else if (answer == 'read official warnings' || answer == 'row') {
						editing = 'row';
						step3();
					} else if (answer == 'mute' || answer == 'm') {
						editing = 'm';
						step3();
					} else if (answer == 'kick' || answer == 'k') {
						editing = 'k';
						step3();
					} else if (answer == 'ban' || answer == 'b') {
						editing = 'b';
						step3();
					} else if (answer == 'cancel') {
						msg.channel.send('Ok, aborted.').catch(() => {});
						return;
					} else {
						notvalid();
						step2();
					}
				}).catch(() => {
					msg.reply('Time ran out. Please start over.').catch(() => {});
				});
			}
			function step3() {
				let oldvalue;
				let recvalue;
				let name;
				let valid;
				if (editing == 'gow') {oldvalue = oldsettings.giveofficialWarnsToF; recvalue = 'true'; name = 'Give Official Warns'; valid = '`true` or `false`';}
				if (editing == 'mawa') {oldvalue = oldsettings.muteAfterWarnsAmount; recvalue = '3'; name = 'Mute After Warns Amount'; valid = 'Any number';}
				if (editing == 'kawa') {oldvalue = oldsettings.KickAfterWarnsAmount; recvalue = '5'; name = 'Kick After Warns Amount'; valid = 'Any number';}
				if (editing == 'bawa') {oldvalue = oldsettings.BanAfterWarnsAmount; recvalue = '6'; name = 'Ban After Warns Amount'; valid = 'Any number';}
				if (editing == 'row') {oldvalue = oldsettings.readOfWarnsToF; recvalue = 'true'; name = 'Read Official Warns'; valid = '`true` or `false`';}
				if (editing == 'm') {oldvalue = oldsettings.muteEnabledToF; recvalue = 'true'; name = 'Mute'; valid = '`true` or `false`';}
				if (editing == 'k') {oldvalue = oldsettings.kickEnabledToF; recvalue = 'false'; name = 'Kick'; valid = '`true` or `false`';}
				if (editing == 'b') {oldvalue = oldsettings.banEnabledToF; recvalue = 'true'; name = 'Ban'; valid = '`true` or `false`';}
				let embed3 = new Discord.MessageEmbed();
				embed3.setDescription('You are editing '+name);
				embed3.addField('Old Value:', oldvalue);
				embed3.addField('Recommended Value:', recvalue);
				embed3.addField('Valid input:', valid);
				embed3.setFooter('Type "cancel" anytime to abort the process');
				embed3.setAuthor('Ayako AntiSpam Setup Guide', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot');
				embed3.setColor('b0ff00');            
				send(embed3);
				msg.channel.awaitMessages(m => m.author.id == msg.author.id,
					{max: 1, time: 60000}).then(collected => {
					const answer = collected.first().content.toLowerCase();
					if (answer == 'cancel') {
						msg.channel.send('Ok, aborted.').catch(() => {});
						return;
					}
					if (editing == 'mawa' || editing == 'kawa' || editing == 'bawa') {
						if (isNaN(answer)) {
							notvalid();
							step3();
						} else if (!isNaN(answer)) {
							if (editing == 'mawa') {newsettings.muteAfterWarnsAmount = answer;} 
							if (editing == 'kawa') {newsettings.KickAfterWarnsAmount = answer;} 
							if (editing == 'bawa') {newsettings.BanAfterWarnsAmount = answer;} 
							finish();
						}
					} else if (editing == 'gow' || editing == 'row' || editing == 'm' || editing == 'k' || editing == 'b') {
						if (answer == 'true' || answer == 'false') {
							if (editing == 'gow') {
								if (answer == 'true') {newsettings.giveofficialWarnsToF = true;}
								if (answer == 'false') {newsettings.giveofficialWarnsToF = false;}
							}
							if (editing == 'row') {
								if (answer == 'true') {newsettings.readOfWarnsToF = true;}
								if (answer == 'false') {newsettings.readOfWarnsToF = false;}
							}
							if (editing == 'm') {
								if (answer == 'true') {newsettings.muteEnabledToF = true;}
								if (answer == 'false') {newsettings.muteEnabledToF = false;}
							}
							if (editing == 'k') {
								if (answer == 'true') {newsettings.kickEnabledToF = true;}
								if (answer == 'false') {newsettings.kickEnabledToF = false;}
							}
							if (editing == 'b') {
								if (answer == 'true') {newsettings.banEnabledToF = true;}
								if (answer == 'false') {newsettings.banEnabledToF = false;}
							}
							finish();
						} else {
							notvalid();
							step3();
						}
					} else {
						notvalid();
						step3();
					}
				}).catch(() => {
					msg.reply('Time ran out. Please start over.').catch(() => {});
				});

			}
			function finish() {
				let embed4 = new Discord.MessageEmbed();
				embed4.setDescription('Settings successfully updated.');
				embed4.addField('Change Applied', '\u200b');
				embed4.setAuthor('Ayako AntiSpam Setup Guide', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot');
				embed4.setColor('b0ff00');  
				embed4.setFooter('To enable AntiSpam type [h!antispam enable]');          
				send(embed4);
				let query;
				if (editing == 'rec') {
					query = `
                        UPDATE antispamsettings SET giveofficialwarnstof = '${newsettings.giveofficialWarnsToF}' WHERE guildid = '${msg.guild.id}';
                        UPDATE antispamsettings SET muteafterwarnsamount = '${newsettings.muteAfterWarnsAmount}' WHERE guildid = '${msg.guild.id}';
                        UPDATE antispamsettings SET kickafterwarnsamount = '${newsettings.KickAfterWarnsAmount}' WHERE guildid = '${msg.guild.id}';
                        UPDATE antispamsettings SET banafterwarnsamount = '${newsettings.BanAfterWarnsAmount}' WHERE guildid = '${msg.guild.id}';
                        UPDATE antispamsettings SET readofwarnstof = '${newsettings.readOfWarnsToF}' WHERE guildid = '${msg.guild.id}';
                        UPDATE antispamsettings SET muteenabledtof = '${newsettings.muteEnabledToF}' WHERE guildid = '${msg.guild.id}';
                        UPDATE antispamsettings SET kickenabledtof = '${newsettings.kickEnabledToF}' WHERE guildid = '${msg.guild.id}';
                        UPDATE antispamsettings SET banenabledtof = '${newsettings.banEnabledToF}' WHERE guildid = '${msg.guild.id}';
                    `;
				}
				if (editing == 'gow') {
					query = `
                UPDATE antispamsettings SET giveofficialwarnstof = '${newsettings.giveofficialWarnsToF}' WHERE guildid = '${msg.guild.id}';
                `;
				}
				if (editing == 'row') {
					query = `
                UPDATE antispamsettings SET readofwarnstof = '${newsettings.readOfWarnsToF}' WHERE guildid = '${msg.guild.id}';
                `;
				}
				if (editing == 'm') {
					query = `
                UPDATE antispamsettings SET muteenabledtof = '${newsettings.muteEnabledToF}' WHERE guildid = '${msg.guild.id}';
                `;
				}
				if (editing == 'k') {
					query = `
                UPDATE antispamsettings SET kickenabledtof = '${newsettings.kickEnabledToF}' WHERE guildid = '${msg.guild.id}';
                `;
				}
				if (editing == 'b') {
					query = `
                UPDATE antispamsettings SET banenabledtof = '${newsettings.banEnabledToF}' WHERE guildid = '${msg.guild.id}';
                `;
				}
				if (editing == 'mawa') {
					query = `
                UPDATE antispamsettings SET muteafterwarnsamount = '${newsettings.muteAfterWarnsAmount}' WHERE guildid = '${msg.guild.id}';
                `;
				} 
				if (editing == 'kawa') {
					query = `
                UPDATE antispamsettings SET kickafterwarnsamount = '${newsettings.KickAfterWarnsAmount}' WHERE guildid = '${msg.guild.id}';
                `;
				} 
				if (editing == 'bawa') {
					query = `
                UPDATE antispamsettings SET banafterwarnsamount = '${newsettings.BanAfterWarnsAmount}' WHERE guildid = '${msg.guild.id}';
                `;
				} 
				pool.query(query);
			}
			function notvalid() {
				msg.channel.send('You didnt enter a valid option, try again').catch(() => {});
			}
			function send(embed) {
				msg.channel.send(embed).catch(() => {});
			}
		}
	}};
    