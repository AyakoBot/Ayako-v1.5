const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
const moment = require('moment');
require('moment-duration-format');
const ms = require('ms');

module.exports = {
	name: 'warninfo',
	Category: 'Moderation',
	DMallowed: 'Yes',
	description: 'Display info about a warn of a user',
	usage: 'h!warninfo [user ID or mention] [warn ID]',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (msg.channel.type == 'dm') {
			let user = msg.author;
			warninfoFunction(user);
		} else {
			if (msg.mentions.users.first()){
				warninfoFunction(msg.mentions.users.first());
			} else {
				if(args[0]){
					client.users.fetch(args[0]).then(user => {

						if(user && user.id){
							warninfoFunction(user);
						}else{
							msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 1');
						}
					}).catch(e=>{
						msg.reply('this user doesn\'t exist, be sure to provide a valid user ID or mention. **If you mentioned a user, use their ID instead**. Error code 2');
						/* eslint-disable */
					let error;
					error = e;
					/* eslint-enable */
					}).catch(() => {});
				} else {
					let user = msg.author;
					warninfoFunction(user);
				}
			}
		}



		async function warninfoFunction(user){
			if (msg.channel.type == 'dm') {
				if (!args[0]) return msg.reply('You need to provide a warn ID, look these up in `h!check`');
				if (isNaN(args[0])) return msg.reply('In DMs I only need the warn ID. Not a User');
				const res = await pool.query(`SELECT * FROM warns WHERE userid = '${msg.author.id}' AND warnnr = '${args[0]}'`);
				if (res) {
					if (res.rows[0] !== null && res.rows[0] !== undefined) {
						for (let i = 0; i < res.rowCount; i++) {
							const guild = client.guilds.cache.get(res.rows[i].guildid);
							let guildresolved = [];
							if (guild && guild.id) {
								guildresolved.name = guild.name;
								guildresolved.id = guild.id;
							} else {
								guildresolved.name = 'Unknown Server';
								guildresolved.id = 'Unknown Server';
							}
							if (res.rows[i].warnedinchannelid !== null) {
								let timeleft;
								if (res.rows[i].closed == false) {
									timeleft = `\n**Time left:** \n\`${moment.duration(+res.rows[i].duration - +Date.now()).format(' D [days], H [hrs], m [mins], s [secs]')}\``;
								} else {
									timeleft = '';
								}
								if (res.rows[i]) {
									if (res.rows[i].duration) {
										const replyEmbed = new Discord.MessageEmbed()
											.setDescription(`Warn Info of user ${msg.author}`)
											.setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL())
											.setThumbnail(msg.author.displayAvatarURL())
											.addFields(
												{name: 'User', value: `\u200b<@${res.rows[i].userid}>\n\`${msg.author.username}\`\n\`${res.rows[i].userid}\``, inline: true},
												{name: 'Mute Reason', value: `\u200b\`\`\`${res.rows[i].reason}\`\`\``, inline: true},
												{name: 'Warn Type', value: `\u200b\`${res.rows[i].type}\``, inline: true},
												{name: 'Mute Duration', value: `\u200b\`${ms(+res.rows[i].duration - +res.rows[i].dateofwarn)}\``, inline: true},
												{name: 'Mute Closed?', value: `\u200b\`${res.rows[i].closed}\`${timeleft}`, inline: true},
												{name: 'Warn Number', value: `\u200b\`${res.rows[i].warnnr}\``, inline: true},
												{name: 'Date of Warn', value: `\u200b\`${new Date(+res.rows[i].dateofwarn).toUTCString()}\``, inline: true},
												{name: 'Warned in Channel', value: `\u200b<#${res.rows[i].warnedinchannelid}>\n\`${res.rows[i].warnedinchannelname}\``, inline: true},
												{name: 'Warned by User', value: `\u200b<@${res.rows[i].warnedbyuserid}>\n\`${res.rows[i].warnedbyusername}\`\n\`${res.rows[i].warnedbyuserid}\``, inline: true},
												{name: 'Warned in Server', value: `\u200b${guildresolved.name}\n${guildresolved.id}`, inline: true},
											)                                
											.setColor('b0ff00')
											.setFooter('Requested by '+msg.author.username);
										msg.channel.send(replyEmbed).catch(() => {});
									} else {
										const replyEmbed = new Discord.MessageEmbed()
											.setDescription(`Warn Info of user ${msg.author}`)
											.setAuthor(`${msg.author.tag}`, msg.author.displayAvatarURL())
											.setThumbnail(msg.author.displayAvatarURL())
											.addFields(
												{name: 'User', value: `\u200b<@${res.rows[i].userid}>\n\`${msg.author.username}\`\n\`${res.rows[i].userid}\``, inline: true},
												{name: 'Mute Reason', value: `\u200b\`\`\`${res.rows[i].reason}\`\`\``, inline: true},
												{name: 'Warn Type', value: `\u200b\`${res.rows[i].type}\``, inline: true},
												{name: 'Warn Number', value: `\u200b\`${res.rows[i].warnnr}\``, inline: true},
												{name: 'Date of Warn', value: `\u200b\`${new Date(+res.rows[i].dateofwarn).toUTCString()}\``, inline: true},
												{name: 'Warned in Channel', value: `\u200b<#${res.rows[i].warnedinchannelid}>\n\`${res.rows[i].warnedinchannelname}\``, inline: true},
												{name: 'Warned by User', value: `\u200b<@${res.rows[i].warnedbyuserid}>\n\`${res.rows[i].warnedbyusername}\`\n\`${res.rows[i].warnedbyuserid}\``, inline: true},
												{name: 'Warned in Server', value: `\u200b${guildresolved.name}\n${guildresolved.id}`, inline: true},
											)
											.setColor('b0ff00')
											.setFooter('Requested by '+msg.author.username);
										msg.channel.send(replyEmbed).catch(() => {});
									}
								} else {
									msg.reply('This is not a valid warn ID for this user.');
								}
							} else {
								if (res.rows[0]) {
									const replyEmbed = new Discord.MessageEmbed()
										.setDescription(`Warn Info of user ${user}`)
										.setAuthor(`${user.tag}`, user.displayAvatarURL())
										.setThumbnail(user.displayAvatarURL())
										.addFields(
											{name: 'User', value: `\u200b<@${res.rows[0].userid}>\n\`${user.username}\`\n\`${res.rows[0].userid}\``, inline: true},
											{name: 'Mute Reason', value: `\u200b\`\`\`${res.rows[0].reason}\`\`\``, inline: true},
											{name: 'Warn Type', value: `\u200b\`${res.rows[0].type}\``, inline: true},
											{name: 'Warn Number', value: `\u200b\`${res.rows[0].warnnr}\``, inline: true},
											{name: '\u200b', value: 'Sadly this is warn from before 5th January 2021 - Meaning no further details are available', inline: false},
											{name: 'Warned in Server', value: `\u200b${guildresolved.name}\n${guildresolved.id}`, inline: true},
										)
										.setColor('b0ff00')
										.setFooter('Requested by '+msg.author.username);
									msg.channel.send(replyEmbed).catch(() => {});
								} else {
									msg.reply('This is not a valid warn ID for this user.');
								}
							}
						}
					} else {
						msg.reply('This is not a valid warn ID for this user.');
					}
				} else {
					msg.reply('This user has no warns.');
				}
			} else {
				if (!args[1]) return msg.reply('You need to provide a warn ID, look these up in `h!check`');
				const res = await pool.query(`SELECT * FROM warns WHERE userid = '${user.id}' AND guildid = '${msg.guild.id}' AND warnnr = '${args[1]}'`);
				if (res) {
					if (res.rows[0] !== null && res.rows[0] !== undefined) {
						if (res.rows[0].warnedinchannelid !== null) {
							let timeleft;
							if (res.rows[0].closed == false) {
								timeleft = `\n**Time left:** \n\`${moment.duration(+res.rows[0].duration - +Date.now()).format(' D [days], H [hrs], m [mins], s [secs]')}\``;
							} else {
								timeleft = '';
							}
							if (res.rows[0]) {
								if (res.rows[0].duration) {
									const replyEmbed = new Discord.MessageEmbed()
										.setDescription(`Warn Info of user ${user}`)
										.setAuthor(`${user.tag}`, user.displayAvatarURL())
										.setThumbnail(user.displayAvatarURL())
										.addFields(
											{name: 'User', value: `\u200b<@${res.rows[0].userid}>\n\`${user.username}\`\n\`${res.rows[0].userid}\``, inline: true},
											{name: 'Mute Reason', value: `\u200b\`\`\`${res.rows[0].reason}\`\`\``, inline: true},
											{name: 'Warn Type', value: `\u200b\`${res.rows[0].type}\``, inline: true},
											{name: 'Mute Duration', value: `\u200b\`${ms(+res.rows[0].duration - +res.rows[0].dateofwarn)}\``, inline: true},
											{name: 'Mute Closed?', value: `\u200b\`${res.rows[0].closed}\`${timeleft}`, inline: true},
											{name: 'Warn Number', value: `\u200b\`${res.rows[0].warnnr}\``, inline: true},
											{name: 'Date of Warn', value: `\u200b\`${new Date(+res.rows[0].dateofwarn).toUTCString()}\``, inline: true},
											{name: 'Warned in Channel', value: `\u200b<#${res.rows[0].warnedinchannelid}>\n\`${res.rows[0].warnedinchannelname}\``, inline: true},
											{name: 'Warned by User', value: `\u200b<@${res.rows[0].warnedbyuserid}>\n\`${res.rows[0].warnedbyusername}\`\n\`${res.rows[0].warnedbyuserid}\``, inline: true},
										)                                
										.setColor('b0ff00')
										.setFooter('Requested by '+msg.author.username);
									msg.channel.send(replyEmbed).catch(() => {});
								} else {
									const replyEmbed = new Discord.MessageEmbed()
										.setDescription(`Warn Info of user ${user}`)
										.setAuthor(`${user.tag}`, user.displayAvatarURL())
										.setThumbnail(user.displayAvatarURL())
										.addFields(
											{name: 'User', value: `\u200b<@${res.rows[0].userid}>\n\`${user.username}\`\n\`${res.rows[0].userid}\``, inline: true},
											{name: 'Mute Reason', value: `\u200b\`\`\`${res.rows[0].reason}\`\`\``, inline: true},
											{name: 'Warn Type', value: `\u200b\`${res.rows[0].type}\``, inline: true},
											{name: 'Warn Number', value: `\u200b\`${res.rows[0].warnnr}\``, inline: true},
											{name: 'Date of Warn', value: `\u200b\`${new Date(+res.rows[0].dateofwarn).toUTCString()}\``, inline: true},
											{name: 'Warned in Channel', value: `\u200b<#${res.rows[0].warnedinchannelid}>\n\`${res.rows[0].warnedinchannelname}\``, inline: true},
											{name: 'Warned by User', value: `\u200b<@${res.rows[0].warnedbyuserid}>\n\`${res.rows[0].warnedbyusername}\`\n\`${res.rows[0].warnedbyuserid}\``, inline: true},
										)
										.setColor('b0ff00')
										.setFooter('Requested by '+msg.author.username);
									msg.channel.send(replyEmbed).catch(() => {});
								}
							} else {
								msg.reply('This is not a valid warn ID for this user.');
							}
						} else {
							if (res.rows[0]) {
								const replyEmbed = new Discord.MessageEmbed()
									.setDescription(`Warn Info of user ${user}`)
									.setAuthor(`${user.tag}`, user.displayAvatarURL())
									.setThumbnail(user.displayAvatarURL())
									.addFields(
										{name: 'User', value: `\u200b<@${res.rows[0].userid}>\n\`${user.username}\`\n\`${res.rows[0].userid}\``, inline: true},
										{name: 'Mute Reason', value: `\u200b\`\`\`${res.rows[0].reason}\`\`\``, inline: true},
										{name: 'Warn Type', value: `\u200b\`${res.rows[0].type}\``, inline: true},
										{name: 'Warn Number', value: `\u200b\`${res.rows[0].warnnr}\``, inline: true},
										{name: '\u200b', value: 'Sadly this is warn from before 5th January 2021 - Meaning no further details are available', inline: false},
									)
									.setColor('b0ff00')
									.setFooter('Requested by '+msg.author.username);
								msg.channel.send(replyEmbed).catch(() => {});
							} else {
								msg.reply('This is not a valid warn ID for this user.');
							}
						}
					} else {
						msg.reply('This is not a valid warn ID for this user.');
					}
				} else {
					msg.reply('This user has no warns.');
				}
			}
		}
	} 
};