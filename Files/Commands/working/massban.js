const Discord = require('discord.js');

module.exports = {
	name: 'massban',
	requiredPermissions: 4,
	Category: 'Moderation',
	description: 'Ban as many users from the server as the Discord Character limit lets you',
	usage: 'h!massban [user IDs or mentions] (reason)',
	/* eslint-disable */
	async execute(msg, args, client, prefix, command, logchannelid, permLevel, errorchannelID ) {
		/* eslint-enable */
		if (!msg.guild.member(client.user).permissions.has('BAN_MEMBERS')) return msg.reply('I cant ban users. Missing Permissions.');
		if (!args[0]) return msg.reply('You need to enter at least 1 user');
		const users = [];
		const failed = [];
		const reason = [];
		const bans = await msg.guild.fetchBans(true);
		for (let i = 0; i < args.length; i++) {
			const arg = args[i].toLowerCase(); 
			if (isNaN(arg)) {
				if (arg.includes('<@') && arg.includes('>')) { 
					const userID = arg.replace(/<@/, '').replace(/!/g, '').replace(/>/g, '');
					const user = await client.users.fetch(userID).catch(() => {failed.push(arg);});
					if (user && user.id) {
						const bannedUser = bans.find(bans => bans.user.id === user.id);
						if (bannedUser) {
							failed.push(`${arg} (already banned)`);
						} else {
							if (user.id !== msg.author.id) {
								if (msg.guild.member(user)) {
									if (+msg.guild.member(msg.author).roles.highest.rawPosition > +msg.guild.member(user).roles.highest.rawPosition) {
										if (+msg.guild.member(msg.author).roles.highest.rawPosition !== +msg.guild.member(user).roles.highest.rawPosition) {
											if (msg.guild.member(user).bannable) {
												users.push(user);
											} else {
												failed.push(`${arg} (unable to ban)`);
											}
										} else { 
											failed.push(`${arg} (You cant ban this user)`);
										}
									} else {
										failed.push(`${arg} (You cant ban this user)`);
									}
								} else {
									users.push(user);
								}
							} else {
								failed.push(`${arg} (You cant ban yourself)`);
							}
						}
					} else {
						failed.push(arg);
					}
				} else {
					reason.push(arg);
				}
			} else {
				const user = await client.users.fetch(arg).catch(() => {failed.push(arg);});
				if (user && user.id) {
					const bannedUser = bans.find(bans => bans.user.id === arg);
					if (bannedUser) {
						failed.push(`${arg} (already banned)`);
					} else {
						if (user.id !== msg.author.id) {
							if (msg.guild.member(user)) {
								if (+msg.guild.member(msg.author).roles.highest.rawPosition > +msg.guild.member(user).roles.highest.rawPosition) {
									if (+msg.guild.member(msg.author).roles.highest.rawPosition !== +msg.guild.member(user).roles.highest.rawPosition) {
										if (msg.guild.member(user).bannable) {
											users.push(user);
										} else {
											failed.push(`${arg} (unable to ban)`);
										}
									} else { 
										failed.push(`${arg} (You cant ban this user)`);
									}
								} else {
									failed.push(`${arg} (You cant ban this user)`);
								}
							} else {
								users.push(user);
							}
						} else {
							failed.push(`${arg} (You cant ban yourself)`);
						}
					}
				} else {
					failed.push(arg);
				}
			}
		}
		let banreason = '';
		if (reason.length == 0) {
			banreason = ('no reaons provided');
		} else {
			reason.forEach((word) => {
				banreason += ` ${word}`;
			});
		}
		const uniqueUsers = users.filter((item, pos ,self) => self.indexOf(item) == pos);
		const uniqueFails = failed.filter((item, pos ,self) => self.indexOf(item) == pos);
		const descS = [];
		const descF = [];
		if (uniqueUsers.length !== 0) {
			const replyEmbed = new Discord.MessageEmbed()
				.setColor('1aff00')
				.setDescription('Users I successfully banned will appear here')
				.setAuthor('Successfully banned | Loading', 'https://cdn.discordapp.com/emojis/670163928122130444.gif?v=1', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setTimestamp();
			const m = await msg.channel.send(replyEmbed);

			uniqueUsers.forEach(async (user) => {
				await msg.guild.members.ban(user, {
					days: 1,
					reason: `Massban Executor: ${msg.author.tag} | ${banreason}`,
				}).catch(() => {});
				descS.push(`<@${user.id}>`);
				if (`${descS}`.length > 2048) {
					replyEmbed.setDescription(`\u200bSuccessfully banned ${descS.length} users`);
				} else {
					replyEmbed.setDescription(`\u200b${descS}`);
				}
				await m.edit(replyEmbed);
			});
			const intervalS = setInterval(async () => {
				if (descS.length == uniqueUsers.length) {
					if (`${descS}`.length > 2048) {
						replyEmbed.setDescription(`\u200bSuccessfully banned ${descS.length} users`);
					} else {
						replyEmbed.setDescription(`\u200b${descS}`);
					}
					replyEmbed.setAuthor('Finished bans', 'https://cdn.discordapp.com/emojis/670163913370894346.png?v=1', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot');
					clearInterval(intervalS);
					setTimeout(() => {
						m.edit(replyEmbed);
					}, 2000); 
				}
			}, 1000);
		}
		if (uniqueFails.length !== 0) {
			const replyEmbed = new Discord.MessageEmbed()
				.setColor('#ff0000')
				.setDescription('Users I failed to ban will appear here.')
				.setAuthor('Failed to ban | Loading', 'https://cdn.discordapp.com/emojis/670163928122130444.gif?v=1', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot')
				.setTimestamp();
			const m = await msg.channel.send(replyEmbed);

			uniqueFails.forEach(async (fail) => {
				descF.push(`${fail}\n`);
				if (`${descF}`.length > 2048) {
					replyEmbed.setDescription(`\u200bFailed to ban ${descF.length} times`);
				} else {
					replyEmbed.setDescription(`\u200b${descF}`);
				}
				await m.edit(replyEmbed);
			});
			const intervalF = setInterval(async () => {
				if (descF.length == uniqueFails.length) {
					if (`${descF}`.length > 2048) {
						replyEmbed.setDescription(`\u200bFailed to ban ${descF.length} times`);
					} else {
						replyEmbed.setDescription(`\u200b${descF}`);
					}
					replyEmbed.setAuthor('Failed to ban', 'https://cdn.discordapp.com/emojis/746392936807268474.png?v=1', 'https://discord.com/api/oauth2/authorize?client_id=650691698409734151&permissions=1576396919&scope=bot');
					clearInterval(intervalF);
					setTimeout(() => {
						m.edit(replyEmbed);
					}, 2000); 
				}
			}, 1000);
		}
		const interval = setInterval(() => {
			if (uniqueUsers.length == descS.length && uniqueFails.length == descF.length) { 
				const logembed = new Discord.MessageEmbed()
					.setTitle(`Massban executed by ${msg.author.username} on ${msg.guild.name}`)
					.setDescription(`${uniqueUsers.length} users have been banned by ${msg.author}`)
					.setColor('ff0000')
					.setTimestamp()
					.setFooter(`Executor user ID: ${msg.author.id}`);
				const logchannel = client.channels.cache.get(logchannelid);
				if (logchannel) {
					if (uniqueUsers.length !== 0) {
						logchannel.send(logembed);
					}
				}
				clearInterval(interval);
			}
		}, 1000);
		setTimeout(() => {
			clearInterval(interval);
		}, 60000);
	}
};

