const Discord = require('discord.js');
//const { statcord } = require('../../../BaseClient/Statcord');
const auth = require('../../../BaseClient/auth.json');
const cooldowns = new Discord.Collection();

module.exports = {
	async prefix(msg) {
		const Constants = msg.client.constants;
		const ch = msg.client.ch;
		let prefix;
		let prefixStandard = Constants.standard.prefix;
		let prefixCustom;
		if (msg.channel.type !== 'DM' && msg.guild) {
			const res = await ch.query('SELECT * FROM guildsettings WHERE guildid = $1;', [msg.guild.id]);
			if (res && res.rowCount > 0) prefixCustom = res.rows[0].prefix;
		}
		if (msg.content.toLowerCase().startsWith(prefixStandard)) prefix = prefixStandard;
		else if (msg.content.toLowerCase().startsWith(prefixCustom)) prefix = prefixCustom;
		else return;
		if (!prefix) return;
		msg.language = await msg.client.ch.languageSelector(msg.guild);
		const args = msg.content.slice(prefix.length).split(/ +/);
		const commandName = args.shift().toLowerCase();
		let command = msg.client.commands.get(commandName) || msg.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
		if (!command) return;
		if (command.takesFirstArg && !args[0]) {
			msg.triedCMD = command;
			command = msg.client.commands.get('cmdhelp');
		}
		msg.lan = msg.language.commands[`${command.name}`];
		msg.args = args;
		msg.command = command;
		return msg;
	},
	async execute(rawmsg) {
		const msg = await this.prefix(rawmsg);
		if (!msg) return; 
		if (msg.channel.type == 'DM') this.DMcommand(msg);
		if (msg.author.id == auth.ownerID) {
			if (msg.command.name == 'eval') return msg.command.exe(msg);
			cooldowns.set(msg.command.name, new Discord.Collection());
		} else {
			if (!cooldowns.has(msg.command.name)) cooldowns.set(msg.command.name, new Discord.Collection());
			const now = Date.now();
			let timestamps = cooldowns.get(msg.command.name);
			//let cooldownAmount = (msg.command.cooldown || 0);
			//const res = await msg.client.ch.query('SELECT * FROM cooldowns WHERE activechannelid = $1 AND command = $2;', [msg.channel.id, msg.command.name]);
			//if (res && res.rowCount > 0) cooldownAmount = res.rows[0].cooldown;
			//if (timestamps.has(msg.channel.id)) {
			//	const expirationTime = +timestamps.get(msg.channel.id) + +cooldownAmount;
			//	if (now < expirationTime) {
			//		const timeLeft = (expirationTime - now) / 1000;
			//		const m = await msg.client.ch.reply(msg, msg.client.ch.stp(msg.language.commands.commandHandler.PleaseWait, {time: timeLeft.toFixed(1)}), {allowedMentions: {repliedUser: true}});
			//		setTimeout(() => {
			//			m.delete().catch(() => {});
			//			msg.delete().catch(() => {});
			//		}, 5000);
			//	}
			//}
			timestamps.set(msg.channel.id, now);
		}
		this.thisGuildOnly(msg);
	},
	async thisGuildOnly(msg) {
		if (msg.command.thisGuildOnly && !msg.command.thisGuildOnly.includes(msg.guild.id)) return;
		this.commandCheck(msg);
	},
	async commandCheck(msg) {
		//const res = await msg.client.ch.query('SELECT * FROM disabledcommands WHERE guildid = $1;', [msg.guild.id]);
		//if (res && res.rowCount > 0 && res.rows[0].disabled.includes(msg.command.name.toLowerCase())) return msg.client.ch.reply(msg, msg.client.ch.stp(msg.language.commands.commandHandler.CommandDisabled, {name: msg.command.name}));
		this.permissionCheck(msg);
	},
	async permissionCheck(msg) {
		const perms = typeof msg.command.perm == 'bigint' ? new Discord.Permissions(msg.command.perm) : undefined;
		if (perms && !msg.guild.me.permissions.has(perms)) {
			const [neededPerms1, ] = msg.client.ch.bitUniques(perms, msg.guild.me.permissions);
			const embed = new Discord.MessageEmbed()
				.setAuthor(msg.language.error, msg.client.constants.standard.errorImage, msg.client.constants.standard.invite)
				.setColor(msg.client.constants.error)
				.setDescription(msg.client.ch.makeUnderlined(msg.language.permissions.error.msg))
				.addField(msg.client.ch.makeBold(msg.language.permissions.error.needed), `${neededPerms1.has(8n) ? `${msg.client.ch.makeInlineCode(msg.language.permissions.ADMINISTRATOR)}` : neededPerms1.toArray().map(p => `${msg.client.ch.makeInlineCode(msg.language.permissions[p])}`)}`);
			return msg.client.ch.reply(msg, embed);
		}
		if (msg.command.perm == 0) {
			if (msg.author.id !== auth.ownerID) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.creatorOnly);
			else return this.editCheck(msg);
		} else if (msg.command.perm == 1) {
			if (msg.guild.ownerID !== msg.author.id) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.ownerOnly);
			else return this.editCheck(msg);
		} else if (typeof msg.command.perm == 'bigint') {
			const names = ['ban', 'unban', 'mute', 'unmute', 'tempmute', 'kick', 'clear', 'announce', 'pardon', 'warn', 'edit', 'takerole', 'giverole'];
			if (names.includes(msg.command.name)) {
				const res = await msg.client.ch.query('SELECT * FROM modrolesnew WHERE guildid = $1;', [msg.guild.id]);
				if (res && res.rowCount > 0) {
					for (const r of res.rows) {
						const role = msg.guild.roles.cache.get(r.roleid);
						if (role && msg.member.roles.cache.has(role.id)) return this.editCheck(msg);
						else return this.editCheck(msg);
					}
				} else if (!msg.member.permissions.has(msg.command.perm)) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
			} else if (!msg.member.permissions.has(msg.command.perm)) return msg.client.ch.reply(msg, msg.language.commands.commandHandler.missingPermissions);
		}
		this.editCheck(msg);
	},
	async editCheck(msg) {
		if (msg.editedTimestamp) {
			if (msg.command.category == 'Moderation') this.editVerifier(msg);
			else this.commandExe(msg);
		} else this.commandExe(msg);
	},
	async editVerifier(msg) {
		const m = await msg.client.ch.reply(msg, msg.client.language.commands.commandHandler.verifyMessgae);
		m.react(msg.constants.emotes.tickID).catch(() => {});
		m.react(msg.constants.emotes.crossID).catch(() => {});
		msg.channel.awaitMessages(m => m.author.id == msg.author.id,
			{max: 1, time: 30000}).then(rawcollected => {
			if (!rawcollected.first()) return;
			if (rawcollected.first().content.toLowerCase() == 'y' || rawcollected.first().content.toLowerCase() == 'yes' || rawcollected.first().content.toLowerCase() == 'proceed' || rawcollected.first().content.toLowerCase() == 'continue' || rawcollected.first().content.toLowerCase() == 'go') {
				if (m.deleted == false) {
					rawcollected.first().delete().catch(() => {});
					m.delete().catch(() => {});
					this.commandExe(msg);
				}
			} else return m.delete().catch(() => {});
		}).catch(() => {m.delete().catch(() => {});});
		m.awaitReactions((reaction, user) => (reaction.emoji.id === msg.constants.emotes.tickID || reaction.emoji.id === msg.constants.emotes.crossID) && user.id === msg.author.id,
			{max: 1, time: 60000}).then(rawcollected => {
			if (!rawcollected.first()) return;
			if (rawcollected.first()._emoji.id == msg.constants.emotes.tickID) {
				m.delete().catch(() => {});
				this.commandExe(msg);
			} else return m.delete().catch(() => {});
		}).catch(() => {m.delete().catch(() => {});});
	},
	async DMcommand(msg) {
		if (msg.command.dm) {
			if (msg.command.takesFirstArg && !msg.args[0]) {
				msg.triedCMD = msg.command;
				msg.command = msg.client.commands.get('cmdhelp');
				this.thisGuildOnly(msg);
			}
		} else return msg.client.ch.reply(msg, msg.language.commands.commandHandler.GuildOnly);
	},
	async commandExe(msg) {
		if (msg.channel.type !== 'DM') {
			const res = await msg.client.ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [msg.guild.id]);
			if (res && res.rowCount > 0) msg.logchannel = msg.client.channels.cache.get(res.rows[0].modlogs);
		}
		if (msg.author.id == msg.client.user.id) msg.delete();
		try {
			//statcord.postCommand(msg.command.name, msg.author.id).catch(() => {});
			console.log(msg.command.name);
			msg.command.exe(msg);
		} catch(e)  {
			const channel = msg.client.channels.cache.get(msg.client.constants.errorchannel);
			const embed = new Discord.MessageEmbed()
				.setAuthor('Command Error', msg.client.constants.emotes.crossLink, msg.url)
				.setTimestamp()
				.setDescription(`\`\`\`${e.stack}\`\`\``)
				.addField('Message', `\`\`\`${msg}\`\`\``)
				.addField('Guild', `${msg.guild?.name} | ${msg.guild?.id}`)
				.addField('Channel', `${msg.channel?.name} | ${msg.channel?.id}`)
				.addField('Message Link', msg.url)
				.setColor('ff0000');
			if (channel) msg.client.ch.send(msg.channel, embed);
		}
	}
};        