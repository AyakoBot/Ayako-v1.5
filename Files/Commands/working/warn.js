const Discord = require('discord.js');
const { pool } = require('../files/Database.js');
module.exports = {
	name: 'warn',
	Category: 'Moderation',
	requiredPermissions: 4,
	description: 'Warn a user',
	usage: 'h!warn [user ID or mention] (reason)',
	/* eslint-disable */
	execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
	/* eslint-enable */
		if (msg.mentions.users.first()){
			warnFunction(msg.mentions.users.first(), logchannelid);
		} else {
			if(args[0]){
				client.users.fetch(args[0]).then(user => {

					if(user && user.id){
						warnFunction(user, logchannelid);
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
		async function warnFunction(user, logchannelid){
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
			const logchannel = client.channels.cache.get(logchannelid);
			let warnReason = args.slice(1).join(' ');
			if (msg.guild.id == '615041831670906882') {
				if (msg.guild.member(user).roles.cache.has('675920821490941963')) {
					if (msg.guild.member(user).roles.cache.has('675920825483788328')) {
						if (msg.guild.member(user).roles.cache.has('675867915861491713')) {
							msg.reply('This member already has their third warn.');
						}
						var warn3role = msg.guild.roles.cache.find(role => role.id === '675867915861491713');
						msg.guild.member(user).roles.add(warn3role);
					} 
					var warn2role = msg.guild.roles.cache.find(role => role.id === '675920825483788328');
					msg.guild.member(user).roles.add(warn2role);
				}
				var warn1role = msg.guild.roles.cache.find(role => role.id === '675920821490941963');
				msg.guild.member(user).roles.add(warn1role);
			}
			if (!warnReason) warnReason = 'No reason given';
			if (!user) {
				msg.reply('Could not find that user.');
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
						msg.reply('You cant warn this user.');
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
					const warnEmbed = new Discord.MessageEmbed()
						.setTitle(`You have been warned on the server __${msg.guild.name}__`)
						.setColor('#ff0000')
						.setDescription('```'+warnReason+'```')
						.setTimestamp();
					user.send(warnEmbed).catch(() => {});
					var ReplyEmbed = new Discord.MessageEmbed()
						.setDescription(`${user} was warned\nWarn Number ${warnnr}.`)
						.setColor('#ff0000')
						.setTimestamp();
					msg.channel.send(ReplyEmbed).catch(() => {});
					const WarnLogEmbed = new Discord.MessageEmbed()
						.setTitle(`${user.username} has been warned on the server ${msg.guild.name}`)
						.setThumbnail(user.displayAvatarURL())
						.setDescription(`${user} was warned by ${msg.author}`)
						.addField('Reason:', `${warnReason}`)
						.setColor('#ff0000')
						.setFooter(`Warned user ID: ${user.id}\nExecutor user ID: ${msg.author.id}\n`)
						.setTimestamp();
					if (logchannel)logchannel.send(WarnLogEmbed).catch(() => {});
					warnReason = warnReason.replace(/'/g, '');
					warnReason = warnReason.replace(/`/g, '\\`');
					pool.query(`INSERT INTO warns (guildid, userid, reason, type, warnnr, dateofwarn, warnedinchannelid, warnedbyuserid, warnedinchannelname, warnedbyusername) VALUES ('${msg.guild.id}', '${user.id}', '${warnReason}', 'Warn', ${warnnr}, '${Date.now()}', '${msg.channel.id}', '${msg.author.id}', '${msg.channel.name.replace(/'/g, '').replace(/`/g, '')}', '${msg.author.username.replace(/'/g, '').replace(/`/g, '')}')`);
				}
			}
		}
	} 
};