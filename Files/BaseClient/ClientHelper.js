const { client } = require('./DiscordClient.js');
const { pool } = require('./DataBase.js');
const Discord = require('discord.js');
const fs = require('fs');
const http = require('http');
const https = require('https');
const DiscordEpoch = 1420070400000;
const ms = require('ms');
const Constants = require('../Constants.json');
const { imgur } = require('./ImgurClient');
const regexes = {
	templateMatcher: /{{\s?([^{}\s]*)\s?}}/g,
	strReplacer1: /_/g,
	strReplacer2: /\w\S*/g,
	auditLogTransform: /~/g,
	// eslint-disable-next-line no-control-regex
	tester: /[^\u0000-\u00ff]/
};

module.exports = { 
	pathCheck() {
		if (!fs.existsSync('.\\Files\\Downloads')) fs.mkdirSync('.\\Files\\Downloads');
		if (!fs.existsSync('.\\Files\\Downloads\\Messages')) fs.mkdirSync('.\\Files\\Downloads\\Messages');
		if (!fs.existsSync('.\\Files\\Downloads\\Messages\\Bulk Deletes')) fs.mkdirSync('.\\Files\\Downloads\\Messages\\Bulk Deletes');
		if (!fs.existsSync('.\\Files\\Downloads\\Guilds')) fs.mkdirSync('.\\Files\\Downloads\\Guilds');
		if (!fs.existsSync('.\\Files\\Downloads\\Users')) fs.mkdirSync('.\\Files\\Downloads\\Users');
	},
	async send(channel, content, options) {
		let webhook;
		if (client.channelWebhooks.get(channel.id)) webhook = client.channelWebhooks.get(channel.id);
		let m;
		if (webhook && !channel.force) {
			if (typeof(content) == 'string') {
				if (options) m = await webhook.send(content, options).catch(() => {channel.force = true; this.send(channel, content, options);});
				else m = await webhook.send(content).catch(() => {channel.force = true; this.send(channel, content);});
			} else m = await webhook.send(content).catch(() => {channel.force = true; this.send(channel, content);});
			if (m) m.sentAs = webhook;
		} else {
			if (typeof(content) == 'string') {
				if (options) m = await channel.send(content, options).catch((e) => {this.logger('Send Error', e);});
				else m = await channel.send(content).catch((e) => {this.logger('Send Error', e);});
			} else m = await channel.send(content).catch((e) => {this.logger('Send Error', e);});
			if (m) m.sentAs = client.user;
		}
		return m;
	},
	async reply(msg, content, options) {
		let m;
		if (typeof(content) == 'string') {
			if (options) m = await msg.reply(content, {options}).catch((e) => {this.logger('Reply Error', e);});
			else m = await msg.reply(content).catch((e) => {this.logger('Reply Error', e);});
		} else m = await msg.reply(content).catch((e) => {this.logger('Reply Error', e);});
		return m;
	},
	stp(expression, Object) {
		let text = expression.replace(regexes.templateMatcher, (substring, value) => {
			const newValue = value.split('.');
			let decided;
			const Result = Object[newValue[0]];
			if (Result) {
				if (newValue.length > 1) {
					for (let i = 1; i < newValue.length; i++) {
						if (i == 1) decided = Result[newValue[i]];
						if (i > 1) decided = decided[newValue[i]];
					}
					return decided;
				} else return Result;
			}
		});
		return text;
	},
	async query(query, willOccure) {
		let res;
		if (willOccure) {
			res = await pool.query(query).catch(() => {});
		} else {
			res = await pool.query(query).catch((err) =>{
				this.logger('Pool Query Error', err);
			});
		}
		if (res) return res;
		return null;
	},
	async logger(type, log) {
		if (client && client.user) {
			const channel = await client.channels.fetch(Constants.standard.errorLogChannel).catch(() => {});
			if (channel && channel.id) {
				if (log) {
					if (log.stack) channel.send(`${type}\`\`\`${log.stack}\`\`\``).catch(() => {});
					else channel.send(`${type}\`\`\`${log}\`\`\``).catch(() => {});
					console.error(type, log);
				}
				else {
					channel.send(`${type}`).catch(() => {}); 
					console.error(type);
				}
			}
			
		}
	},
	async downloader(msg, url) {
		let path;
		let pathend;
		if (msg.channel) {
			path = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.guild.id}\\Channel - ${msg.channel.id}\\${msg.id}`;
			let guilddir = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.guild.id}`;
			if (!fs.existsSync(guilddir)) {
				guilddir = fs.mkdirSync(guilddir);
			}
			let channeldir = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.guild.id}\\Channel - ${msg.channel.id}`;
			if (!fs.existsSync(channeldir)) {
				channeldir = fs.mkdirSync(channeldir);
			}
		} else if (msg.animated) {
			path = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.guild.id}\\Deleted Emotes\\${msg.id}`;
			let guilddir = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.guild.id}`;
			if (!fs.existsSync(guilddir)) {
				guilddir = fs.mkdirSync(guilddir);
			}
			let channeldir = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.guild.id}\\Deleted Emotes`;
			if (!fs.existsSync(channeldir)) {
				channeldir = fs.mkdirSync(channeldir);
			}
		} else if (msg.ownerID) {
			const now = Date.now();
			if (msg.wanted) {
				path = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.id}\\${msg.wanted}\\${now}`;
				let guilddir = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.id}`;
				if (!fs.existsSync(guilddir)) {
					guilddir = fs.mkdirSync(guilddir);
				}
				let channeldir = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.id}\\${msg.wanted}`;
				if (!fs.existsSync(channeldir)) {
					channeldir = fs.mkdirSync(channeldir);
				}
			}
		} else if (msg.avatar) {
			const now = Date.now();
			if (msg.wanted) {
				path = `.\\Files\\Downloads\\Users\\User - ${msg.id}\\${now}`;
				let userdir = `.\\Files\\Downloads\\Users\\User - ${msg.id}`;
				if (!fs.existsSync(userdir)) {
					fs.mkdirSync(userdir);
				}
			}
		}
		if (!url) {
			url = [];
			msg.attachments = msg.attachments.map(o => o);
			for (let i = 0; i < msg.attachments.length; i++) {
				path = `${path}-${i}`;
				let patharr = msg.attachments[i].name.split('.');
				pathend = patharr[patharr.length-1];
				const urlArray = {
					url: msg.attachments[i].url,
					path: `${path}.${pathend}`
				};
				url[i] = urlArray;
			}
		} else {
			pathend = msg.animated ? 'gif' : 'png';
		}
		if (Array.isArray(url)) {
			for (let i = 0; i < url.length; i++) {
				await this.download(url[i].url, url[i].path);
			}
		} else {
			await this.download(url, `${path}.${pathend}`);
		}
		return `${path}.${pathend}`;
	},
	async makeFile(path) {
		this.logger('Make File used on ', path);
		const file = fs.readFileSync(path);
		return file;
	},
	async getName(path) {
		let name = path.split('\\');
		name = name[name.length-1];
		return name;
	},
	async download(url, filePath) {
		const proto = !url.charAt(4).localeCompare('s') ? https : http;
		return new Promise((resolve, reject) => {
			const file = fs.createWriteStream(filePath);
			let fileInfo = null;
			const request = proto.get(url, response => {
				if (response.statusCode !== 200) {
					reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
					return;
				}
				fileInfo = {
					mime: response.headers['content-type'],
					size: parseInt(response.headers['content-length'], 10),
				};
				response.pipe(file);
			});
			file.on('finish', () => resolve(fileInfo));
			request.on('error', err => {
				fs.unlink(filePath, () => reject(err));
			});
			file.on('error', err => {
				fs.unlink(filePath, () => reject(err));
			});
			request.end();
		});
	},
	permCalc(bits, lan) {
		const BitField = new Discord.Permissions(BigInt(bits));
		const Perms = [];
		if (BitField.has(1)) Perms.push(lan.permissions.CREATE_INSTANT_INVITE);
		if (BitField.has(2)) Perms.push(lan.permissions.KICK_MEMBERS);
		if (BitField.has(4)) Perms.push(lan.permissions.BAN_MEMBERS);
		if (BitField.has(8)) Perms.push(lan.permissions.ADMINISTRATOR);
		if (BitField.has(16)) Perms.push(lan.permissions.MANAGE_CHANNELS);
		if (BitField.has(32)) Perms.push(lan.permissions.MANAGE_GUILD);
		if (BitField.has(64)) Perms.push(lan.permissions.ADD_REACTIONS);
		if (BitField.has(128)) Perms.push(lan.permissions.VIEW_AUDIT_LOG);
		if (BitField.has(256)) Perms.push(lan.permissions.PRIORITY_SPEAKER);
		if (BitField.has(1024)) Perms.push(lan.permissions.VIEW_CHANNEL);
		if (BitField.has(1024)) Perms.push(lan.permissions.READ_MESSAGES);
		if (BitField.has(2048)) Perms.push(lan.permissions.SEND_MESSAGES);
		if (BitField.has(4096)) Perms.push(lan.permissions.SEND_TTS_MESSAGES);
		if (BitField.has(8192)) Perms.push(lan.permissions.MANAGE_MESSAGES);
		if (BitField.has(16384)) Perms.push(lan.permissions.EMBED_LINKS);
		if (BitField.has(32768)) Perms.push(lan.permissions.ATTACH_FILES);
		if (BitField.has(65536)) Perms.push(lan.permissions.READ_MESSAGE_HISTORY);
		if (BitField.has(131072)) Perms.push(lan.permissions.MENTION_EVERYONE);
		if (BitField.has(262144)) Perms.push(lan.permissions.EXTERNAL_EMOJIS);
		if (BitField.has(262144)) Perms.push(lan.permissions.USE_EXTERNAL_EMOJIS);
		if (BitField.has(1048576)) Perms.push(lan.permissions.CONNECT);
		if (BitField.has(2097152)) Perms.push(lan.permissions.SPEAK);
		if (BitField.has(4194304)) Perms.push(lan.permissions.MUTE_MEMBERS);
		if (BitField.has(8388608)) Perms.push(lan.permissions.DEAFEN_MEMBERS);
		if (BitField.has(16777216)) Perms.push(lan.permissions.MOVE_MEMBERS);
		if (BitField.has(33554432)) Perms.push(lan.permissions.USE_VAD);
		if (BitField.has(67108864)) Perms.push(lan.permissions.CHANGE_NICKNAME);
		if (BitField.has(134217728)) Perms.push(lan.permissions.MANAGE_NICKNAMES);
		if (BitField.has(268435456)) Perms.push(lan.permissions.MANAGE_ROLES);
		if (BitField.has(268435456)) Perms.push(lan.permissions.MANAGE_ROLES_OR_PERMISSIONS);
		if (BitField.has(536870912)) Perms.push(lan.permissions.MANAGE_WEBHOOKS);
		if (BitField.has(1073741824)) Perms.push(lan.permissions.MANAGE_EMOJIS);
		if (BitField.has(2147483648)) Perms.push(lan.permissions.USE_SLASH_COMMANDS);
		if (BitField.has(4294967296)) Perms.push(lan.permissions.REQUEST_TO_SPEAK);
		return (Perms);
	},
	getUnix(ID) {
		const variable = BigInt(ID);
		const id = BigInt.asUintN(64, variable);
		const dateBits = Number(id >> 22n);
		const unix = (dateBits + DiscordEpoch);
		return unix;
	},
	ms(input) {return ms(input);},
	eris2Lan(perm, language) {
		let res;
		if (perm == 'createInstantInvite') res = language.permissions.CREATE_INSTANT_INVITE;
		else if (perm == 'kickMembers') res = language.permissions.KICK_MEMBERS;
		else if (perm == 'banMembers') res = language.permissions.BAN_MEMBERS;
		else if (perm == 'administrator') res = language.permissions.ADMINISTRATOR;
		else if (perm == 'manageChannels') res = language.permissions.MANAGE_CHANNELS;
		else if (perm == 'manageGuild') res = language.permissions.MANAGE_GUILD;
		else if (perm == 'addReactions') res = language.permissions.ADD_REACTIONS;
		else if (perm == 'viewAuditLog') res = language.permissions.VIEW_AUDIT_LOG;
		else if (perm == 'viewAuditLogs') res = language.permissions.VIEW_AUDIT_LOG;
		else if (perm == 'voicePrioritySpeaker') res = language.permissions.PRIORITY_SPEAKER;
		else if (perm == 'voiceStream') res = language.permissions.STREAM;
		else if (perm == 'stream') res = language.permissions.STREAM;
		else if (perm == 'viewChannel') res = language.permissions.VIEW_CHANNEL;
		else if (perm == 'readMessages') res = language.permissions.READ_MESSAGES;
		else if (perm == 'sendMessages') res = language.permissions.SEND_MESSAGES;
		else if (perm == 'sendTTSMessages') res = language.permissions.SEND_TTS_MESSAGES;
		else if (perm == 'manageMessages') res = language.permissions.MANAGE_MESSAGES;
		else if (perm == 'embedLinks') res = language.permissions.EMBED_LINKS;
		else if (perm == 'attachFiles') res = language.permissions.ATTACH_FILES;
		else if (perm == 'readMessageHistory') res = language.permissions.READ_MESSAGE_HISTORY;
		else if (perm == 'mentionEveryone') res = language.permissions.MENTION_EVERYONE;
		else if (perm == 'useExternalEmojis') res = language.permissions.USE_EXTERNAL_EMOJIS;
		else if (perm == 'externalEmojis') res = language.permissions.EXTERNAL_EMOJIS;
		else if (perm == 'viewGuildInsights') res = language.permissions.VIEW_GUILD_INSIGHTS;
		else if (perm == 'voiceConnect') res = language.permissions.CONNECT;
		else if (perm == 'voiceSpeak') res = language.permissions.SPEAK;
		else if (perm == 'voiceMuteMembers') res = language.permissions.MUTE_MEMBERS;
		else if (perm == 'voiceDeafenMembers') res = language.permissions.DEAFEN_MEMBERS;
		else if (perm == 'voiceMoveMembers') res = language.permissions.MOVE_MEMBERS;
		else if (perm == 'voiceUseVAD') res = language.permissions.USE_VAD;
		else if (perm == 'changeNickname') res = language.permissions.CHANGE_NICKNAME;
		else if (perm == 'manageNicknames') res = language.permissions.MANAGE_NICKNAMES;
		else if (perm == 'manageRoles') res = language.permissions.MANAGE_ROLES;
		else if (perm == 'manageWebhooks') res = language.permissions.MANAGE_WEBHOOKS;
		else if (perm == 'manageEmojis') res = language.permissions.MANAGE_EMOJIS;
		else if (perm == 'useSlashCommands') res = language.permissions.USE_SLASH_COMMANDS;
		else if (perm == 'voiceRequestToSpeak') res = language.permissions.REQUEST_SPEAK;
		else if (perm == 'allGuild') res = language.permissions.ALL_GUILD;
		else if (perm == 'allText') res = language.permissions.ALL_TEXT;
		else if (perm == 'allVoice') res = language.permissions.ALL_VOICE;
		else if (perm == 'all') res = language.permissions.ALL;
		return res;
	},
	getDifference (array1, array2) {
		return array1.filter(i => {
			return array2.indexOf(i) < 0;
		});
	},
	toTitleCase (str) {
		return str.replace(regexes.strReplacer1, ' ').replace(regexes.strReplacer2, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
	},
	transformAuditLogEntry (nameOfKey, before, after, language) {
		nameOfKey = nameOfKey.toLowerCase();
		if (nameOfKey == 'nsfw') return { name: language[nameOfKey], before: before ? language.enabled : language.disabled, after: after ? language.enabled : language.disabled };
		else if (nameOfKey == 'topic') return { name: language[nameOfKey], before: before ? escape(before.replace(regexes.auditLogTransform, '\\~'), ['angle brackets']) : language.none, after: after ? escape(after.replace(regexes.auditLogTransform, '\\~'), ['angle brackets']) : language.none };
		else if (nameOfKey == 'rate_limit_per_user') return { name: language[nameOfKey], before: `${before} `+language.time.seconds, after: `${after} `+language.time.seconds };
		else if (nameOfKey == 'name') return { name: language[nameOfKey], before, after };
		else if (nameOfKey == 'type') return { name: language[nameOfKey], before: language.channelsNrSorted[before], after: language.channelsNrSorted[after] };
		else if (nameOfKey == 'bitrate') return { name: language[nameOfKey], before: `${parseInt(before) / 1000}kbps`, after: `${parseInt(after) / 1000}kbps` };
		else if (nameOfKey == 'rtc_region') return { name: language[nameOfKey], before: before || language.automatic, after: after || language.automatic };
		else if (nameOfKey == 'video_quality_mode') return { name: language[nameOfKey], before: before === 1 ? language.automatic : '720p', after: after === 1 ? language.automatic : '720p' };
		else if (nameOfKey == 'user_limit') return { name: language[nameOfKey], before: before !== 0 ? before : language.unrestricted, after: after !== 0 ? after : language.unrestricted };
		else return { before: language.unknown, after: language.unknown };
	},
	displayAvatarURL(user) {
		return user.displayAvatarURL({
			dynamic: true,
			size: 2048,
			format: 'png'
		});
	},
	iconURL(guild) {
		return guild.iconURL({
			dynamic: true,
			size: 2048,
			format: 'png'
		});
	},
	bannerURL(guild) {
		return guild.bannerURL({
			dynamic: true,
			size: 2048,
			format: 'png'
		});
	},
	splashURL(guild) {
		return guild.splashURL({
			dynamic: true,
			size: 2048,
			format: 'png'
		});
	}, 
	discoverySplashURL(guild) {
		return guild.discoverySplashURL({
			dynamic: true,
			size: 2048,
			format: 'png'
		});
	},
	avatarURL(webhook) {
		return webhook.avatarURL({
			dynamic: true,
			size: 2048,
			format: 'png'
		});
	},
	async languageSelector(guild) {
		if (guild.id) {
			const resLan = await this.query(`SELECT * FROM language WHERE guildid = '${guild.id}';`);
			let lang = 'en';
			if (resLan && resLan.rowCount > 0) {
				lang = resLan.rows[0].language;
			}
			const language = require(`../Languages/lan-${lang}.json`);
			return language;
		} else {
			const language = require('../Languages/lan-en.json');
			return language;
		}
	},
	async txtFileWriter(object) {
		object = object.map(o => o);
		let content = '';
		for (let i = 0; i < object.length; i++) {
			let urls = '';
			const msg = []; const o = object[i];
			msg.author = o.author;
			msg.timestamp = this.getUnix(o.id);
			msg.content = o.content;
			if (o.attachments) {
				o.attachments = o.attachments.map(o => o);
				for (let j = 0; j < o.attachments.length; j++) {
					const json = await imgur.uploadUrl(o.attachments[j].url).catch(() => {});
					if (json) {
						urls += ` ${json.link} `;
					}
				}
			}
			content += `\n${msg.author && msg.author.tag ? msg.author.tag : 'Unknown Author'} (${msg.author && msg.author.id ? msg.author.id : 'Unknown Author'}) at ${new Date(msg.timestamp).toUTCString()}\n${urls !== '' ? `Attachments: ${urls}\n` : ''}${msg.content ? msg.content : 'Unknown Content'}\n`;
		}
		const now = Date.now();
		const path = `.\\Files\\Downloads\\Messages\\Bulk Deletes\\Guild - ${object[0].guild.id}\\Channel - ${object[0].channel.id}\\${now}.txt`;
		let guilddir = `.\\Files\\Downloads\\Messages\\Bulk Deletes\\Guild - ${object[0].guild.id}`;
		if (!fs.existsSync(guilddir)) {
			guilddir = fs.mkdirSync(guilddir);
		}
		let channeldir = `.\\Files\\Downloads\\Messages\\Bulk Deletes\\Guild - ${object[0].guild.id}\\Channel - ${object[0].channel.id}`;
		if (!fs.existsSync(channeldir)) {
			channeldir = fs.mkdirSync(channeldir);
		}
		await fs.writeFile(path, content, (err) => {
			if (err) throw err;
		});
		return path;
	},
	containsNonLatinCodepoints(text) {
		return regexes.tester.test(text);
	},
	async member(guild, user) {
		let id;
		if (user.id) id = user.id;
		else id = user;
		await guild.members.fetch();
		if (guild.members.cache.get(id)) return await guild.members.cache.get(id).fetch();
		else return null;
	},
	bitDuplicates(bit1, bit2){return new Discord.Permissions(bit1.bitfield & bit2.bitfield);},
	bitUniques(bit1, bit2){
		const bit = new Discord.Permissions(bit1.bitfield & bit2.bitfield);
		bit1 = bit1.remove([...bit]);
		bit2 = bit2.remove([...bit]);
		return [bit1, bit2];
	}
};