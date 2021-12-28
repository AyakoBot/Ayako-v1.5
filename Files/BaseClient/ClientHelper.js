/* eslint-disable no-console */
const URL = require('url');
const https = require('https');
const http = require('http');
const Discord = require('discord.js');
const v8 = require('v8');
const fs = require('fs');
const client = require('./DiscordClient');
const { pool } = require('./DataBase');

const DiscordEpoch = 1420070400000;
const { imgur } = require('./ImgurClient');
const Constants = require('../Constants.json');

const regexes = {
  templateMatcher: /{{\s?([^{}\s]*)\s?}}/g,
  strReplacer1: /_/g,
  strReplacer2: /\w\S*/g,
  auditLogTransform: /~/g,
  // eslint-disable-next-line no-control-regex
  tester: /[^\u0000-\u00ff]/,
};

module.exports = {
  /**
   * Checks if needed Paths exist on startup and if not creates them.
   * @constructor
   */
  pathCheck() {
    if (!fs.existsSync('.\\Files\\Downloads')) fs.mkdirSync('.\\Files\\Downloads');
    if (!fs.existsSync('.\\Files\\Downloads\\Messages'))
      fs.mkdirSync('.\\Files\\Downloads\\Messages');
    if (!fs.existsSync('.\\Files\\Downloads\\Messages\\Bulk Deletes'))
      fs.mkdirSync('.\\Files\\Downloads\\Messages\\Bulk Deletes');
    if (!fs.existsSync('.\\Files\\Downloads\\Guilds')) fs.mkdirSync('.\\Files\\Downloads\\Guilds');
    if (!fs.existsSync('.\\Files\\Downloads\\Users')) fs.mkdirSync('.\\Files\\Downloads\\Users');
    if (!fs.existsSync('.\\Files\\Downloads\\Massbans'))
      fs.mkdirSync('.\\Files\\Downloads\\Massbans');
    if (!fs.existsSync('.\\Files\\Downloads\\Captchas'))
      fs.mkdirSync('.\\Files\\Downloads\\Captchas');
    if (!fs.existsSync('.\\Files\\Downloads\\Logs')) fs.mkdirSync('.\\Files\\Downloads\\Logs');
  },
  /**
   * Sends a Message to a channel.
   * @constructor
   * @param {object} channel
   * - The Channel the Messages will be sent in (supports Array of Channels).
   * @param {string} content
   * - The Content of the Message or the Message Options if no content is provided.
   * @param {object} options
   * - The Options of this Message, if any.
   */
  async send(channel, content, options) {
    if (Array.isArray(channel))
      return channel.forEach((c) =>
        typeof c.send === 'function' ? this.send(c, content, options) : null,
      );
    if (!channel || typeof channel.send !== 'function') return null;
    let webhook;
    if (client.channelWebhooks.get(channel.id)) webhook = client.channelWebhooks.get(channel.id);
    let m;
    if (options && options.type === 'rich') {
      const oldOptions = options;
      // eslint-disable-next-line no-param-reassign
      options = {};
      // eslint-disable-next-line no-param-reassign
      options.embeds = [oldOptions];
      // eslint-disable-next-line no-param-reassign
    } else options = {};
    // eslint-disable-next-line no-param-reassign
    options.failIfNotExists = false;
    if (content && content.type === 'rich')
      if (options.embeds) {
        // eslint-disable-next-line no-param-reassign
        options.embeds.push(content);
      } else {
        // eslint-disable-next-line no-param-reassign
        options.embeds = [content];
      }
    // eslint-disable-next-line no-param-reassign
    else if (typeof content !== 'string') options = content;
    // eslint-disable-next-line no-param-reassign
    else options.content = content;
    if (webhook && !channel.force) {
      m = await webhook.send(options).catch(() => {
        // eslint-disable-next-line no-param-reassign
        channel.force = true;
        this.send(channel, options);
      });
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
    if (options && options.type === 'rich') {
      const oldOptions = options;
      // eslint-disable-next-line no-param-reassign
      options = {};
      // eslint-disable-next-line no-param-reassign
      options.embeds = [oldOptions];
      // eslint-disable-next-line no-param-reassign
    } else options = {};
    if (content && content.type === 'rich')
      // eslint-disable-next-line no-unused-expressions,no-param-reassign
      options.embeds ? options.embeds.push(content) : (options.embeds = [content]);
    // eslint-disable-next-line no-param-reassign
    else if (typeof content !== 'string') options = content;
    // eslint-disable-next-line no-param-reassign
    else options.content = content;
    return msg.reply(options).catch((e) => {
      console.log(e);
    });
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
      expression.forEach((rawE) => {
        const e = `${rawE}`;
        let text = e.replace(regexes.templateMatcher, (substring, value) => {
          const newValue = value.split('.');
          let decided;
          const Result = Object[newValue[0]];
          if (Result) {
            if (newValue.length > 1) {
              newValue.forEach((element, i) => {
                if (i === 1) decided = Result[element];
                if (i > 1) decided = decided[element];
              });
              return decided;
            }
            return Result;
          }
          return substring;
        });
        if (text === 'true') text = true;
        if (text === 'false') text = false;
        if (`${text}`.replace(/\D+/g, '') === text && Number.MAX_SAFE_INTEGER > parseInt(text, 10))
          text = Number(text);
        returned.push(text);
      });
      return returned;
    }
    const text = expression.replace(regexes.templateMatcher, (substring, value) => {
      const newValue = value.split('.');
      let decided;
      const Result = Object[newValue[0]];
      if (Result) {
        if (newValue.length > 1) {
          newValue.forEach((objValue, i) => {
            if (i === 1) decided = Result[objValue];
            if (i > 1) decided = decided[objValue];
          });
          return decided;
        }
        return Result;
      }
      return substring;
    });
    return text;
  },
  /**
   * Sends a query to the DataBase.
   * @constructor
   * @param {string} query - The Query that will be sent to the DataBase
   * @param {array} arr - The Array of Arguments passed to the DataBase for sanitizing, if any.
   * @param {boolean} debug - Wether the Query should be logged in the Console when arriving here.
   */
  async query(query, arr, debug) {
    if (debug === true) console.log(query, arr);
    const res = await pool.query(query, arr).catch((err) => {
      console.log(query, arr);
      this.logger('Pool Query Error', err);
    });
    if (res) return res;
    return null;
  },
  /**
   * Logs any incoming Messages to the Console and the Discord Error Channel.
   * @constructor
   * @param {string} type - The Type or Origin of this Log
   * @param {string|object} log - The Log that will be logged to the Console and Error Channel.
   */
  async logger(type, log) {
    if (client && client.user) {
      const channel = await client.channels
        .fetch(Constants.standard.errorLogChannel)
        .catch(() => {});
      if (channel && channel.id) {
        if (log) {
          if (log.stack) channel.send(`${type}${this.makeCodeBlock(log.stack)}`).catch(() => {});
          else channel.send(`${type}${this.makeCodeBlock(log)}`).catch(() => {});
          console.error(type, log);
        } else {
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
    const newUrl = [];
    let path;
    const pathers = url ? url.split('.') : null;
    let pathend;
    if (pathers) pathend = `${pathers[pathers.length - 1]}`.replace(URL.parse(url).search, '');
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
        const userdir = `.\\Files\\Downloads\\Users\\User - ${ident.id}`;
        if (!fs.existsSync(userdir)) {
          fs.mkdirSync(userdir);
        }
      }
    }
    if (!url) {
      // eslint-disable-next-line no-param-reassign
      ident.attachments = ident.attachments
        .map((o) => o)
        .map((attachment, i) => {
          path = `${path}-${i}`;
          const pather = attachment.url.split('.');
          pathend = `${pather[pather.length - 1]}`;
          const urlArray = {
            url: attachment.url,
            path: `${path}.${pathend}`,
          };
          return urlArray;
        });
    } else if (ident.animated) {
      pathend = ident.animated ? 'gif' : 'png';
    }
    if (Array.isArray(newUrl)) {
      const promises = newUrl.map((u) => this.download(u.url, u.path));
      await Promise.all(promises);
    } else await this.download(newUrl, `${path}.${pathend}`);
    return `${path}.${pathend}`;
  },
  /**
   * Extracts a File Name out of a File Path.
   * @constructor
   * @param {string} path - The Path of the File the Name will be extracted from.
   */
  async getName(path) {
    let name = path.split('\\');
    name = name[name.length - 1];
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
      const request = proto.get(url, (response) => {
        if (response.statusCode !== 200) return;
        fileInfo = {
          mime: response.headers['content-type'],
          size: parseInt(response.headers['content-length'], 10),
        };
        response.pipe(file);
      });
      file.on('finish', () => resolve(fileInfo));
      request.on('error', (err) => {
        fs.unlink(filePath, () => reject(err));
      });
      file.on('error', (err) => {
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
    if (BitField.has(1n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.CREATE_INSTANT_INVITE);
    }
    if (BitField.has(2n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.KICK_MEMBERS);
    }
    if (BitField.has(4n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.BAN_MEMBERS);
    }
    if (BitField.has(8n)) {
      Perms.push(lan.permissions.ADMINISTRATOR);
    }
    if (BitField.has(16n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.MANAGE_CHANNELS);
    }
    if (BitField.has(32n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.MANAGE_GUILD);
    }
    if (BitField.has(64n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.ADD_REACTIONS);
    }
    if (BitField.has(128n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.VIEW_AUDIT_LOG);
    }
    if (BitField.has(256n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.PRIORITY_SPEAKER);
    }
    if (BitField.has(512n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.STREAM);
    }
    if (BitField.has(1024n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.VIEW_CHANNEL);
    }
    if (BitField.has(2048n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.SEND_MESSAGES);
    }
    if (BitField.has(4096n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.SEND_TTS_MESSAGES);
    }
    if (BitField.has(8192n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.MANAGE_MESSAGES);
    }
    if (BitField.has(16384n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.EMBED_LINKS);
    }
    if (BitField.has(32768n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.ATTACH_FILES);
    }
    if (BitField.has(65536n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.READ_MESSAGE_HISTORY);
    }
    if (BitField.has(131072n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.MENTION_EVERYONE);
    }
    if (BitField.has(262144n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.USE_EXTERNAL_EMOJIS);
    }
    if (BitField.has(524288n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.VIEW_GUILD_INSIGHTS);
    }
    if (BitField.has(1048576n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.CONNECT);
    }
    if (BitField.has(2097152n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.SPEAK);
    }
    if (BitField.has(4194304n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.MUTE_MEMBERS);
    }
    if (BitField.has(8388608n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.DEAFEN_MEMBERS);
    }
    if (BitField.has(16777216n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.MOVE_MEMBERS);
    }
    if (BitField.has(33554432n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.USE_VAD);
    }
    if (BitField.has(67108864n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.CHANGE_NICKNAME);
    }
    if (BitField.has(134217728n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.MANAGE_NICKNAMES);
    }
    if (BitField.has(268435456n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.MANAGE_ROLES);
    }
    if (BitField.has(536870912n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.MANAGE_WEBHOOKS);
    }
    if (BitField.has(1073741824n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.MANAGE_EMOJIS_AND_STICKERS);
    }
    if (BitField.has(2147483648n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.USE_APPLICATION_COMMANDS);
    }
    if (BitField.has(4294967296n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.REQUEST_TO_SPEAK);
    }
    if (BitField.has(17179869184n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.MANAGE_THREADS);
    }
    if (BitField.has(34359738368n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.USE_AND_CREATE_PUBLIC_THREADS);
    }
    if (BitField.has(68719476736n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.USE_AND_CREATE_PRIVATE_THREADS);
    }
    if (BitField.has(137438953472n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.USE_EXTERNAL_STICKERS);
    }
    if (BitField.has(274877906944n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.SEND_MESSAGES_IN_THREADS);
    }
    if (BitField.has(549755813888n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.START_EMBEDDED_ACTIVITIES);
    }
    if (BitField.has(1099511627776n) && BitField.bitfield !== 8n) {
      Perms.push(lan.permissions.MODERATE_MEMBERS);
    }

    return Perms;
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
    const unix = dateBits + DiscordEpoch;
    return unix;
  },
  /**
   * Identifies and returns the Difference of two Arrays.
   * @constructor
   * @param {array} array1 - The first Array.
   * @param {array} array2 - The second Array.
   */
  getDifference(array1, array2) {
    return array1.filter((i) => array2.indexOf(i) < 0);
  },
  /**
   * Extracts a Dynamic Avatar URL from a Discord User.
   * @constructor
   * @param {object} rawUser - The User Object the Avatar URL is extracted from.
   */
  displayAvatarURL(rawUser) {
    let user = {};
    if (rawUser.user) {
      user = rawUser.user;
    } else {
      user = rawUser;
    }
    return user.displayAvatarURL({
      dynamic: true,
      size: 2048,
      format: 'png',
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
      format: 'png',
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
      format: 'png',
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
      format: 'png',
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
      format: 'png',
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
      format: 'png',
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
      const resLan = await this.query('SELECT lan FROM guildsettings WHERE guildid = $1;', [
        guildid,
      ]);
      let lang = 'en';
      if (resLan && resLan.rowCount > 0) lang = resLan.rows[0].lan;
      // eslint-disable-next-line import/no-dynamic-require,global-require
      return require(`../Languages/lan-${lang}.json`);
    }
    // eslint-disable-next-line import/no-dynamic-require,global-require
    return require('../Languages/lan-en.json');
  },
  /**
   * Writes a Ban or Massban report including previously sent Messages of the Target.
   * @constructor
   * @param {object} object - The Object to create a Log from.
   */
  async txtFileWriter(rawObject) {
    const object = rawObject.map((o) => o);
    let content = '';
    if (object[0].source === 'debug') {
      object.forEach((entries) => {
        content += `${entries[object.toBeLogged ? object.toBeLogged[0] : '']} - ${
          entries[object.toBeLogged ? object.toBeLogged[1] : '']
        } - ${entries[object.toBeLogged ? object.toBeLogged[2] : '']}\n`;
        const path = `.\\Files\\Downloads\\Debug\\${Date.now()}.txt`;
        fs.writeFile(path, content, (err) => {
          if (err) throw err;
        });
      });
    }
    if (object[0].source === 'massban') {
      object.forEach((obj) => {
        content += `${obj.tag} / ${obj.id}\n`;
      });
      const now = Date.now();
      const path = `.\\Files\\Downloads\\Massbans\\Guild - ${object[0].guild.id}\\${now}.txt`;
      const guilddir = `.\\Files\\Downloads\\Massbans\\Guild - ${object[0].guild.id}`;
      if (!fs.existsSync(guilddir)) fs.mkdirSync(guilddir);
      fs.writeFile(path, content, (err) => {
        if (err) throw err;
      });
      return path;
    }
    if (!object[0].source) {
      const createTxt = async (obj) => {
        let urls = '';
        const msg = [];
        const o = obj;
        msg.author = o.author;
        msg.timestamp = this.getUnix(o.id);
        msg.content = o.content;
        if (o.attachments) {
          o.attachments = o.attachments.map((a) => a);
          const imgurUpload = async (attachment) => {
            const json = await imgur.uploadUrl(attachment.url).catch(() => {});
            if (json) urls += ` ${json.link} `;
          };
          const imgurPromises = o.attachments.map((attachment) => imgurUpload(attachment));
          await Promise.all(imgurPromises);
        }
        content += `\n${msg.author && msg.author.tag ? msg.author.tag : 'Unknown Author'} (${
          msg.author && msg.author.id ? msg.author.id : 'Unknown Author'
        }) at ${new Date(msg.timestamp).toUTCString()}\n${
          urls !== '' ? `Attachments: ${urls}\n` : ''
        }${msg.content ? msg.content : 'Unknown Content'}\n`;
      };
      const promises = object.map((obj) => createTxt(obj));
      await Promise.all(promises);
      const now = Date.now();
      const path = `.\\Files\\Downloads\\Messages\\Bulk Deletes\\Guild - ${object[0].guild.id}\\Channel - ${object[0].channel.id}\\${now}.txt`;
      const guilddir = `.\\Files\\Downloads\\Messages\\Bulk Deletes\\Guild - ${object[0].guild.id}`;
      if (!fs.existsSync(guilddir)) fs.mkdirSync(guilddir);
      const channeldir = `.\\Files\\Downloads\\Messages\\Bulk Deletes\\Guild - ${object[0].guild.id}\\Channel - ${object[0].channel.id}`;
      if (!fs.existsSync(channeldir)) fs.mkdirSync(channeldir);
      fs.writeFile(path, content, (err) => {
        if (err) throw err;
      });
      return path;
    }
    return null;
  },
  /**
   * Tests if a String containts non-Latin Codepoints.
   * @constructor
   * @param {string} text - The String to Test.
   */
  containsNonLatinCodepoints(text) {
    return regexes.tester.test(text);
  },
  /**
   * Checks and returns Uniques of 2 Bitfields.
   * @constructor
   * @param {object} bit1 - The first BitField.
   * @param {object} bit2 - The second BitField.
   */
  bitUniques(bit1, bit2) {
    const bit = new Discord.Permissions(bit1.bitfield & bit2.bitfield);
    const newBit1 = bit1.remove([...bit]);
    const newBit2 = bit2.remove([...bit]);
    return [newBit1, newBit2];
  },
  /**
   * Converts a String into a Discord Codeblock.
   * @constructor
   * @param {string} text - The Text to turn into a Codeblock.
   */
  makeCodeBlock(text) {
    return `\`\`\`${text}\`\`\``;
  },
  /**
   * Converts a String into a Discord One-Line-Code.
   * @constructor
   * @param {string} text - The Text to turn into a One-Line-Code.
   */
  makeInlineCode(text) {
    return `\`${text}\``;
  },
  /**
   * Converts a String to a Bold String.
   * @constructor
   * @param {string} text - The Text to turn Bold.
   */
  makeBold(text) {
    return `**${text}**`;
  },
  /**
   * Converts a String to a underlined String.
   * @constructor
   * @param {string} text - The Text to turn Underlined.
   */
  makeUnderlined(text) {
    return `__${text}__`;
  },
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
    const m = await this.reply(msg, {
      content: msg.language.mod.warning.text,
      components: this.buttonRower([SUCCESS, DANGER]),
      allowedMentions: { repliedUser: true },
    });
    const collector = m.createMessageComponentCollector({ time: 30000 });
    return new Promise((resolve) => {
      collector.on('collect', (answer) => {
        if (answer.user.id !== msg.author.id) this.notYours(answer, msg);
        else if (answer.customId === 'modProceedAction') {
          m.delete().catch(() => {});
          resolve(true);
        } else if (answer.customId === 'modAbortAction') {
          m.delete().catch(() => {});
          resolve();
        }
      });
      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          resolve();
          m.delete().catch(() => {});
        }
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
      .setAuthor({
        name: msg.language.error,
        iconURL: client.constants.standard.image,
        url: client.constants.standard.invite,
      })
      .setColor(client.constants.error)
      .setDescription(msg.language.notYours);
    interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
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
    msg.m.edit({ embeds: [embed], components: [] }).catch(() => {});
  },
  /**
   * Converts Button Arrays into Action Rows usable by Discord.js. Multiple Action Rows are separated by nested Arrays.
   * @constructor
   * @param {array} buttonArrays - The Buttons that will be put into the Action Rows.
   */
  buttonRower(buttonArrays) {
    const actionRows = [];
    buttonArrays.forEach((buttonRow) => {
      const row = new Discord.MessageActionRow();
      if (Array.isArray(buttonRow)) {
        buttonRow.forEach((button) => {
          row.addComponents(button);
        });
      } else row.addComponents(buttonRow);
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
    collectors?.forEach((collector) => collector.stop());
    msg.m?.delete().catch(() => {});
    this.reply(msg, { content: msg.language.aborted });
  },
  /**
   * Returns the Client Users Color to use in Embeds.
   * @constructor
   * @param {object} member - The Client User Member of this Guild.
   */
  colorSelector(member) {
    return member && member.displayHexColor !== 0 ? member.displayHexColor : 'b0ff00';
  },
  /**
   * Capitalizes the first Letter of a String.
   * @constructor
   * @param {string} string - The String of which to capitalize the first Letter.
   */
  CFL(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  /**
   * Creates a sample Loading Embed.
   * @constructor
   * @param {object} lan - The Language which is to be used.
   * @param {object} guild - The Guild in which this Command was called
   */
  async loadingEmbed(lan, guild) {
    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: lan.author,
        iconURL: client.constants.emotes.loadingLink,
        url: client.constants.standard.invite,
      })
      .setColor(this.colorSelector(guild?.me))
      .setDescription(
        `${client.constants.emotes.loading} ${
          lan.loading ? lan.loading : (await this.languageSelector(guild)).loading
        }`,
      );
    return embed;
  },
  /**
   * Creates a sample Loading Embed.
   * @constructor
   * @param {array} arr1 - An Array
   * @param {array} arr2 - The Array to compare to arr1
   */
  arrayEquals(arr1, arr2) {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;

    const results = [];

    arr1.every((item) => {
      if (!arr2.includes(item)) results.push(false);
      else results.push(true);
      return null;
    });

    if (!results.includes(false)) {
      arr2.every((item) => {
        if (!arr1.includes(item)) results.push(false);
        else results.push(true);
        return null;
      });
    }

    return !results.includes(false);
  },
  /**
   * Clones an Object.
   * @constructor
   * @param {object} obj - The Object to clone
   */
  objectClone(obj) {
    return v8.deserialize(v8.serialize(obj));
  },
};
