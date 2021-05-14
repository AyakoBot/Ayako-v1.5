const Discord = require('discord.js');

module.exports = {
	async execute(msg) {
		if (msg.channel.type !== 'dm') {
			if (msg.author.bot) return;
			if (msg.guild.member(msg.author)) {
				if (msg.guild.member(msg.author).permissions.has('ADMINISTRATOR')) return;
			}
			const result = await pool.query(`SELECT * FROM blacklists WHERE guildid = '${msg.guild.id}'`);
			if (result !== undefined) {
				if (result.rowCount !== 0) {
					const args = msg.content.split(/ +/);
					let words = [];
					if (result.rows[0].words !== null) {
						const blwords = result.rows[0].words.split(/, +/g);
						for (let i = 0; i < args.length; i++) {
							const argr = `${args[i]}`.replace('\'', '').replace('`', '\\`').replace('?', '').replace('!', '').replace('.', '').replace(',', '').replace('-', '').replace('~', '').replace(';', '').replace(' ', '');
							if (blwords.includes(argr.toLowerCase())) {
								if (`${blwords[i]}` !== '') {
									words.push(argr.toLowerCase());
								}
							}
						}
						containedBlacklistedWord(msg, words, result);
					}
				}
			}
		}
		async function containedBlacklistedWord(msg, words, result) {
			if (!words[0]) return;
			await msg.delete().catch(() => {});
			msg.channel.send(`${msg.author} Please do not use this word.`).then((m) => {m.delete({timeout: 10000}).catch(() => {});}).catch(() => {});
			const res = await pool.query(`SELECT * FROM toxicitycheck WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}'`);
			let amount;
			if (res !== undefined) {
				if (res.rows[0] !== undefined) {
					await pool.query(`UPDATE toxicitycheck SET amount = '${+res.rows[0].amount + 1}' WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}'`);
					amount = res.rows[0].amount;
				} else {
					await pool.query(`INSERT INTO toxicitycheck (guildid, userid, amount) VALUES ('${msg.guild.id}', '${msg.author.id}', '1')`);
					amount = 0;
				}
			} else {
				amount = 0;
			}
			amount++;
			let logchannelid = '';
			const reslog = await pool.query(`SELECT * FROM logchannel WHERE guildid = '${msg.guild.id}'`);
			if (reslog && reslog.rowCount > 0) logchannelid = reslog.rows[0].modlogs;
			const logchannel = client.channels.cache.get(logchannelid);
			let warnnr;
			const resW = await pool.query(`SELECT * FROM warns WHERE guildid = '${msg.guild.id}' AND userid = '${msg.author.id}'`);
			if (resW !== undefined) {
				if (resW.rows[0] !== undefined) {
					warnnr = resW.rowCount;
				} else {
					warnnr = 1;
				}
			} else {
				warnnr = 1;
			}
			if (result.rows[0].warntof == true) {
				if (amount == +result.rows[0].warnafteramount) { 
					if (amount == 4) {
						let warnReason = 'Repeatedly saying Blacklisted words';
						const warnEmbed = new Discord.MessageEmbed()
							.setTitle(`You have been warned on the server __${msg.guild.name}__`)
							.setColor('#ff0000')
							.setDescription('```'+warnReason+'```')
							.setTimestamp();
						msg.author.send(warnEmbed).catch(() => {});
						const ReplyEmbed = new Discord.MessageEmbed()
							.setDescription(`${msg.author} was warned\nWarn Number ${warnnr}.`)
							.setColor('#ff0000')
							.setTimestamp();
						msg.channel.send(ReplyEmbed).catch(() => {});
						const WarnLogEmbed = new Discord.MessageEmbed()
							.setTitle(`${msg.author.username} has been warned on the server ${msg.guild.name}`)
							.setThumbnail(msg.author.displayAvatarURL())
							.setDescription(`${msg.author} was warned by ${client.user}`)
							.addField('Reason:', `${warnReason}`)
							.setColor('#ff0000')
							.setFooter(`Warned user ID: ${msg.author.id}\nExecutor user ID: ${client.user.id}\n`)
							.setTimestamp();
						if (logchannel)logchannel.send(WarnLogEmbed).catch(() => {});
						await pool.query(`INSERT INTO warns(guildid, userid, reason, type, warnnr, dateofwarn, warnedinchannelid, warnedbyuserid, warnedinchannelname, warnedbyusername) VALUES ('${msg.guild.id}', '${msg.author.id}', '${warnReason.replace(/'/g, '')}', 'Warn', '${warnnr}', '${Date.now()}', '${msg.channel.id}', '${client.user.id}', '${msg.channel.name.replace(/'/g, '')}', '${client.user.username.replace(/'/g, '')}')`).catch(() => {});
					}
				}
			}
			if (result.rows[0].mutetof == true) {
				if (amount % +result.rows[0].muteafteramount == 0) {
					if (amount == +result.rows[0].warnafteramount) return;
					let TempmuteReason = 'Repeatedly saying Blacklisted words';
					const MReplyEmbed = new Discord.MessageEmbed()
						.setDescription(`${msg.author} was muted\nWarn Number ${warnnr}.`)
						.setColor('#ff0000')
						.setTimestamp();
					const TempmuteLog = new Discord.MessageEmbed()
						.setTitle(msg.author.username + ' was tempmuted in the server '+ msg.guild.name)
						.setColor('ff0000')
						.setThumbnail(msg.author.displayAvatarURL())
						.setDescription(`${msg.author} was tempmuted by ${client.user}`)
						.addField('Reason:', TempmuteReason)
						.setTimestamp()
						.setFooter('Muted user ID: ' +msg.author.id+ ' \nExecutor user ID: '+client.user.id+'\n');
					const TempmutedDMEmbed = new Discord.MessageEmbed()
						.setTitle(`You have been muted on the server __${msg.guild.name}__`)
						.setColor('#ff0000')
						.setDescription(`Reason: \`\`\`${TempmuteReason}\`\`\``)
						.addField('Duration:', '1 Hour')
						.setTimestamp();
    
					let MuteRole;
					const res = await pool.query(`SELECT muteroleid FROM muterole WHERE guildid = '${msg.guild.id}'`);
					if (res !== undefined) {
						if (res.rows[0] !== undefined) {
							MuteRole = msg.guild.roles.cache.find(role => role.id === res.rows[0].muteroleid);
						}
					}
					if (!MuteRole) {
						MuteRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted');
					}
					if (MuteRole && MuteRole.id) {
						msg.guild.member(msg.author).roles.add(MuteRole).catch(() => {});
						if (logchannel)logchannel.send(TempmuteLog).catch(() => {});
						msg.channel.send(MReplyEmbed).catch(() => {});
						msg.author.send(TempmutedDMEmbed).catch(() => {});	
						await pool.query(`INSERT INTO warns (guildid, userid, reason, type, duration, closed, warnnr, dateofwarn, warnedinchannelid, warnedbyuserid, warnedinchannelname, warnedbyusername) VALUES ('${msg.guild.id}', '${msg.author.id}', '${TempmuteReason.replace(/'/g, '')}', 'Mute', '${Date.now() + +ms('1h')}', 'false', '${warnnr}', '${Date.now()}', '${msg.channel.id}', '${client.user.id}', '${msg.channel.name.replace(/'/g, '')}', '${client.user.username.replace(/'/g, '')}')`);
					} else {
						logchannel.send(`Couldn't mute ${msg.author} since there is no valid MuteRole set, to set one visit \`h!muterole\``);
					}
				}
			}
			const warnrnredo = await pool.query(`SELECT * FROM warns WHERE userid = '${msg.author.id}' AND guildid = '${msg.guild.id}'`);
			if (warnrnredo !== undefined) {
				if (warnrnredo.rows[0] !== undefined) {
					for (let i = 0; i < warnrnredo.rowCount; i++) {
						let l = i;
						l++;
						await pool.query(`UPDATE warns SET warnnr = '${l}' WHERE guildid = '${msg.guild.id}' AND userid = '${msg.author.id}' AND dateofwarn = ${warnrnredo.rows[i].dateofwarn}`);
					}
				}
			}
		}

	}
};