const client = require('./DiscordClient.js');
const { pool } = require('./DataBase.js');
const Discord = require('discord.js');
const fs = require('fs');
const http = require('http');
const https = require('https');
const DiscordEpoch = 1420070400000;
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
Array.prototype.equals = function(arr2) {
	return (this.length === arr2.length && this.every((value, index) => value === arr2[index]));
};

module.exports = { 
	/**
	 * Checks if needed Paths exist on startup and if not creates them.
	 * @constructor
	 */
	pathCheck() {
		if (!fs.existsSync('.\\Files\\Downloads')) fs.mkdirSync('.\\Files\\Downloads');
		if (!fs.existsSync('.\\Files\\Downloads\\Messages')) fs.mkdirSync('.\\Files\\Downloads\\Messages');
		if (!fs.existsSync('.\\Files\\Downloads\\Messages\\Bulk Deletes')) fs.mkdirSync('.\\Files\\Downloads\\Messages\\Bulk Deletes');
		if (!fs.existsSync('.\\Files\\Downloads\\Guilds')) fs.mkdirSync('.\\Files\\Downloads\\Guilds');
		if (!fs.existsSync('.\\Files\\Downloads\\Users')) fs.mkdirSync('.\\Files\\Downloads\\Users');
		if (!fs.existsSync('.\\Files\\Downloads\\Massbans')) fs.mkdirSync('.\\Files\\Downloads\\Massbans');
		if (!fs.existsSync('.\\Files\\Downloads\\Captchas')) fs.mkdirSync('.\\Files\\Downloads\\Captchas');
	},
	/**
	 * Sends a Message to a channel.
	 * @constructor
	 * @param {object} channel - The Channel the Messages will be sent in.
	 * @param {string} content - The Content of the Message or the Message Options if no content is provided.
	 * @param {object} options - The Options of this Message, if any.
	 */
	async send(channel, content, options) {
		if (typeof channel.send !== 'function') return;
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
			m = await channel.send(options).catch(() => {});
			if (m) m.sentAs = client.user;
		}
		return m;
	},
	/**
	 * Replies to a Message.
	 * @constructor
	 * @param {object} msg - The Message the Reply will be replied to.
	 * @param {string} content - The Content of the Reply or the Reply Options if no content is provided.
	 * @param {object} options - The Options of this Reply, if any.
	 */
	async reply(msg, content, options) {
		if (typeof msg.reply !== 'function') return this.send(msg, content, options);
		if (options && options.type == 'rich') {
			const oldOptions = options;
			options = {}; 
			options.embeds = [oldOptions];
		} else options = {};
		if (content && content.type == 'rich') options.embeds ? options.embeds.push(content) : options.embeds = [content];
		else if (typeof(content) !== 'string') options = content;
		else options.content = content;
		return await msg.reply(options).catch((e) => {this.logger('Reply Error', e);});
	},
	/**
	 * Places Objects or Strings of the Objects Option into the Expressions option, replacing same named variables marked by "{{variable Name}}".
	 * @constructor
	 * @param {string} expression - The String following Strings/Objects will be put into.
	 * @param {object} Object - The Object containing all Strings/Objects that will be put into the expression.
	 */
	stp(expression, Object) {
		if (Array.isArray(expression)) {
			const returned = [];
			expression.forEach(e => {
				e = `${e}`;
				let text = e.replace(regexes.templateMatcher, (substring, value) => {
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
				if (text == 'true') text = true;
				if (text == 'false') text = false;
				if (`${text}`.replace(/\D+/g, '') == text && Number.MAX_SAFE_INTEGER > parseInt(text)) text = Number(text);
				returned.push(text);
			});
			return returned;
		} else {
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
		}
	},
	/**
	 * Sends a query to the DataBase.
	 * @constructor
	 * @param {string} query - The Query that will be sent to the DataBase
	 * @param {array} arr - The Array of Arguments passed to the DataBase for sanitizing, if any.
	 * @param {boolean} debug - Wether the Query should be logged in the Console when arriving here.
	 */
	async query(query, arr, debug) {
		if (debug == true) console.log(query, arr);
		const res = await pool.query(query, arr).catch((err) =>{
			console.log(query, arr);
			this.logger('Pool Query Error', err);
		});
		if (res) return res;
		else return null;
	},
	/**
	 * Logs any incoming Messages to the Console and the Discord Error Channel.
	 * @constructor
	 * @param {string} type - The Type or Origin of this Log
	 * @param {string|object} log - The Log that will be logged to the Console and Error Channel.
	 */
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
	/**
	 * Prepares incoming URLs for Download, giving it its Destination Path.
	 * @constructor
	 * @param {object} ident - The Identifier of this URL
	 * @param {string} url - The URL the file will be downloaded from.
	 */
	async downloader(ident, url) {
		let path;
		const pathers = url ? url.split('.') : null;
		let pathend;
		if (pathers) pathend = `${pathers[pathers.length-1]}`.replace(URL.parse(url).search, '');
		if (ident.channel) {
			path = `.\\Files\\Downloads\\Guilds\\Guild - ${ident.guild.id}\\Channel - ${ident.channel.id}\\${ident.id}`;
			const guilddir = `.\\Files\\Downloads\\Guilds\\Guild - ${ident.guild.id}`;
			if (!fs.existsSync(guilddir)) fs.mkdirSync(guilddir);
			const channeldir = `.\\Files\\Downloads\\Guilds\\Guild - ${ident.guild.id}\\Channel - ${ident.channel.id}`;
			if (!fs.existsSync(channeldir)) fs.mkdirSync(channeldir);
		} else if (ident.animated !== undefined && ident.animated !== null) {
			path = `.\\Files\\Downloads\\Guilds\\Guild - ${ident.guild.id}\\Deleted Emotes\\${ident.id}`;
			const lastdir = `.\\Files\\Downloads\\Guilds\\Guild - ${ident.guild.id}`;
			if (!fs.existsSync(lastdir)) fs.mkdirSync(lastdir);
			const emotedir = `.\\Files\\Downloads\\Guilds\\Guild - ${ident.guild.id}\\Deleted Emotes`;
			if (!fs.existsSync(emotedir)) fs.mkdirSync(emotedir);
			const guilddir = `.\\Files\\Downloads\\Guilds\\Guild - ${ident.guild.id}`;
			if (!fs.existsSync(guilddir)) fs.mkdirSync(guilddir);
		} else if (ident.ownerID) {
			const now = Date.now();
			if (ident.wanted) {
				path = `.\\Files\\Downloads\\Guilds\\Guild - ${ident.id}\\${ident.wanted}\\${now}`;
				const guilddir = `.\\Files\\Downloads\\Guilds\\Guild - ${ident.id}`;
				if (!fs.existsSync(guilddir)) fs.mkdirSync(guilddir);
				const channeldir = `.\\Files\\Downloads\\Guilds\\Guild - ${ident.id}\\${ident.wanted}`;
				if (!fs.existsSync(channeldir)) fs.mkdirSync(channeldir);
			}
		} else if (ident.avatar) {
			const now = Date.now();
			if (ident.wanted) {
				path = `.\\Files\\Downloads\\Users\\User - ${ident.id}\\${now}`;
				let userdir = `.\\Files\\Downloads\\Users\\User - ${ident.id}`;
				if (!fs.existsSync(userdir)) {
					fs.mkdirSync(userdir);
				}
			}
		}
		if (!url) {
			url = [];
			ident.attachments = ident.attachments.map(o => o);
			for (let i = 0; i < ident.attachments.length; i++) {
				path = `${path}-${i}`;
				let pather = ident.attachments[i].url.split('.');
				pathend = `${pather[pather.length-1]}`;
				const urlArray = {
					url: ident.attachments[i].url,
					path: `${path}.${pathend}`
				};
				url[i] = urlArray;
			}
		} else (ident.animated !== undefined && ident.animated !== null) ? pathend = ident.animated ? 'gif' : 'png' : '';
		if (Array.isArray(url)) {
			for (let i = 0; i < url.length; i++) {await this.download(url[i].url, url[i].path);}
		} else await this.download(url, `${path}.${pathend}`);
		return `${path}.${pathend}`;
	},
	/**
	 * Extracts a File Name out of a File Path.
	 * @constructor
	 * @param {string} path - The Path of the File the Name will be extracted from.
	 */
	async getName(path) {
		let name = path.split('\\');
		name = name[name.length-1];
		return name;
	},
	/**
	 * The actual File Downloader.
	 * @constructor
	 * @param {string} url - The URL the File will be downloaded from.
	 * @param {object} filePath - The Path to the previously generated Placeholder File.
	 */
	async download(url, filePath) {
		const proto = !url.charAt(4).localeCompare('s') ? https : http;
		return new Promise((resolve, reject) => {
			const file = fs.createWriteStream(filePath);
			let fileInfo = null;
			const request = proto.get(url, response => {
				if (response.statusCode !== 200) return;
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
	/**
	 * A translator for Discord BitField Permissions into the given Language.
	 * @constructor
	 * @param {number} bits - The Bits the Language will be translated from.
	 * @param {object} lan - The Language File the Bits will be Translated based off of.
	 */
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
		if (BitField.has(512)) Perms.push(lan.permissions.STREAM);
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
	/**
	 * Converts a Discord Snowflake ID into the Unix Timestamp it was created at.
	 * @constructor
	 * @param {number} ID - The Snwoflake ID the Unix Timestamp will be created from.
	 */
	getUnix(ID) {
		const variable = BigInt(ID);
		const id = BigInt.asUintN(64, variable);
		const dateBits = Number(id >> 22n);
		const unix = (dateBits + DiscordEpoch);
		return unix;
	},
	/**
	 * Identifies and returns the Difference of two Arrays.
	 * @constructor
	 * @param {array} array1 - The first Array.
	 * @param {array} array2 - The second Array.
	 */
	getDifference (array1, array2) {
		return array1.filter(i => {return array2.indexOf(i) < 0;});
	},
	/**
	 * Extracts a Dynamic Avatar URL from a Discord User.
	 * @constructor
	 * @param {object} user - The User Object the Avatar URL is extracted from.
	 */
	displayAvatarURL(user) {
		user.user ? user = user.user : user;
		return user.displayAvatarURL({
			dynamic: true,
			size: 2048,
			format: 'png'
		});
	},
	/**
	 * Extracts a Dynamic Icon URL from a Discord Guild.
	 * @constructor
	 * @param {object} guild - The Guild Object the Icon URL is extracted from.
	 */
	iconURL(guild) {
		return guild.iconURL({
			dynamic: true,
			size: 2048,
			format: 'png'
		});
	},
	/**
	 * Extracts a Dynamic Banner URL from a Discord Guild.
	 * @constructor
	 * @param {object} guild - The Guild Object the Banner URL is extracted from.
	 */
	bannerURL(guild) {
		return guild.bannerURL({
			dynamic: true,
			size: 2048,
			format: 'png'
		});
	},
	/**
	 * Extracts a Dynamic Splash URL from a Discord Guild.
	 * @constructor
	 * @param {object} guild - The Guild Object the Splash URL is extracted from.
	 */
	splashURL(guild) {
		return guild.splashURL({
			dynamic: true,
			size: 2048,
			format: 'png'
		});
	}, 
	/**
	 * Extracts a Dynamic discovery Splash URL from a Discord Guild.
	 * @constructor
	 * @param {object} guild - The Guild Object the discovery Splash URL is extracted from.
	 */
	discoverySplashURL(guild) {
		return guild.discoverySplashURL({
			dynamic: true,
			size: 2048,
			format: 'png'
		});
	},
	/**
	 * Extracts a Dynamic Avatar URL from a Discord Webhook.
	 * @constructor
	 * @param {object} webhook - The Webhook Object the Avatar URL is extracted from.
	 */
	avatarURL(webhook) {
		return webhook.avatarURL({
			dynamic: true,
			size: 2048,
			format: 'png'
		});
	},
	/**
	 * Selects the Language for a Guild if it previously set a specific Language, if not it selects English.
	 * @constructor
	 * @param {object} guild - The Guild the Language is Selected for.
	 */
	async languageSelector(guild) {
		const guildid = guild?.id ? guild?.id : guild;
		if (guildid) {
			const resLan = await this.query('SELECT lan FROM guildsettings WHERE guildid = $1;', [guildid]);
			let lang = 'en';
			if (resLan && resLan.rowCount > 0) lang = resLan.rows[0].lan;
			return require(`../Languages/lan-${lang}.json`);
		} else return require('../Languages/lan-en.json');
	},
	/**
	 * Writes a Ban or Massban report including previously sent Messages of the Victim.
	 * @constructor
	 * @param {object} object - The Object to create a Log from.
	 */
	async txtFileWriter(object) {
		object = object.map(o => o);
		let content = '';
		if (object[0].source == 'debug') {
			for (let i = 0; i < object.length; i++) {
				content += `${object[i][object.toBeLogged?object.toBeLogged[0]:'']} - ${object[i][object.toBeLogged?object.toBeLogged[1]:'']} - ${object[i][object.toBeLogged?object.toBeLogged[2]:'']}\n`;
				const path = `.\\Files\\Downloads\\Debug\\${Date.now()}.txt`;
				fs.writeFile(path, content, (err) => {if (err) throw err;});
			}
		} if (object[0].source == 'massban') {
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
						if (json) urls += ` ${json.link} `;
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
	/**
	 * Tests if a String containts non-Latin Codepoints.
	 * @constructor
	 * @param {string} text - The String to Test.
	 */
	containsNonLatinCodepoints(text) {return regexes.tester.test(text);},
	/**
	 * Checks and returns Uniques of 2 Bitfields.
	 * @constructor
	 * @param {object} bit1 - The first BitField.
	 * @param {object} bit2 - The second BitField.
	 */
	bitUniques(bit1, bit2) {
		const bit = new Discord.Permissions(bit1.bitfield & bit2.bitfield);
		bit1 = bit1.remove([...bit]);
		bit2 = bit2.remove([...bit]);
		return [bit1, bit2];
	},
	/**
	 * Converts a String into a Discord Codeblock.
	 * @constructor
	 * @param {string} text - The Text to turn into a Codeblock.
	 */
	makeCodeBlock(text) {return '```'+text+'```';},
	/**
	 * Converts a String into a Discord One-Line-Code.
	 * @constructor
	 * @param {string} text - The Text to turn into a One-Line-Code.
	 */
	makeInlineCode(text) {return '`'+text+'`';},
	/**
	 * Converts a String to a Bold String.
	 * @constructor
	 * @param {string} text - The Text to turn Bold.
	 */
	makeBold(text) {return '**'+text+'**';},
	/**
	 * Converts a String to a underlined String.
	 * @constructor
	 * @param {string} text - The Text to turn Underlined.
	 */
	makeUnderlined(text) {return '__'+text+'__';},
	/**
	 * Awaits a reply of the Executor of a Moderation Command when the Command is used on another Moderator.
	 * @constructor
	 * @param {object} msg - The triggering Message of this Awaiter.
	 */
	async modRoleWaiter(msg) {
		const SUCCESS = new Discord.MessageButton()
			.setCustomId('modProceedAction')
			.setLabel(msg.language.mod.warning.proceed)
			.setStyle('SUCCESS')
			.setEmoji(client.constants.emotes.tickBGID);
		const DANGER = new Discord.MessageButton()
			.setCustomId('modAbortAction')
			.setLabel(msg.language.mod.warning.abort)
			.setEmoji(client.constants.emotes.crossBGID)
			.setStyle('DANGER');
		const m = await this.reply(msg, {content: msg.language.mod.warning.text, components: this.buttonRower([SUCCESS,DANGER]), allowedMentions: {repliedUser: true}});
		const collector = m.createMessageComponentCollector({ time: 30000 });
		return await new Promise((resolve,) => {
			collector.on('collect', answer => {
				if (answer.user.id !== msg.author.id) this.notYours(answer, msg);
				else {
					if (answer.customId == 'modProceedAction') {
						m.delete().catch(() => {});
						resolve(true);
					} else if (answer.customId == 'modAbortAction') {
						m.delete().catch(() => {});
						resolve();
					}
				}
			});
			collector.on('end', (collected, reason) => {
				if (reason == 'time') resolve(), m.delete().catch(() => { });
			});
		});
	},
	/**
	 * Sends an ephemeral Message to the triggering User, telling them this Button/Select Menu was not meant for them.
	 * @constructor
	 * @param {object} interaction - The Interaction the triggering User sent.
	 * @param {object} msg - The Message this Button/Select Menu triggered.
	 */
	notYours(interaction, msg) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.language.error, client.constants.standard.image, client.constants.standard.invite)
			.setColor(client.constants.error)
			.setDescription(msg.language.notYours);
		interaction.reply({embeds: [embed], ephemeral: true}).catch(() => {});
	},
	/**
	 * Edits a Message to display a "time has run out" Error.
	 * @constructor
	 * @param {object} msg - The Message this Function replies to.
	 */
	collectorEnd(msg) {
		const embed = new Discord.MessageEmbed()
			.setDescription(msg.language.timeError)
			.setColor(msg.client.constants.error);
		msg.m.edit({embeds: [embed], components: []}).catch(() => {});
	},
	/**
	 * Converts Button Arrays into Action Rows usable by Discord.js. Multiple Action Rows are separated by nested Arrays.
	 * @constructor
	 * @param {array} buttonArrays - The Buttons that will be put into the Action Rows.
	 */
	buttonRower(buttonArrays) {
		const actionRows = [];
		buttonArrays.forEach(buttonRow => {
			const row = new Discord.MessageActionRow();
			if (Array.isArray(buttonRow)) for (const button of buttonRow) row.addComponents(button);
			else row.addComponents(buttonRow);
			actionRows.push(row);
		});
		return actionRows;
	},
	/**
	 * Makes the embed Builder available from whever Client is available.
	 * @constructor
	 * @param {object} msg - The Message that initiated this.
	 * @param {object} answer - The Interaction to Update, if any.
	 */
	async embedBuilder(msg, answer) {
		const FinishedEmbed = await client.commands.get('embedbuilder').builder(msg, answer);
		return FinishedEmbed;
	},
	/**
	 * Aborts a Collector. 
	 * @constructor
	 * @param {object} msg - The Message that initiates this.
	 * @param {array} collectors - The Collectors to stop.
	 */
	async aborted(msg, collectors) {
		collectors?.forEach(collector => collector.stop());
		msg.m?.delete().catch(() => {});
		this.reply(msg, {content: msg.language.aborted});
	},
	/**
	 * Returns the Client Users Color to use in Embeds.
	 * @constructor
	 * @param {object} member - The Client User Member of this Guild.
	 */
	colorGetter(member) {
		return member && member.displayHexColor !== 0 ? member.displayHexColor : 'b0ff00';
	},
	/**
	 * Capitalizes the first Letter of a String.
	 * @constructor
	 * @param {string} string - The String of which to capitalize the first Letter.
	 */
	CFL(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

};