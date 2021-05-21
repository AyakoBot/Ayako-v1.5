const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
const ms = require('ms');
module.exports = {
	name: 'tempmute',
	requiredPermissions: 3,
	Category: 'Moderation',
	description: 'Temporary Mute a user',
	usage: 'h!tempmute [user ID or mention] [Mute duration] (reason)',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (!msg.guild.member(client.user).permissions.has('MANAGE_ROLES')) return msg.reply('I am not able to mute this user. Be sure I have the "Manage Roles" permission.');
		if (msg.mentions.users.first()){
			muteFunction(msg.mentions.users.first(), logchannelid);
		} else {
			if(args[0]){
				client.users.fetch(args[0]).then(user => {
					if(user && user.id){
						muteFunction(user, logchannelid);
					}else{
						msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 1');
					}
				}).catch(e=>{
					msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 2');
					/* eslint-disable */
				let error;
				error = e;
				/* eslint-enable */
				}).catch({});
			} else {
				msg.reply('You need to specify a user.');
			}
		}


		async function muteFunction(user, logchannelid){
			const warnrnredo = await pool.query(`SELECT * FROM warns WHERE userid = '${user.id}' AND guildid = '${msg.guild.id}'`);
			if (warnrnredo !== undefined) {
				if (warnrnredo.rows[0] !== undefined) {
					for (let i = 0; i < warnrnredo.rowCount; i++) {
						let l = i;
						l++;
						await pool.query(`UPDATE warns SET warnnr = '${l}' WHERE guildid = '${msg.guild.id}' AND userid = '${user.id}' AND dateofwarn = ${warnrnredo.rows[i].dateofwarn}`);
					}
				}
			}
			let duration;
			if (!args[1]) return msg.reply('Please enter a tempmute duration');
			if (args[1].includes('s') || args[1].includes('m') || args[1].includes('h') || args[1].includes('d') || args[1].includes('y') ) {
				duration = ms(args[1]);
			} else {
				return msg.reply('Be sure to provide a valid time limit -> `h!tempmute [user] [duration] [reason]`\nIf you dont know what duration to use, visit `h!help mod`');
			}
			if (isNaN(duration)) return msg.reply('You didnt enter a valid duration.');
			if (isNaN(ms(args[1]))) return msg.reply('You didnt enter a valid duration.');
			let TempmuteReason = args.slice(2).join(' ');
			if (!TempmuteReason) TempmuteReason = 'no reason given';
			if (msg.guild.id == '298954459172700181' || msg.guild.id == '366219406776336385') {
				var TempmutedDMEmbed = new Discord.MessageEmbed()
					.setTitle(`You have been muted on the server __${msg.guild.name}__`)
					.setColor('#ff0000')
					.setDescription(`Reason: \`\`\`${TempmuteReason}\`\`\``)
					.addField('You can appeal for your punishment here:', 'https://docs.google.com/forms/d/1MMqfbW8G2Ihfhn-Zm7UkR6UfnrNj4vS8gyivZhGl2_E/')
					.addField('Duration:', args[1])
					.setTimestamp();
			} else {
				TempmutedDMEmbed = new Discord.MessageEmbed()
					.setTitle(`You have been muted on the server __${msg.guild.name}__`)
					.setColor('#ff0000')
					.setDescription(`Reason: \`\`\`${TempmuteReason}\`\`\``)
					.addField('Duration:', args[1])
					.setTimestamp();
			}
			let warnnr;
			pool.query(`SELECT * FROM warns WHERE guildid = '${msg.guild.id}' AND userid = '${user.id}'`, (err, result) => {
				if (result == undefined) {
					warnnr = 1;
					Continue(warnnr);
					return;
				}
				if (result.rows[0] == undefined) {
					warnnr = 1;
					Continue(warnnr);
					return;
				} else {
					warnnr = result.rowCount;
					warnnr++;
					Continue(warnnr);
				}
			
			});
			async function Continue(warnnr) {
				const guildmember = msg.guild.member(user);
				if (guildmember) {
					if (+msg.guild.member(msg.author).roles.highest.rawPosition < +guildmember.roles.highest.rawPosition || +msg.guild.member(msg.author).roles.highest.rawPosition == +guildmember.roles.highest.rawPosition) {
						msg.reply('You cant mute this user.');
					} else {
						const res = await pool.query(`SELECT * FROM modroles WHERE guildid = '${msg.guild.id}'`);
						if (res && res.rowCount > 0) {
							const r = res.rows[0];
							if (r.adminrole) { 
								const role = msg.guild.roles.cache.find(role => role.id === r.adminrole);
								if (role && role.id) {
									if (guildmember.roles.cache.has(role.id)) {
										waiter();
										return;
									}
								}
							}
						}
						if (res && res.rowCount > 0) {
							const r = res.rows[0];
							if (r.modrole) { 
								const role = msg.guild.roles.cache.find(role => role.id === r.modrole);
								if (role && role.id) {
									if (guildmember.roles.cache.has(role.id)) {
										waiter();
										return;
									}
								}
							}
						}					
						if (res && res.rowCount > 0) {
							const r = res.rows[0];
							if (r.trialmodrole) { 
								const role = msg.guild.roles.cache.find(role => role.id === r.trialmodrole);
								if (role && role.id) {
									if (guildmember.roles.cache.has(role.id)) {
										waiter();
										return;
									}
								}
							}
						}
						proceednormally();
					}
				} else {
					proceednormally();
				}
				async function waiter() {  					
					const m = await msg.reply('You just issued a **moderation command** on a user with **moderator role**. \nDo you want to **proceed or abort**.').catch(() => {});
					m.react('670163913370894346').catch(() => {});
					m.react('746392936807268474').catch(() => {});
					msg.channel.awaitMessages(m => m.author.id == msg.author.id,
						{max: 1, time: 30000}).then(rawcollected => {
						if (!rawcollected.first()) return;
						if (rawcollected.first().content.toLowerCase() == 'y' || rawcollected.first().content.toLowerCase() == 'yes' || rawcollected.first().content.toLowerCase() == 'proceed' || rawcollected.first().content.toLowerCase() == 'continue' || rawcollected.first().content.toLowerCase() == 'go') {
							if (m.deleted == false) {
								rawcollected.first().delete().catch(() => {});
								m.delete().catch(() => {});
								proceednormally();
							}
						} else {
							m.delete().catch(() => {});
							return;
						}
					}).catch(() => {m.delete().catch(() => {});});
	
					m.awaitReactions((reaction, user) => (reaction.emoji.id === '670163913370894346' || reaction.emoji.id === '746392936807268474') && user.id === msg.author.id,
						{max: 1, time: 60000}).then(rawcollected => {
						if (!rawcollected.first()) return;
						if (rawcollected.first()._emoji.id == '670163913370894346') {
							m.delete().catch(() => {});
							proceednormally();
						} else {
							m.delete().catch(() => {});
							return;
						}
					}).catch(() => {m.delete().catch(() => {});});
	
				}
				async function proceednormally() {
					var ReplyEmbed = new Discord.MessageEmbed()
						.setDescription(`${user} was muted\nWarn Number ${warnnr}.`)
						.setColor('#ff0000')
						.setTimestamp();
					const TempmuteLog = new Discord.MessageEmbed()
						.setTitle(user.username + ' was tempmuted in the server '+ msg.guild.name)
						.setColor('ff0000')
						.setThumbnail(user.displayAvatarURL())
						.setDescription(`${user} was tempmuted by ${msg.author}`)
						.addField('Reason:', TempmuteReason)
						.setTimestamp()
						.setFooter('Muted user ID: ' +user.id+ ' \nExecutor user ID: '+msg.author.id+'\n');
					const logchannel = client.channels.cache.get(logchannelid);
					let MuteRole;
					pool.query(`SELECT muteroleid FROM muterole WHERE guildid = '${msg.guild.id}'`, (err, result) => {
						const restext = `${result.rows[0]}`;
						if (restext !== 'undefined') {
							MuteRole = msg.guild.roles.cache.find(role => role.id === result.rows[0].muteroleid);
							MuteRoleF(MuteRole);
						} else {
							MuteRoleF(MuteRole);
						}
					});
					async function MuteRoleF(MuteRole) {
					
						if (!MuteRole) {
							MuteRole = msg.guild.roles.cache.find(role => role.name === 'Muted');
						}
						if (!MuteRole || !MuteRole.id) {
							msg.reply('There is no MuteRole set on this server, therefore I cant mute members');
							return;
						}
						if (!msg.guild.member(user)) {
							msg.reply('I cant mute that user since they left the server, but I will mute them if they rejoin.');
						} else {
							if (msg.guild.member(client.user).roles) {
								if (msg.guild.member(client.user).roles.highest) {
									if (+msg.guild.member(client.user).roles.highest.rawPosition < +MuteRole.rawPosition) {
										msg.reply(`I cant mute this user since Im not able to access the MuteRole, please move my role (called Ayako) above the role ${MuteRole}`);
									}
									if (msg.guild.member(msg.author).roles && msg.guild.member(user).roles) {
										if (+msg.guild.member(msg.author).roles.highest.rawPosition < +msg.guild.member(user).roles.highest.rawPosition || +msg.guild.member(msg.author).roles.highest.rawPosition == +msg.guild.member(user).roles.highest.rawPosition) {
											msg.reply('You cant tempmute this user');
											return;
										}
									}
								}
							}
							msg.guild.member(user).roles.add(MuteRole).catch(() => {});
						}
						let durations;
						const result = await pool.query(`SELECT * FROM warns WHERE type = 'Mute' AND guildid = '${msg.guild.id}' AND userid = '${user.id}' AND closed = 'false'`);
						if (result !== undefined && result.rows[0] !== undefined) {
							durations = result.rows[0].duration;
						}
						if (durations) return msg.reply('This user has already been tempmuted, their tempmute still lasts '+ms(+durations - Date.now()));
						if (!MuteRole) {
							msg.reply('To use the `h!mute` and `h!tempmute` command you need a role called `Muted` (Also remember to set it up correctly -> Deny `Send messages` in all channels)\nIf you dont want a role called "Muted" use the `h!muterole` command to set a custom role.');
							return;
						}
						if (logchannel)logchannel.send(TempmuteLog).catch(() => {});
						msg.channel.send(ReplyEmbed).catch(() => {});
						user.send(TempmutedDMEmbed).catch(() => {});
						TempmuteReason = TempmuteReason.replace(/'/g, '');
						TempmuteReason = TempmuteReason.replace(/`/g, '\\`');
						pool.query(`INSERT INTO warns (guildid, userid, reason, type, duration, closed, warnnr, dateofwarn, warnedinchannelid, warnedbyuserid, warnedinchannelname, warnedbyusername) VALUES ('${msg.guild.id}', '${user.id}', '${TempmuteReason}', 'Mute', '${Date.now() + +duration}', 'false', '${warnnr}', '${Date.now()}', '${msg.channel.id}', '${msg.author.id}', '${msg.channel.name.replace(/'/g, '').replace(/`/g, '')}', '${msg.author.username.replace(/'/g, '').replace(/`/g, '')}')`);				}
				}
			}
		}
	}
};