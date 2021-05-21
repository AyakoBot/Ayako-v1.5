const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'check',
	Category: 'Moderation',
	DMallowed: 'Yes',
	description: 'Check a Users Warn and Mute log, also see if said User is banned from the server and the ban reason',
	usage: 'h!check (user ID or mention)',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (msg.channel.type == 'dm') {
			let user = msg.author;
			checkFunction(user);
		} else {
			if (msg.mentions.users.first()){
				checkFunction(msg.mentions.users.first());
			} else {
				if(args[0]){
					client.users.fetch(args[0]).then(user => {

						if(user && user.id){
							checkFunction(user);
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
					checkFunction(user);
				}
			}
		}



		async function checkFunction(user){
			if (msg.channel.type == 'dm') {
				let warns = [];
				let mutes = [];
				warns.reasons = '';
				mutes.reasons = '';
				const result = await pool.query(`SELECT * FROM warns WHERE userid = '${msg.author.id}'`);
				if (result == undefined) {
					warns.amount = null;
				}
				if (result.rows[0] == undefined) {
					warns.amount = null;
				}
				if (result.rows[0]) {
					warns.amount = 1;
					for (let i = 0; i < result.rowCount; i++) {
						const guild = client.guilds.cache.get(result.rows[i].guildid);
						let guildname;
						if (!guild || !guild.id) {
							guildname = 'Unknown Server';
						} else {
							guildname = guild.name;
						}
						if (result.rows[i].type == 'Warn') {
							warns.reasons += `${result.rows[i].warnnr}. | ${guildname} | ${result.rows[i].reason}\n`;
						} 
						if (result.rows[i].type == 'Mute') {
							mutes.reasons += `${result.rows[i].warnnr}. | ${guildname} | ${result.rows[i].reason}\n`;
						} 
					}
				}
				if (warns.reasons) {
					warns.reasons = `\`\`\`ID | Server | Reason\n${warns.reasons}\`\`\``;
				}
				if (mutes.reasons) {
					mutes.reasons = `\`\`\`ID | Server | Reason\n${mutes.reasons}\`\`\``;
				} 
				const ReplyEmbed = new Discord.MessageEmbed()
					.setAuthor(`${msg.author.username} / ${msg.author.id}`, msg.author.displayAvatarURL())
					.setDescription(`__**Warns of ${msg.author}**__\n${warns.reasons}\n\n__**Mutes of ${msg.author}**__\n${mutes.reasons}`)
					.setTimestamp()
					.setColor('#b0ff00')
					.setFooter('Use |h!warninfo [user ID or mention] [warn ID]| to see more info ');
				msg.channel.send(ReplyEmbed);
			} else {
				let warns = [];
				let mutes = [];
				warns.reasons = '';
				mutes.reasons = '';
				const warnrnredo = await pool.query(`SELECT * FROM warns WHERE userid = '${user.id}' AND guildid = '${msg.guild.id}'`);
				if (warnrnredo !== undefined) {
					if (warnrnredo.rows[0] !== undefined) {
						for (let i = 0; i < warnrnredo.rowCount; i++) {
							let l = i;
							l++;
							if (l == null) {
								l = 1;
							}
							pool.query(`UPDATE warns SET warnnr = '${l}' WHERE guildid = '${msg.guild.id}' AND userid = '${user.id}' AND dateofwarn = ${warnrnredo.rows[i].dateofwarn}`);
						}
					}
				}
				const result = await pool.query(`SELECT * FROM warns WHERE guildid = '${msg.guild.id}' AND userid = '${user.id}'`);
				if (result == undefined) {
					warns.amount = null;
				}
				if (result.rows[0] == undefined) {
					warns.amount = null;
				}
				if (result.rows[0]) {
					warns.amount = 1;
					for (let i = 0; i < result.rowCount; i++) {
						if (result.rows[i].type == 'Warn') {
							warns.reasons += result.rows[i].warnnr+'. | '+result.rows[i].reason+'\n';
						} 
						if (result.rows[i].type == 'Mute') {
							mutes.reasons += result.rows[i].warnnr+'. | '+result.rows[i].reason+'\n';
						} 
					}
				}
				if (warns.reasons) {
					warns.reasons = `\`\`\`ID | Reason\n${warns.reasons}\`\`\``;
				}
				if (mutes.reasons) {
					mutes.reasons = `\`\`\`ID | Reason\n${mutes.reasons}\`\`\``;
				} 
				const ReplyEmbed = new Discord.MessageEmbed()
					.setAuthor(`${user.username} / ${user.id}`, user.displayAvatarURL())
					.setDescription(`__**Warns of ${user}**__\n${warns.reasons}\n\n__**Mutes of ${user}**__\n${mutes.reasons}\n\n<a:load:670163928122130444> Checking Bans`)
					.setTimestamp()
					.setColor('#b0ff00')
					.setFooter(`Requested by ${msg.author.username} \nUse |h!warninfo [user ID or mention] [warn ID]| to see more info`);
				const m = await msg.channel.send(ReplyEmbed);
				let bannedUser;
				bannedUser = await msg.guild.fetchBan(user).catch(() => {});
				if (bannedUser) {
					ReplyEmbed.addField('\u200b', `**${user} is banned from the server**\nReason: \`\`\`${bannedUser.reason}\`\`\``);
					ReplyEmbed.setDescription(`__**Warns of ${user}**__\n${warns.reasons}\n\n__**Mutes of ${user}**__\n${mutes.reasons}`);
					m.edit(ReplyEmbed);
				} else {
					ReplyEmbed.addField('\u200b', `**${user} is not banned from the server**`);
					ReplyEmbed.setDescription(`__**Warns of ${user}**__\n${warns.reasons}\n\n__**Mutes of ${user}**__\n${mutes.reasons}`);
					m.edit(ReplyEmbed);
				}
			}
		}
	}};