const Discord = require('discord.js');

module.exports = {
	name: 'massban',
	perm: 4n,
	dm: false,
	takesFirstArg: true,
	aliases: null,
	async execute(msg) {
		const args = msg.args[0] == 'ids' ? require('../ids.json').ids : msg.args;
		if (msg.args[0] == 'ids' && !args[0]) return msg.client.ch.reply(msg, msg.lan.noRaidIDs);
		const users = [];
		const failed = [];
		const reason = [];
		const bans = await msg.guild.fetchBans(true);
		for (let i = 0; i < args.length; i++) {
			const arg = args[i].toLowerCase(); 
			if (isNaN(arg)) {
				if (arg.includes('<@') && arg.includes('>')) { 
					const userID = arg.replace(/\D+/g, '');
					const user = await msg.client.users.fetch(userID).catch(() => {failed.push(arg);});
					if (user && user.id) {
						user.source = 'massban';
						user.guild = msg.guild;
						const bannedUser = bans.find(bans => bans.user.id === user.id);
						if (bannedUser) {
							failed.push(`${arg} `+msg.lan.already);
						} else {
							if (user.id !== msg.author.id) {
								const member = await msg.guild.members.fetch(user.id);
								if (member) {
									if (+msg.member.roles.highest.rawPosition > +member.roles.highest.rawPosition) {
										if (+msg.member.roles.highest.rawPosition !== +member.roles.highest.rawPosition) {
											if (member.bannable) users.push(user);
											else failed.push(`${arg} `+msg.lan.iCant);
										} else failed.push(`${arg} `+msg.lan.youCant);
									} else failed.push(`${arg} `+msg.lan.youCant);
								} else users.push(user);
							} else failed.push(`${arg} `+msg.lan.selfban);
						}
					} else failed.push(arg);
				} else reason.push(arg);
			} else {
				const user = await msg.client.users.fetch(arg).catch(() => {failed.push(arg);});
				if (user && user.id) {
					const bannedUser = bans.find(bans => bans.user.id === arg);
					if (bannedUser) {
						failed.push(`${arg} `+msg.lan.already);
					} else {
						if (user.id !== msg.author.id) {
							const member = await msg.guild.members.fetch(user.id);
							if (member) {
								if (+msg.member.roles.highest.rawPosition > +member.roles.highest.rawPosition) {
									if (+msg.member.roles.highest.rawPosition !== +member.roles.highest.rawPosition) {
										if (member.bannable) users.push(user);
										else failed.push(`${arg} `+msg.lan.iCant);
									} else failed.push(`${arg} `+msg.lan.youCant);
								} else failed.push(`${arg} `+msg.lan.youCant);
							} else users.push(user);
						} else failed.push(`${arg} `+msg.lan.selfban);
					}
				} else failed.push(arg);
			}
		}
		let banreason = '';
		if (reason.length == 0) banreason = msg.lan.reason;
		else reason.forEach((word) => {banreason += ` ${word}`;});
		const con = msg.constants.commands.massban;
		const uniqueUsers = users.filter((item, pos ,self) => self.indexOf(item) == pos);
		const uniqueFails = failed.filter((item, pos ,self) => self.indexOf(item) == pos);
		const descS = []; const descF = [];
		if (uniqueUsers.length !== 0) {
			const replyEmbed = new Discord.MessageEmbed()
				.setColor(con.success)
				.setDescription(msg.lan.descS)
				.setAuthor(msg.lan.descSLoading, msg.client.constants.loadingLink, msg.client.constants.standard.invite)
				.setTimestamp();
			const m = await msg.client.ch.reply(msg, replyEmbed);
			uniqueUsers.forEach(async (user) => {
				const ban = await msg.guild.members.ban(user, {
					days: 1,
					reason: msg.client.ch.stp(msg.lan.banReason, {user: msg.author, reason: banreason}),
				}).catch(() => {failed.push(`${user.id} `+msg.lan.ohno);});
				if (ban) {
					descS.push(`<@${user.id}>`);
					if (`${descS}`.length > 2048) replyEmbed.setDescription(msg.client.ch.stp(msg.lan.sBannedUsers, {amount: descS.length}));
					else replyEmbed.setDescription(`\u200b${descS}`);
				}
			});
			const editIntervalS = setInterval(async () => {if (descS.length !== uniqueUsers.length) await m.edit(replyEmbed);}, 5000);
			const intervalS = setInterval(async () => {
				if (descS.length == uniqueUsers.length) {
					if (`${descS}`.length > 2048) replyEmbed.setDescription(msg.client.ch.stp(msg.lan.sBannedUsers, {amount: descS.length}));
					else replyEmbed.setDescription(`\u200b${descS}`);
					replyEmbed.setAuthor(msg.lan.finish, msg.client.constants.tickLink, msg.client.constants.standard.invite);
					clearInterval(intervalS);
					clearInterval(editIntervalS);
					setTimeout(() => {clearInterval(interval);}, 3600000);
					setTimeout(() => {m.edit(replyEmbed);}, 2000); 
				}
			}, 1000);
		}
		if (uniqueFails.length !== 0) {
			const replyEmbed = new Discord.MessageEmbed()
				.setColor(con.fail)
				.setDescription(msg.lan.descF)
				.setAuthor(msg.lan.descFLoading, msg.client.constants.crossLink, msg.client.constants.standard.invite)
				.setTimestamp();
			const m = await msg.client.ch.reply(msg, replyEmbed);
			uniqueFails.forEach(async (fail) => {
				descF.push(`${fail}\n`);
				if (`${descF}`.length > 2048) replyEmbed.setDescription(msg.client.ch.stp(msg.lan.fBannedUsers, {amount: descF.length}));
				else replyEmbed.setDescription(`\u200b${descF}`);
			});
			const editintervalF = setInterval(async () => {if (descF.length !== uniqueFails.length) await m.edit(replyEmbed);}, 5000);
			const intervalF = setInterval(async () => {
				if (descF.length == uniqueFails.length) {
					if (`${descF}`.length > 2048) {
						replyEmbed.setDescription(msg.client.ch.stp(msg.lan.fBannedUsers, {amount: descF.length}));
					} else {
						replyEmbed.setDescription(`\u200b${descF}`);
					}
					replyEmbed.setAuthor(msg.lan.failed, msg.client.constants.crossLink, msg.client.constants.standard.invite);
					clearInterval(intervalF);
					setTimeout(() => {clearInterval(interval);}, 3600000);
					clearInterval(editintervalF);
					setTimeout(() => {m.edit(replyEmbed);}, 2000); 
				}
			}, 1000);
		}
		const interval = setInterval(async () => {
			if (uniqueUsers.length == descS.length && uniqueFails.length == descF.length) { 
				const logembed = new Discord.MessageEmbed()
					.setAuthor(msg.client.ch.stp(msg.lan.log.author, {user: msg.author, amount: uniqueUsers.length}))
					.setDescription(msg.client.ch.stp(msg.lan.log.desc, {amount: uniqueUsers.length}))
					.setField(msg.language.reason, msg.client.ch.makeCodeBlock(banreason))
					.setColor(con.log.color)
					.setTimestamp();
				const res = await msg.client.ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [msg.guild.id]);
				if (res && res.rowCount > 0) {
					const path = await msg.client.ch.txtFileWriter(uniqueUsers);
					const logchannel = msg.client.channels.cache.get(res.rows[0].logchannel);
					if (logchannel && uniqueUsers.length !== 0) {
						if (path) {
							msg.client.ch.send(logchannel, {
								embed: logembed,
								files: [{
									attachment: path,
								}]
							});
						} else msg.client.ch.send(logchannel, {embed: logembed});
					}
				}
				clearInterval(interval);
			}
		}, 1000);
	}
};