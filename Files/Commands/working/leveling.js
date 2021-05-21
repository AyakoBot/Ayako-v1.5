const Discord = require('discord.js');
const { pool } = require('../files/Database');
module.exports = {
	name: 'leveling',
	Category: 'Leveling',
	requiredPermissions: 4,
	description: 'Displays the current leveling settings of the server and all leveling related commands',
	usage: 'h!leveling\nh!leveling [enable/disable]\nh!leveling nolevelchannel [set/delete] [channel ID or mention]\nh!leveling xpgain [new multiplier]\nh!leveling levelupmode [silent/reactions]\nh!leveling levelupmode messages (text to be displayed {user} = user, {level} = new level)\nh!leveling levelupchannel [channel ID or mention/trigger]',
	/* eslint-disable */
	async execute(msg, args, client, prefix, auth, command, logchannelid, permLevel, errorchannelID) {
	/* eslint-enable */
		let settings = [];
		const res = await pool.query(`SELECT * FROM levelsettings WHERE guildid = '${msg.guild.id}'`);
		if (res.rows[0] == undefined) {
			settings.xpgain = 1;
			settings.blchannelid = [];
			settings.disabled = false;
			pool.query(`INSERT INTO levelsettings (guildid, xpgain, disabled, lvlupmode) VALUES ('${msg.guild.id}', '${settings.xpgain}', '${settings.disabled}', 'silent')`);
		} else if (res.rows[0] !== undefined) {
			settings.xpgain = res.rows[0].xpgain;
			settings.blchannelid = res.rows[0].blchannelid;
			settings.disabled = res.rows[0].disabled;
			settings.lvlupmode = res.rows[0].lvlupmode;
		}

		let roles = 'Level - Role\n';
		const resR = await pool.query(`SELECT * FROM levelroles WHERE guildid = '${msg.guild.id}'`);
		if (resR !== undefined && res.rows[0] !== undefined) {	
			resR.rows.sort((a,b) => a.level - b.level);
			for (let i = 0; i < resR.rowCount; i++) {
				const rolecheck = await rolechecker(resR.rows[i].roleid);
				if (rolecheck == false) {
					roles += `${resR.rows[i].level} - <@&${resR.rows[i].roleid}>\n`;
				}
			}
		} else {
			roles = 'No roles set';
		}
		const channelcheck = await channelchecker(settings);
		if (channelcheck == true) {
			const res2 = await pool.query(`SELECT * FROM levelsettings WHERE guildid = '${msg.guild.id}'`);
			if (res2 !== undefined && res2.rows[0] !== undefined) {	
				settings = res2.rows[0];
			} else {
				settings = [];
				settings.disabled = false;
				settings.xpgain = 1;
				settings.blchannelid = [];
				settings.lvlupmode = 'silent';
			}
		}
		if (!args[0]) {
			let blchannels;
			let xpgain;
			let leveling;
			let embed = new Discord.MessageEmbed();
			if (settings.blchannelid) {blchannels = settings.blchannelid.map(c => `<#${c}>`);} else {blchannels = 'There are no "No level" channels';}
			if (settings.xpgain) {xpgain = settings.xpgain;} else {xpgain = '1';}
			if (settings.disabled) {leveling = '<:Cross:746392936807268474> Disabled';} else {leveling = '<:tick:670163913370894346> Enabled';}
			if (settings.lvlupmode == 'messages' && settings.lvlupchannel) settings.lvlupmode = `${settings.lvlupmode} <#${settings.lvlupchannel}>`;
			if (settings.lvlupmode == undefined) settings.lvlupmode = 'silent';
			if (settings) {
				embed.setTitle(`${msg.guild.name} server Leveling settings`);
				embed.addFields(
					{name: '\u200b', value: '**Settings**', inline: false},
					{name: 'Leveling', value: '\u200b'+leveling, inline: false},
					{name: 'No Level Channels:', value: '\u200b'+blchannels, inline: false},
					{name: 'XP Gain multiplier', value: '\u200b'+xpgain+'x', inline: false},
					{name: 'Levleroles', value: '\u200b'+roles, inline: false},
					{name: 'Level-up mode', value: '\u200b'+settings.lvlupmode, inline: false},
					{name: '\u200b', value: '**Settings Edit Help**', inline: false},
					{name: '`h!leveling enable`/`h!leveling disable`', value: 'Enables or Disables Leveling Completely \n**(It is recommended to use Level-Up mode `silent` instead)**', inline: false},
					{name: '`h!leveling nolevelchannel [set/delete] [channel ID or Mention]`', value: 'Enables or Disables Leveling in a specific Channel', inline: false},
					{name: '`h!leveling xpgain [new multiplier]`', value: 'Edit the Leveling Multiplier (ranges from x0.1 to x5.0)', inline: false},
					{name: '`h!levelrole [Role ID, Mention or Name] [Level]`', value: 'Role Rewards upon advancing to the specified level (Use `delete` to remove a role)', inline: false},
					{name: '`h!leveling levelupmode [silent/reactions]`\n`h!leveling levelupmode messages (text to be displayed {user} = user, {level} = new level)`', value: 'Set the way Level-Ups will be indicated', inline: false},
					{name: '`h!leveling levelupchannel [channel ID or Mention/trigger]`', value: 'Set the Channel where Level-Up messages will be sent \n**(Only works on Level-Up mode `messages`)**\nOption `trigger` is the channel in which the level-up was triggered', inline: false},
				);	
				embed.setColor('b0ff00');
				embed.setAuthor('Ayako Leveling [Click here to invite me]', client.user.displayAvatarURL(), 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot');
				embed.setFooter('Edit Leveling options in h!leveling');
				msg.channel.send(embed);
			}
		} else {
			if (args[0].toLowerCase() == 'levelupchannel') {
				if (settings.lvlupmode !== 'messages') return msg.reply('This only works on Level-Up mode `messages`');
				if (args[1].toLowerCase() == 'trigger') {
					msg.reply('Level-Up messages will from now on be sent in the channel with the triggering message');
					pool.query(`UPDATE levelsettings SET lvlupchannel = null WHERE guildid = '${msg.guild.id}'`);
					return;
				} else {
					let channel = client.channels.cache.get(args[1].replace(/\D+/g, ''));
					if (!channel || !channel.id) {
						msg.reply('That was not a valid Channel ID or mention');
						return;
					}
					if (channel.guild.id !== msg.guild.id) {
						msg.reply('You cant set Levelup channels for other servers');
						return;
					}
					let hadtocatch;
					channel.send('This is now the Level-up channel').catch(() => {
						hadtocatch = true;
						msg.reply('I cant send messages there! Please either give my role `Administrator` permissions or `View Channel`, `Embed Links` and `Attach Files` permissions in that channel.');
					});
					if (!hadtocatch) {
						msg.reply(`${channel} is now the level-up Channel`);
					}
					pool.query(`UPDATE levelsettings SET lvlupchannel = '${channel.id}' WHERE guildid = '${msg.guild.id}'`);
				}
			} else
			if (args[0].toLowerCase() == 'nolevelchannel') {
				const answer = args[2];
				if (!args[1]) msg.reply('You need to tell me if you want to `set` or `delete` a nolevelchannel');
				if (args[1].toLowerCase() == 'set') {
					if (!answer) return msg.reply('Please specify the channel you want to edit level behaviour in');
					if (answer.length == 21 && answer.includes('<#') && answer.includes('>')) {
						const rawchannelid = answer.replace(/<#/g, '').replace(/>/g, '');
						const channel = msg.guild.channels.cache.get(rawchannelid);
						if (!channel || !channel.id) {
							msg.reply('The mention you entered is not valid. Please try again.');
						} else if (channel && channel.id) {
							if (settings.blchannelid && settings.blchannelid.includes(channel.id)) {
								return msg.reply('Leveling is already disabled in that channel.');
							} else if (settings.blchannelid == null) {
								settings.blchannelid = [`${channel.id}`];
								msg.reply(`${channel} is no longer a leveling channel.`);
							} else {
								settings.blchannelid.push(channel.id);
								msg.reply(`${channel} is no longer a leveling channel.`);
							}
						} else {
							msg.reply('The role Name you entered is not valid. Please try again.');
						}
					} else if (answer.length == 18 && !isNaN(answer)) {
						const channel = msg.guild.channels.cache.get(answer);
						if (!channel || !channel.id) {
							msg.reply('The mention you entered is not valid. Please try again.');
						} else if (channel && channel.id) {
							if (settings.blchannelid && settings.blchannelid.includes(channel.id)) {
								return msg.reply('Leveling is already disabled in that channel.');
							} else if (settings.blchannelid == null) {
								settings.blchannelid = [`${channel.id}`];
								msg.reply(`${channel} is no longer a leveling channel.`);
							} else {
								settings.blchannelid.push(channel.id);
								msg.reply(`${channel} is no longer a leveling channel.`);
							}
						} else {
							msg.reply('The role Name you entered is not valid. Please try again.');
						}
					} else {
						msg.reply('The role Name you entered is not valid. Please try again.');
					}
				} else 
				if (args[1].toLowerCase() == 'delete') {
					if (!answer) return msg.reply('Please specify the channel you want to edit level behaviour in');
					if (answer.length == 21 && answer.includes('<#') && answer.includes('>')) {
						const rawchannelid = answer.replace(/<#/g, '').replace(/>/g, '');
						const channel = msg.guild.channels.cache.get(rawchannelid);
						if (!channel || !channel.id) {
							msg.reply('The mention you entered is not valid. Please try again.');
						} else if (channel && channel.id) {
							if (settings.blchannelid && settings.blchannelid.includes(channel.id)) {
								settings.blchannelid.splice(settings.blchannelid.indexOf(channel.id), 1);
								msg.reply(`${channel} is now again a leveling channel.`);
							} else if (settings.blchannelid == null) {
								msg.reply('That channel is not blacklisted.');
							}
						} else {
							msg.reply('The role Name you entered is not valid. Please try again.');
						}
					} else if (answer.length == 18 && !isNaN(answer)) {
						const channel = msg.guild.channels.cache.get(answer);
						if (!channel || !channel.id) {
							msg.reply('The mention you entered is not valid. Please try again.');
						} else if (channel && channel.id) {
							if (settings.blchannelid && settings.blchannelid.includes(channel.id)) {
								settings.blchannelid.splice(settings.blchannelid.indexOf(channel.id), 1);
								msg.reply(`${channel} is now again a leveling channel.`);
							} else {
								msg.reply('That channel is not blacklisted.');
							}
						} else {
							msg.reply('The role Name you entered is not valid. Please try again.');
						}
					} else {
						msg.reply('The role Name you entered is not valid. Please try again.');
					}
				} else {
					return msg.reply('You either have to `set` or `delete` this channel from NoLevelingChannels');
				}
				if (settings.blchannelid.length == 0) {
					pool.query(`UPDATE levelsettings SET blchannelid = null WHERE guildid = '${msg.guild.id}'`);
				} else {
					pool.query(`UPDATE levelsettings SET blchannelid = ARRAY[${settings.blchannelid}] WHERE guildid = '${msg.guild.id}'`);
				}
			} else
			if (args[0].toLowerCase() == 'xpgain') {
				if (!args[1]) return msg.reply('You need to enter a multiplier beween 0.1 and 5.0');
				if (isNaN(args[1])) {
					return msg.reply('You need to enter an actual number as XP gain multiplyer');  
				} else {
					if (+args[1] > 5) {
						return msg.reply('You may only enter multiplyers below 5'); 
					} else {
						settings.xpgain = args[1];
						pool.query(`UPDATE levelsettings SET xpgain = '${settings.xpgain.replace(',', '.')}' WHERE guildid = '${msg.guild.id}'`);
						msg.reply(`XP gain will now be multiplied by ${settings.xpgain}x - That makes one message worth about ${Math.floor(20 * +settings.xpgain)}xp`);
					}
				}
			} else
			if (args[0].toLowerCase() == 'disable') {
				settings.disable = true;
				pool.query(`UPDATE levelsettings SET disabled = '${settings.disable}' WHERE guildid = '${msg.guild.id}'`);
				msg.reply('Leveling is now Disabled');
			} else
			if (args[0].toLowerCase() == 'enable') {
				settings.disable = false;
				pool.query(`UPDATE levelsettings SET disabled = '${settings.disable}' WHERE guildid = '${msg.guild.id}'`);
				msg.reply('Leveling is now Enabled');
			} else
			if (args[0].toLowerCase() == 'mode' || args[0].toLowerCase() == 'levelupmode') {
				if (!args[1]) return msg.reply('You need to enter a mode - `h!leveling mode [messages/reactions/silent]`');
				if (args[1].toLowerCase() == 'silent') {
					if (settings.lvlupmode == 'silent') return msg.reply('That mode is already enabled');
					pool.query(`UPDATE levelsettings SET lvlupmode = 'silent' WHERE guildid = '${msg.guild.id}'`);
					msg.reply('I will no longer indicate a level-up');
				} else if (args[1].toLowerCase() == 'reactions') {
					if (settings.lvlupmode == 'reactions') return msg.reply('That mode is already enabled');
					pool.query(`UPDATE levelsettings SET lvlupmode = 'reactions' WHERE guildid = '${msg.guild.id}'`);
					msg.reply('I will now indicate a level-up by reacting to the message with -> <:AyakoLurkPeek:762021849558810644> 🆙');
				} else if (args[1].toLowerCase() == 'messages') {
					const text = args.slice(2).join(' ').replace('\'', '/u2b');
					if (text) {
						pool.query(`UPDATE levelsettings SET text = '${text}' WHERE guildid = '${msg.guild.id}'`);
						pool.query(`UPDATE levelsettings SET lvlupmode = 'messages' WHERE guildid = '${msg.guild.id}'`);
						msg.reply(`I will now indicate a level-up by sending a message\n**Text:** ${text.replace('/u2b', '\'').replace('{user}', `${msg.author}`).replace('{level}', '14')}`);
					} else {
						if (settings.lvlupmode == 'messages') return msg.reply('That mode is already enabled');
						pool.query(`UPDATE levelsettings SET lvlupmode = 'messages' WHERE guildid = '${msg.guild.id}'`);
						msg.reply('I will now indicate a level-up by sending a message');
					}
				} else {
					return msg.reply('That was not a valid mode - `silent` `reactions` `messages`');
				}
			} else {
				msg.reply('That wasnt a valid setting');
			}
		}

		async function channelchecker(settings) {
			if (settings.blchannelid == null) {
				return false;
			} else {
				settings.blchannelid.forEach((channelid) => {
					const channel = msg.guild.channels.cache.get(channelid);
					if (!channel || channel == undefined) {
						const index = settings.blchannelid.indexOf(channelid);
						if (index > -1) {
							settings.blchannelid.splice(index, 1);
						}
						if (settings.blchannelid.length == 0) {
							pool.query(`UPDATE levelsettings SET blchannelid = null WHERE guildid = '${msg.guild.id}'`);
						} else {
							pool.query(`UPDATE levelsettings SET blchannelid = ARRAY[${settings.blchannelid}] WHERE guildid = '${msg.guild.id}'`);
						}
						return true;
					} else if (channel && channel.id) {
						return false;
					}
				});
			}
		}
		async function rolechecker(roleid) {
			const role = msg.guild.roles.cache.get(roleid);
			if (!role || role == undefined) {
				pool.query(`DELETE FROM levelroles WHERE roleid = '${roleid}' AND guildid = '${msg.guild.id}'`);
				return true;
			} else if (role && role.id) {
				return false;
			}
		}  
	}
};