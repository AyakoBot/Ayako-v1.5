const Discord = require('discord.js');
const { pool } = require('../files/Database');
module.exports = {
	name: 'nitrosetup',
	Category: 'Nitro',
	reuqiredPermissions: 4,
	description: 'Start the Nitro monitoring setup',
	usage: 'h!nitrosetup',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
	/* eslint-enable */
		let boosterrole;
		let channel;
		const embed = new Discord.MessageEmbed()
			.setTitle('Nitro Monitoring Setup')
			.setTimestamp()
			.setFooter('You can cancel anytime by typing [cancel]')
			.setColor('b0ff00');
		embed.setDescription('Welcome to the Ayako Nitro Monitoring Setup Process.\n Please **mention the Nitro boost role** or **send the Nitro boost role ID** or **Send the Nitro boost role Name** now.\n\nValid Input examples: `@Server Booster` or `606164114691194900` or `Server Booster`');
		send(embed);
		getRole();
		function getRole() {
			msg.channel.awaitMessages(m => m.author.id == msg.author.id,
				{max: 1, time: 60000}).then(collected => {
				const answer = collected.first().content.toLowerCase();
				if (answer == 'cancel') {
					notValid('Ok, canceled');
					return;
				}
				if (answer.length == 22 && isNaN(answer) && answer.includes('<@&') && answer.includes('>')) {
					let rawrole = answer.replace(/<@&/g, '').replace(/>/g, '');
					const boosterrole = msg.guild.roles.cache.find(r => r.id == rawrole);
					if (!boosterrole || !boosterrole.id) {
						notValid('The mention you entered is not valid. Please try again.');
						getRole();
					} else if (boosterrole && boosterrole.id) {
						if (boosterrole.managed) {
							gotRole(boosterrole.id);
							embed.setDescription(`${boosterrole} is the role Members automatically receive upon boosting.\nWhat channel do you want the Nitro boosting to be monitored?\n**Mention a channel** or **Enter its channel ID** or say \`No\` if you dont want one.\n\nValid Input examples: \`#ayako-nitrolog\` or \`760223423166152746\` or \`No\``);
							send(embed);
						} else {
							notValid('That is not the official Booster role of the server. Please try again.');
							getRole();
						}
					} else {
						notValid('The mention you entered is not valid. Please try again.');
						getRole();
					}
				} else if (answer.length == 18 && !isNaN(answer)) {
					boosterrole = msg.guild.roles.cache.find(r => r.id == answer);
					if (!boosterrole || !boosterrole.id) {
						notValid('The role ID you entered is not valid. Please try again.');
						getRole();
					} else if (boosterrole && boosterrole.id) {
						if (boosterrole.managed) {
							gotRole(boosterrole.id);
							embed.setDescription(`${boosterrole} is the role Members automatically receive upon boosting.\nWhat channel do you want the Nitro boosting to be monitored?\n**Mention a channel** or **Enter its channel ID** or say \`No\` if you dont want one.\n\nValid Input examples: \`#ayako-nitrolog\` or \`760223423166152746\` or \`No\``);
							send(embed).catch(() => {});
						} else {
							notValid('That is not the official Booster role of the server. Please try again.');
							getRole();
						}
					} else {
						notValid('The role ID you entered is not valid. Please try again.');
						getRole();
					}
				} else {
					boosterrole = msg.guild.roles.cache.find(r => r.name.toLowerCase() == answer);
					if (!boosterrole || !boosterrole.id) {
						notValid('The role Name you entered is not valid. Please try again.');
						getRole();
                        
					} else if (boosterrole && boosterrole.id) {
						if (boosterrole.managed) {
							gotRole();
							embed.setDescription(`${boosterrole} is the role Members automatically receive upon boosting.\nWhat channel do you want the Nitro boosting to be monitored?\n**Mention a channel** or **Enter its channel ID** or say \`No\` if you dont want one.\n\nValid Input examples: \`#ayako-nitrolog\` or \`760223423166152746\` or \`No\``);
							send(embed).catch(() => {});
						} else {
							notValid('That is not the official Booster role of the server. Please try again.');
							getRole();
						}
					} else {
						notValid('The role Name you entered is not valid. Please try again.');
						getRole();
					}
				}
			}).catch(() => {
				msg.reply('Time ran out.').catch(() => {});
			});
		}
		function gotRole() {
			msg.channel.awaitMessages(m => m.author.id == msg.author.id,
				{max: 1, time: 60000}).then(collected => {
				const answer = collected.first().content.toLowerCase();
				if (answer == 'cancel') {
					notValid('Ok, canceled');
					return;
				} else
				if (answer == 'no') {
					channel = null;
					finish();
				} else
				if (answer.length == 21 && answer.includes('<#') && answer.includes('>')) {
					const rawchannelid = answer.replace(/<#/g, '').replace(/>/g, '');
					channel = msg.guild.channels.cache.get(rawchannelid);
					if (!channel || !channel.id) {
						notValid('The mention you entered is not valid. Please try again.');
						gotRole();
					} else if (channel && channel.id) {
						finish();
						embed.setDescription(`${channel} is the channel which will be used for nitro logging.\n\nThats it, if you want to give your Boosters Special roles after boosting for a while, visit \`h!nitroroles\``);
						send(embed).catch(() => {});
					} else {
						notValid('The role Name you entered is not valid. Please try again.');
						gotRole();
					}
				} else if (answer.length == 18 && !isNaN(answer)) {
					channel = msg.guild.channels.cache.get(answer);
					if (!channel || !channel.id) {
						notValid('The mention you entered is not valid. Please try again.');
						gotRole();
					} else if (channel && channel.id) {
						finish();
						embed.setDescription(`${channel} ${channel.name} is the channel which will be used for nitro logging.\n\nThats it, if you want to give your Boosters Special roles after boosting for a while, visit \`h!nitroroles\``);
						send(embed).catch(() => {});
					} else {
						notValid('The role Name you entered is not valid. Please try again.');
						gotRole();
					}
				} else {
					notValid();
					gotRole();
				}
			}).catch(() => {
				msg.reply('Time ran out.').catch(() => {});
			});
		}
		async function finish() {
			let channelid;
			if (channel !== null) {
				channelid = channel.id;
			} else {
				channelid = channel;
			}
			await pool.query(`DELETE FROM nitrosettings WHERE guildid = '${msg.guild.id}'`);
			pool.query(`INSERT INTO nitrosettings (guildid, boosterroleid, nitrologchannelid) VALUES ('${msg.guild.id}', '${boosterrole.id}', '${channelid}');`);
		}

		function notValid(content) {
			if (!content) {content = 'That was not a valid answer, please try again.';}
			msg.reply(content).catch(() => {});
		}
		async function send(embed) {
			const m = await msg.channel.send(embed).catch(() => {});
			return m;	
		}    
	}};