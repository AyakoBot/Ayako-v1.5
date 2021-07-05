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
const URL = require('url');
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
		if (!fs.existsSync('.\\Files\\Downloads\\Massbans')) fs.mkdirSync('.\\Files\\Downloads\\Massbans');
	},
	async send(channel, content, options) {
		let webhook;
		if (client.channelWebhooks.get(channel.id)) webhook = client.channelWebhooks.get(channel.id);
		let m;
		if (options && options.type == 'rich') {
			const oldOptions = options;
			options = {}; 
			options.embeds = [oldOptions];
		} else options = {};
		options.failIfNotExists = false;
		if (content && content.type == 'rich') options.embeds ? options.embeds.push(content) : options.embeds = [content];
		else if (typeof(content) !== 'string') options = content;
		else options.content = content;
		if (webhook && !channel.force) {
			m = await webhook.send(options).catch(() => {channel.force = true; this.send(channel, options);});
			if (m) m.sentAs = webhook;
		} else {
			m = await channel.send(options).catch((e) => {this.logger('Send Error', e);});
			if (m) m.sentAs = client.user;
		}
		return m;
	},
	async reply(msg, content, options) {
		if (options && options.type == 'rich') {
			const oldOptions = options;
			options = {}; 
			options.embeds = [oldOptions];
		} else options = {};
		options.failIfNotExists = false;
		if (content && content.type == 'rich') options.embeds ? options.embeds.push(content) : options.embeds = [content];
		else if (typeof(content) !== 'string') options = content;
		else options.content = content;
		return await msg.reply(options).catch((e) => {this.logger('Reply Error', e);});
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
	async query(query) {
		const res = await pool.query(query).catch((err) =>{
			console.log(query);
			this.logger('Pool Query Error', err);
		});
		if (res) return res;
		else return null;
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
		const pathers = url ? url.split('.') : null;
		let pathend;
		if (pathers) pathend = `${pathers[pathers.length-1]}`.replace(URL.parse(url).search, '');
		if (msg.channel) {
			path = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.guild.id}\\Channel - ${msg.channel.id}\\${msg.id}`;
			const guilddir = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.guild.id}`;
			if (!fs.existsSync(guilddir)) fs.mkdirSync(guilddir);
			const channeldir = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.guild.id}\\Channel - ${msg.channel.id}`;
			if (!fs.existsSync(channeldir)) fs.mkdirSync(channeldir);
		} else if (msg.animated !== undefined && msg.animated !== null) {
			path = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.guild.id}\\Deleted Emotes\\${msg.id}`;
			const lastdir = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.guild.id}`;
			if (!fs.existsSync(lastdir)) fs.mkdirSync(lastdir);
			const emotedir = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.guild.id}\\Deleted Emotes`;
			if (!fs.existsSync(emotedir)) fs.mkdirSync(emotedir);
			const guilddir = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.guild.id}`;
			if (!fs.existsSync(guilddir)) fs.mkdirSync(guilddir);
		} else if (msg.ownerID) {
			const now = Date.now();
			if (msg.wanted) {
				path = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.id}\\${msg.wanted}\\${now}`;
				const guilddir = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.id}`;
				if (!fs.existsSync(guilddir)) fs.mkdirSync(guilddir);
				const channeldir = `.\\Files\\Downloads\\Guilds\\Guild - ${msg.id}\\${msg.wanted}`;
				if (!fs.existsSync(channeldir)) fs.mkdirSync(channeldir);
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
				let pather = msg.attachments[i].url.split('.');
				pathend = `${pather[pather.length-1]}`;
				const urlArray = {
					url: msg.attachments[i].url,
					path: `${path}.${pathend}`
				};
				url[i] = urlArray;
			}
		} else (msg.animated !== undefined && msg.animated !== null) ? pathend = msg.animated ? 'gif' : 'png' : '';
		if (Array.isArray(url)) {
			for (let i = 0; i < url.length; i++) {await this.download(url[i].url, url[i].path);}
		} else await this.download(url, `${path}.${pathend}`);
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
	getDifference (array1, array2) {
		return array1.filter(i => {return array2.indexOf(i) < 0;});
	},
	toTitleCase (str) {
		return str.replace(regexes.strReplacer1, ' ').replace(regexes.strReplacer2, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
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
			if (resLan && resLan.rowCount > 0) lang = resLan.rows[0].language;
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
		if (object[0].source == 'massban') {
			for (let i = 0; i < object.length; i++) {
				content += `${object[i].tag} / ${object[i].id}\n`;
			}
			const now = Date.now();
			const path = `.\\Files\\Downloads\\Massbans\\Guild - ${object[0].guild.id}\\${now}.txt`;
			const guilddir = `.\\Files\\Downloads\\Massbans\\Guild - ${object[0].guild.id}`;
			if (!fs.existsSync(guilddir)) fs.mkdirSync(guilddir);
			fs.writeFile(path, content, (err) => {if (err) throw err;});
			return path;
		} else if (!object[0].source) {
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
			const guilddir = `.\\Files\\Downloads\\Messages\\Bulk Deletes\\Guild - ${object[0].guild.id}`;
			if (!fs.existsSync(guilddir)) fs.mkdirSync(guilddir);
			const channeldir = `.\\Files\\Downloads\\Messages\\Bulk Deletes\\Guild - ${object[0].guild.id}\\Channel - ${object[0].channel.id}`;
			if (!fs.existsSync(channeldir)) fs.mkdirSync(channeldir);
			fs.writeFile(path, content, (err) => {if (err) throw err;});
			return path;
		}
	},
	containsNonLatinCodepoints(text) {return regexes.tester.test(text);},
	async member(guild, user) {
		let id;
		if (user.id) id = user.id;
		else id = user;
		await guild.members.fetch();
		if (guild.members.cache.get(id)) return await guild.members.cache.get(id).fetch();
		else return null;
	},
	bitDuplicates(bit1, bit2) {return new Discord.Permissions(bit1.bitfield & bit2.bitfield);},
	bitUniques(bit1, bit2) {
		const bit = new Discord.Permissions(bit1.bitfield & bit2.bitfield);
		bit1 = bit1.remove([...bit]);
		bit2 = bit2.remove([...bit]);
		return [bit1, bit2];
	},
	makeCodeBlock(text) {return '```'+text+'```';},
	makeInlineCode(text) {return '`'+text+'`';},
	makeBold(text) {return '**'+text+'**';},
	makeUnderlined(text) {return '__'+text+'__';},
	async modRoleWaiter(msg) {
		const SUCCESS = new Discord.MessageButton()
			.setCustomID('modProceedAction')
			.setLabel(msg.language.mod.warning.proceed)
			.setStyle('SUCCESS')
			.setEmoji(client.constants.emotes.tickID);
		const DANGER = new Discord.MessageButton()
			.setCustomID('modAbortAction')
			.setLabel(msg.language.mod.warning.abort)
			.setEmoji(client.constants.emotes.crossID)
			.setStyle('DANGER');
		const m = await this.reply(msg, {content: msg.language.mod.warning.text, components: [[SUCCESS],[DANGER]], allowedMentions: {repliedUser: true}});
		msg.channel.awaitMessages({filter: m => m.author.id == msg.author.id, max: 1, time: 30000})
			.then(rawcollected => {
				if (!rawcollected.first()) {
					m.delete().catch(() => {});
					return false;
				}
				const answer = rawcollected.first().content.toLowerCase();
				if (answer == 'y' || answer == msg.language.mod.warning.proceed.toLowerCase()) {
					if (m.deleted == false) {
						rawcollected.first().delete().catch(() => {});
						m.delete().catch(() => {});
						return true;
					}
				} else {
					m.delete().catch(() => {});
					return false;
				}
			}).catch(() => {m.delete().catch(() => {});});
		const collector = new Discord.MessageComponentInteractionCollector(m, {time: 30000});
		collector.on('collect', answer => {
			if (answer.user.id !== msg.author.id) {
				answer.reply({embeds: [new Discord.MessageEmbed().setColor(client.constants.error).setDescription(msg.language.notYourButton).setAuthor(msg.language.error, client.constants.standard.image, client.constants.standard.invite)], ephemeral: true});
			} else {
				if (answer.customID == 'modProceedAction') {
					m.delete().catch(() => {});
					return true;
				} else if (answer.customID == 'modAbortAction') {
					m.delete().catch(() => {});
					return false;
				}
			}
		});
	},
	notYours(interaction, msg) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.language.error, client.constants.standard.image, client.constants.standard.invite)
			.setColor(client.constants.error)
			.setDescription(msg.language.notYours);
		interaction.reply({embeds: [embed], ephemeral: true}).catch(() => {});
	},
	collectorEnd(msg) {
		const embed = new Discord.MessageEmbed()
			.setDescription(msg.language.timeError)
			.setColor(msg.client.constants.error);
		msg.m.edit({embeds: [embed], components: []}).catch(() => {});
	}

};