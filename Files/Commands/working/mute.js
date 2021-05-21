const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'mute',
	requiredPermissions: 3,
	Category: 'Moderation',
	description: 'Permanently mutes a user',
	usage: 'h!mute [user ID or mention] (reason)',
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


		function muteFunction(user, logchannelid){
			const logchannel = client.channels.cache.get(logchannelid);
			let MuteRole;
			pool.query(`SELECT muteroleid FROM muterole WHERE guildid = '${msg.guild.id}';`, (err, result) => {
				const restext = `${result.rows[0]}`;
				if (restext !== 'undefined') {
					MuteRole = msg.guild.roles.cache.find(role => role.id === result.rows[0].muteroleid);
					MuteRoleF(MuteRole);
				} else {
					MuteRoleF(MuteRole);
				}
			});
			function MuteRoleF(MuteRole) {
				
				if (!MuteRole) MuteRole = msg.guild.roles.cache.find(role => role.name === 'Muted');
				if (!MuteRole) {
					msg.reply('To use the `h!mute` and `h!tempmute` command you need a role called `Muted` (Also remember to set it up correctly -> Deny `Send messages` in all channels)\nIf you dont want a role called "Muted" use the `h!muterole` command to set a custom role.');
					return;
				}
				if (+msg.guild.member(client.user).roles.highest.rawPosition < +MuteRole.rawPosition) {
					msg.reply(`I cant mute this user since Im not able to access the MuteRole, please move my role (called Ayako) above the role ${MuteRole}`);
				}
				if (msg.guild.member(client.user).roles.highest.rawPosition < MuteRole.rawPosition) {
					return msg.reply('I cant mute anyone since the MuteRole is above my highest role on the Role List.');
				}
				let muteReason = args.slice(1).join(' ');
				if (!muteReason) muteReason = 'no reason given';
				if (msg.guild.id == '298954459172700181' || msg.guild.id == '366219406776336385') {
					var mutedDMEmbed = new Discord.MessageEmbed()
						.setTitle(`You have been muted on the server __${msg.guild.name}__`)
						.setColor('#ff0000')
						.setDescription(`Reason: \`\`\`${muteReason}\`\`\``)
						.addField('You can appeal for your punishment here:', 'https://docs.google.com/forms/d/1MMqfbW8G2Ihfhn-Zm7UkR6UfnrNj4vS8gyivZhGl2_E/')
						.setTimestamp();
				} else {
					mutedDMEmbed = new Discord.MessageEmbed()
						.setTitle(`You have been muted on the server __${msg.guild.name}__`)
						.setColor('#ff0000')
						.setDescription(`Reason: \`\`\`${muteReason}\`\`\``)
						.setTimestamp();
				}
				let warnnr;
				pool.query(`SELECT * FROM warns WHERE guildid = '${msg.guild.id}' AND userid = '${user.id}';`, (err, result) => {
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
							const res = await pool.query(`SELECT * FROM modroles WHERE guildid = '${msg.guild.id}';`);
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
						const muteLog = new Discord.MessageEmbed()
							.setTitle(user.username + ' was muted in the server '+ msg.guild.name)
							.setColor('ff0000')
							.setThumbnail(user.displayAvatarURL())
							.setDescription(`${user} was muted by ${msg.author}`)
							.addField('Reason:', muteReason)
							.setTimestamp()
							.setFooter('Muted user ID: ' +user.id+ ' \nExecutor user ID: '+msg.author.id+'\n');
						const mutedEmbed = new Discord.MessageEmbed()
							.setDescription(`${user} has been muted\nWarn Number ${warnnr}.`)
							.setColor('ff0000')
							.setTimestamp();
						msg.guild.member(user).roles.add(MuteRole).catch(() => {});
						if (logchannel)logchannel.send(muteLog).catch(() => {});
						msg.channel.send(mutedEmbed);
						muteReason = muteReason.replace(/'/g, '');
						muteReason = muteReason.replace(/`/g, '\\`');
						user.send(mutedDMEmbed).catch(() => {});
						pool.query(`INSERT INTO warns (guildid, userid, reason, type, duration, closed, warnnr, dateofwarn, warnedinchannelid, warnedbyuserid, warnedinchannelname, warnedbyusername) VALUES ('${msg.guild.id}', '${user.id}', '${muteReason}', 'Mute', null, null, '${warnnr}', '${Date.now()}', '${msg.channel.id}', '${msg.author.id}', '${msg.channel.name.replace(/'/g, '').replace(/`/g, '')}', '${msg.author.username.replace(/'/g, '').replace(/`/g, '')}');`);				
					}
				}
			}
		}
	}
};


