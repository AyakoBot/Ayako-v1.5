/* eslint-disable no-console */
const https = require('https');
const http = require('http');
const Discord = require('discord.js');
const v8 = require('v8');
const fs = require('fs');
const SA = require('superagent');

const auth = require('./auth.json');
const ChannelRules = require('./Other Client Files/ChannelRules');
const Constants = require('../Constants.json');

const DiscordEpoch = 1420070400000;

module.exports = {
  /**
   * Various regexes
   * If using emojiTester regex with match(), !!filter output by length!!,
   * as output can include 0 char strings
   */
  regexes: {
    templateMatcher: /{{\s?([^{}\s]*)\s?}}/g,
    emojiTester: require('./Other Client Files/EmojiRegex'),
  },
  /**
   * Sends a Message to a channel.
   * @constructor
   * @param {object} channel - The Channel the Messages will be sent in
   *                           (supports Array of Channels).
   * @param {object|string} rawPayload - The Payload or String sent
   */
  send: async (channel, rawPayload) => {
    if (!channel) return null;

    const payload =
      typeof rawPayload === 'string' ? { failIfNotExists: false, content: rawPayload } : rawPayload;

    if (channel.type === 1) {
      return channel.send(payload).catch(() => null);
    }

    let channels;

    if (Array.isArray(channel)) {
      channels = channel.map((c) => (typeof c.send === 'function' ? c : null));
    } else {
      if (typeof channel.send !== 'function') throw new Error('Invalid Channel');
      channels = [channel];
    }

    if (!channels.length) return null;

    if (channels.length === 1) {
      return channels[0].send(payload).catch(() => null);
    }

    const sendPromises = channels.map((c) => c.send(payload).catch(() => null));
    return Promise.all(sendPromises);
  },
  /**
   * Replies to a Message.
   * @constructor
   * @param {object} msg - The Message the Reply will be replied to.
   * @param {object|string} rawPayload - The Payload or String sent
   */
  reply: async (msg, rawPayload) => {
    const payload =
      typeof rawPayload === 'string' ? { failIfNotExists: false, content: rawPayload } : rawPayload;

    if (typeof msg.reply !== 'function') {
      const [response] = await module.exports.send(msg.channel, payload);
      return response;
    }

    return msg.reply(rawPayload).catch((e) => {
      console.log(e);
    });
  },
  /**
   * Places Objects or Strings of the Objects Option into the Expressions option,
   * replacing same named variables marked by "{{variable Name}}".
   * @constructor
   * @param {string} expression - The String following Strings/Objects will be put into.
   * @param {object} Object - The Object containing all Strings/Objects
   *                          that will be put into the expression.
   * @returns {string} The finished String with replaced variables
   */
  stp: (expression, Object) => {
    const replacer = (e) => {
      const text = e.replace(module.exports.regexes.templateMatcher, (substring, value) => {
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
      return text;
    };

    if (Array.isArray(expression)) {
      const returned = [];
      expression.forEach((rawE) => {
        const e = `${rawE}`;
        let text = replacer(e);
        if (text === 'true') text = true;
        if (text === 'false') text = false;
        if (
          `${text}`.replace(/\D+/g, '') === text &&
          Number.MAX_SAFE_INTEGER > parseInt(text, 10)
        ) {
          text = Number(text);
        }
        returned.push(text);
      });
      return returned;
    }
    const text = replacer(expression);
    return text.replace(RegExp(auth.token, 'g'), 'TOKEN');
  },
  /**
   * Sends a query to the DataBase.
   * @constructor
   * @param {string} query - The Query that will be sent to the DataBase
   * @param {array} arr - The Array of Arguments passed to the DataBase for sanitizing, if any.
   * @param {boolean} debug - Wether the Query should be logged in the Console when arriving here.
   */
  query: async (query, arr, debug) => {
    const { pool } = require('./DataBase');

    if (debug === true) console.log(query, arr);

    return pool.query(query, arr).catch((err) => {
      console.log(query, arr);
      module.exports.logger('Pool Query Error', err);
      return null;
    });
  },
  /**
   * Logs any incoming Messages to the Console and the Discord Error Channel.
   * @constructor
   * @param {string} type - The Type or Origin of module.exports Log
   * @param {string|object} log - The Log that will be logged to the Console and Error Channel.
   */
  logger: async (type, log) => {
    const client = require('./DiscordClient');

    if (client && client.user) {
      const channel = await client.channels
        .fetch(Constants.standard.errorLogChannel)
        .catch(() => {});
      if (channel && channel.id) {
        if (log) {
          if (log.stack) {
            channel.send(`${type}${module.exports.makeCodeBlock(log.stack)}`).catch(() => {});
          } else channel.send(`${type}${module.exports.makeCodeBlock(log)}`).catch(() => {});
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
   * @param {array} urls - The URLs the buffers will be created from.
   */
  convertImageURLtoBuffer: async (urls) => {
    const superagentPromises = urls.map((url) => SA.get(url).catch((e) => e));

    const responses = await Promise.all(superagentPromises);

    return responses
      .map((res, i) => {
        const URLObject = new URL(urls[i]);
        const name = URLObject.pathname.split(/\/+/).pop();

        const buffer = res?.body;

        if (buffer) {
          return {
            attachment: buffer,
            name,
          };
        }
        return null;
      })
      .filter((r) => !!r);
  },
  /**
   * Extracts a File Name out of a File Path.
   * @constructor
   * @param {string} path - The Path of the File the Name will be extracted from.
   */
  getName: async (path) => {
    let name = path.split('\\');
    name = name[name.length - 1];
    return name;
  },
  /**
   * Downloads a File from the given URL and saves it to the given Path.
   * @constructor
   * @param {string} url - The URL the File will be downloaded from.
   * @param {object} filePath - The Path to the previously generated Placeholder File.
   */
  download: async (url, filePath) => {
    const proto = !url.charAt(4).localeCompare('s') ? https : http;

    await new Promise((resolve, reject) => {
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

    return filePath;
  },
  /**
   * A translator for Member Boost Flags into the given Language.
   * @constructor
   * @param {object} client - The Base Client.
   * @param {number} bits - The Bits the Language will be translated from.
   * @param {object} lan - The Language File the Bits will be Translated based off of.
   * @param {boolean} emotes - Whether to add Emotes to the Translated Flags.
   */
  memberBoostCalc: (client, bits, lan, emotes) => {
    if (!bits) return [];
    const BitField = new Discord.BitField(Number(bits));
    const Flags = [];

    if (BitField.has(1)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.BOOST1 : ''} ${lan.userFlags.BOOST1}`,
      );
    }
    if (BitField.has(2)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.BOOST2 : ''} ${lan.userFlags.BOOST2}`,
      );
    }
    if (BitField.has(4)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.BOOST3 : ''} ${lan.userFlags.BOOST3}`,
      );
    }
    if (BitField.has(8)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.BOOST6 : ''} ${lan.userFlags.BOOST6}`,
      );
    }
    if (BitField.has(16)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.BOOST9 : ''} ${lan.userFlags.BOOST9}`,
      );
    }
    if (BitField.has(32)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.BOOST12 : ''} ${lan.userFlags.BOOST12}`,
      );
    }
    if (BitField.has(64)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.BOOST15 : ''} ${lan.userFlags.BOOST15}`,
      );
    }
    if (BitField.has(128)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.BOOST18 : ''} ${lan.userFlags.BOOST18}`,
      );
    }
    if (BitField.has(256)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.BOOST24 : ''} ${lan.userFlags.BOOST24}`,
      );
    }

    return Flags;
  },
  /**
   * A translator for User Flags into the given Language.
   * @constructor
   * @param {object} client - The Base Client.
   * @param {number} bits - The Bits the Language will be translated from.
   * @param {object} lan - The Language File the Bits will be Translated based off of.
   * @param {boolean} emotes - Whether to add Emotes to the Translated Flags.
   */
  userFlagCalc: (client, bits, lan, emotes) => {
    if (!bits) return [];
    const BitField = new Discord.UserFlagsBitField(Number(bits));
    const Flags = [];

    if (BitField.has(1)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.DISCORD_EMPLOYEE : ''} ${
          lan.userFlags.DISCORD_EMPLOYEE
        }`,
      );
    }
    if (BitField.has(2)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.PARTNERED_SERVER_OWNER : ''} ${
          lan.userFlags.PARTNERED_SERVER_OWNER
        }`,
      );
    }
    if (BitField.has(4)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.HYPESQUAD_EVENTS : ''} ${
          lan.userFlags.HYPESQUAD_EVENTS
        }`,
      );
    }
    if (BitField.has(8)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.BUGHUNTER_LEVEL_1 : ''} ${
          lan.userFlags.BUGHUNTER_LEVEL_1
        }`,
      );
    }
    if (BitField.has(64)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.HOUSE_BRAVERY : ''} ${
          lan.userFlags.HOUSE_BRAVERY
        }`,
      );
    }
    if (BitField.has(128)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.HOUSE_BRILLIANCE : ''} ${
          lan.userFlags.HOUSE_BRILLIANCE
        }`,
      );
    }
    if (BitField.has(256)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.HOUSE_BALANCE : ''} ${
          lan.userFlags.HOUSE_BALANCE
        }`,
      );
    }
    if (BitField.has(512)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.EARLY_SUPPORTER : ''} ${
          lan.userFlags.EARLY_SUPPORTER
        }`,
      );
    }
    if (BitField.has(1024)) {
      Flags.push(`${lan.userFlags.TEAM_USER}`);
    }
    if (BitField.has(2048)) {
      Flags.push(`${emotes ? client.constants.emotes.userFlags.BOT : ''} ${lan.userFlags.BOT}`);
    }
    if (BitField.has(4096)) {
      Flags.push(`${emotes ? client.constants.emotes.userFlags.NITRO : ''} ${lan.userFlags.NITRO}`);
    }
    if (BitField.has(16384)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.BUGHUNTER_LEVEL_2 : ''} ${
          lan.userFlags.BUGHUNTER_LEVEL_2
        }`,
      );
    }
    if (BitField.has(65536)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.VERIFIED_BOT : ''} ${
          lan.userFlags.VERIFIED_BOT
        }`,
      );
    }
    if (BitField.has(131072)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.EARLY_VERIFIED_BOT_DEVELOPER : ''} ${
          lan.userFlags.EARLY_VERIFIED_BOT_DEVELOPER
        }`,
      );
    }
    if (BitField.has(262144)) {
      Flags.push(
        `${emotes ? client.constants.emotes.userFlags.DISCORD_CERTIFIED_MODERATOR : ''} ${
          lan.userFlags.DISCORD_CERTIFIED_MODERATOR
        }`,
      );
    }
    if (BitField.has(524288)) {
      Flags.push(`${lan.userFlags.BOT_HTTP_INTERACTIONS}`);
    }

    return Flags;
  },
  /**
   * A translator for Channel Rules into the given Language.
   * @constructor
   * @param {number} bits - The Bits the Language will be translated from.
   * @param {object} lan - The Language File the Bits will be Translated based off of.
   */
  channelRuleCalc: (bits, lan) => {
    if (!bits) return [];
    const BitField = new ChannelRules(BigInt(bits));
    const Rules = [];

    if (BitField.has(1n)) {
      Rules.push(lan.channelRules.HAS_LEAST_ATTACHMENTS);
    }
    if (BitField.has(2n)) {
      Rules.push(lan.channelRules.HAS_MOST_ATTACHMENTS);
    }
    if (BitField.has(4n)) {
      Rules.push(lan.channelRules.HAS_LEAST_CHARACTERS);
    }
    if (BitField.has(8n)) {
      Rules.push(lan.channelRules.HAS_MOST_CHARACTERS);
    }
    if (BitField.has(16n)) {
      Rules.push(lan.channelRules.HAS_LEAST_WORDS);
    }
    if (BitField.has(32n)) {
      Rules.push(lan.channelRules.HAS_MOST_WORDS);
    }
    if (BitField.has(64n)) {
      Rules.push(lan.channelRules.MENTIONS_LEAST_USERS);
    }
    if (BitField.has(128n)) {
      Rules.push(lan.channelRules.MENTIONS_MOST_USERS);
    }
    if (BitField.has(256n)) {
      Rules.push(lan.channelRules.MENTIONS_LEAST_CHANNELS);
    }
    if (BitField.has(512n)) {
      Rules.push(lan.channelRules.MENTIONS_MOST_CHANNELS);
    }
    if (BitField.has(1024n)) {
      Rules.push(lan.channelRules.MENTIONS_LEAST_ROLES);
    }
    if (BitField.has(2048n)) {
      Rules.push(lan.channelRules.MENTIONS_MOST_ROLES);
    }
    if (BitField.has(4096n)) {
      Rules.push(lan.channelRules.HAS_LEAST_LINKS);
    }
    if (BitField.has(8192n)) {
      Rules.push(lan.channelRules.HAS_MOST_LINKS);
    }
    if (BitField.has(16384n)) {
      Rules.push(lan.channelRules.HAS_LEAST_EMOTES);
    }
    if (BitField.has(32768n)) {
      Rules.push(lan.channelRules.HAS_MOST_EMOTES);
    }
    if (BitField.has(65536n)) {
      Rules.push(lan.channelRules.HAS_LEAST_MENTIONS);
    }
    if (BitField.has(131072n)) {
      Rules.push(lan.channelRules.HAS_MOST_MENTIONS);
    }

    return Rules;
  },
  /**
   * A translator for Discord BitField Permissions into the given Language.
   * @constructor
   * @param {number} bits - The Bits the Language will be translated from.
   * @param {object} lan - The Language File the Bits will be Translated based off of.
   */
  permCalc: (bits, lan, isntRole) => {
    const BitField = new Discord.PermissionsBitField(BigInt(bits));
    const Perms = [];

    if (BitField.has(1n, false)) {
      Perms.push(lan.permissions.CREATE_INSTANT_INVITE);
    }
    if (BitField.has(2n, false)) {
      Perms.push(lan.permissions.KICK_MEMBERS);
    }
    if (BitField.has(4n, false)) {
      Perms.push(lan.permissions.BAN_MEMBERS);
    }
    if (BitField.has(8n, false)) {
      Perms.push(lan.permissions.ADMINISTRATOR);
    }
    if (BitField.has(16n, false)) {
      if (isntRole) {
        Perms.push(lan.permissions.MANAGE_CHANNEL);
      } else {
        Perms.push(lan.permissions.MANAGE_CHANNELS);
      }
    }
    if (BitField.has(32n, false)) {
      Perms.push(lan.permissions.MANAGE_GUILD);
    }
    if (BitField.has(64n, false)) {
      Perms.push(lan.permissions.ADD_REACTIONS);
    }
    if (BitField.has(128n, false)) {
      Perms.push(lan.permissions.VIEW_AUDIT_LOG);
    }
    if (BitField.has(256n, false)) {
      Perms.push(lan.permissions.PRIORITY_SPEAKER);
    }
    if (BitField.has(512n, false)) {
      Perms.push(lan.permissions.STREAM);
    }
    if (BitField.has(1024n, false)) {
      if (isntRole) {
        Perms.push(lan.permissions.VIEW_CHANNEL);
      } else {
        Perms.push(lan.permissions.VIEW_CHANNELS);
      }
    }
    if (BitField.has(2048n, false)) {
      Perms.push(lan.permissions.SEND_MESSAGES);
    }
    if (BitField.has(4096n, false)) {
      Perms.push(lan.permissions.SEND_TTS_MESSAGES);
    }
    if (BitField.has(8192n, false)) {
      Perms.push(lan.permissions.MANAGE_MESSAGES);
    }
    if (BitField.has(16384n, false)) {
      Perms.push(lan.permissions.EMBED_LINKS);
    }
    if (BitField.has(32768n, false)) {
      Perms.push(lan.permissions.ATTACH_FILES);
    }
    if (BitField.has(65536n, false)) {
      Perms.push(lan.permissions.READ_MESSAGE_HISTORY);
    }
    if (BitField.has(131072n, false)) {
      Perms.push(lan.permissions.MENTION_EVERYONE);
    }
    if (BitField.has(262144n, false)) {
      Perms.push(lan.permissions.USE_EXTERNAL_EMOJIS);
    }
    if (BitField.has(524288n, false)) {
      Perms.push(lan.permissions.VIEW_GUILD_INSIGHTS);
    }
    if (BitField.has(1048576n, false)) {
      Perms.push(lan.permissions.CONNECT);
    }
    if (BitField.has(2097152n, false)) {
      Perms.push(lan.permissions.SPEAK);
    }
    if (BitField.has(4194304n, false)) {
      Perms.push(lan.permissions.MUTE_MEMBERS);
    }
    if (BitField.has(8388608n, false)) {
      Perms.push(lan.permissions.DEAFEN_MEMBERS);
    }
    if (BitField.has(16777216n, false)) {
      Perms.push(lan.permissions.MOVE_MEMBERS);
    }
    if (BitField.has(33554432n, false)) {
      Perms.push(lan.permissions.USE_VAD);
    }
    if (BitField.has(67108864n, false)) {
      Perms.push(lan.permissions.CHANGE_NICKNAME);
    }
    if (BitField.has(134217728n, false)) {
      Perms.push(lan.permissions.MANAGE_NICKNAMES);
    }
    if (BitField.has(268435456n, false)) {
      if (isntRole) {
        Perms.push(lan.permissions.MANAGE_PERMISSIONS);
      } else {
        Perms.push(lan.permissions.MANAGE_ROLES);
      }
    }
    if (BitField.has(536870912n, false)) {
      Perms.push(lan.permissions.MANAGE_WEBHOOKS);
    }
    if (BitField.has(1073741824n, false)) {
      Perms.push(lan.permissions.MANAGE_EMOJIS_AND_STICKERS);
    }
    if (BitField.has(2147483648n, false)) {
      Perms.push(lan.permissions.USE_APPLICATION_COMMANDS);
    }
    if (BitField.has(4294967296n, false)) {
      Perms.push(lan.permissions.REQUEST_TO_SPEAK);
    }
    if (BitField.has(8589934592n, false)) {
      Perms.push(lan.permissions.MANAGE_EVENTS);
    }
    if (BitField.has(17179869184n, false)) {
      Perms.push(lan.permissions.MANAGE_THREADS);
    }
    if (BitField.has(34359738368n, false)) {
      Perms.push(lan.permissions.USE_AND_CREATE_PUBLIC_THREADS);
    }
    if (BitField.has(68719476736n, false)) {
      Perms.push(lan.permissions.USE_AND_CREATE_PRIVATE_THREADS);
    }
    if (BitField.has(137438953472n, false)) {
      Perms.push(lan.permissions.USE_EXTERNAL_STICKERS);
    }
    if (BitField.has(274877906944n, false)) {
      Perms.push(lan.permissions.SEND_MESSAGES_IN_THREADS);
    }
    if (BitField.has(549755813888n, false)) {
      Perms.push(lan.permissions.START_EMBEDDED_ACTIVITIES);
    }
    if (BitField.has(1099511627776n, false)) {
      Perms.push(lan.permissions.MODERATE_MEMBERS);
    }

    return Perms;
  },
  /**
   * Converts a Discord Snowflake ID into the Unix Timestamp it was created at.
   * @constructor
   * @param {number} ID - The Snwoflake ID the Unix Timestamp will be created from.
   */
  getUnix: (ID) => {
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
  getDifference: (array1, array2) => array1.filter((i) => array2.indexOf(i) < 0),
  /**
   * Selects the Language for a Guild if it previously set a specific Language,
   * if not it selects English.
   * @constructor
   * @param {object} guild - The Guild the Language is Selected for.
   */
  languageSelector: async (guild) => {
    const guildid = guild?.id ? guild?.id : guild;
    if (guildid) {
      const resLan = await module.exports.query(
        'SELECT lan FROM guildsettings WHERE guildid = $1;',
        [guildid],
      );
      let lang = 'en';
      if (resLan && resLan.rowCount > 0) lang = resLan.rows[0].lan;
      return require(`../Languages/lan-${lang}.json`);
    }
    return require('../Languages/lan-en.json');
  },
  /**
   * Turns an Array of Strings into a .txt file and returns ints Path.
   * @constructor
   * @param {msg} object - A reference Message.
   * @param {array} array - The Array of Strings to convert.
   * @param {source} string - The Source of module.exports function
   *                          call for sorting in correct Folders.
   */
  txtFileWriter: (array, source) => {
    if (!array.length) return null;

    const now = Date.now();
    let content = '';
    const split = '\n';

    switch (source) {
      case 'antiraid': {
        array.forEach((element, i) => {
          content += `${element}${i % 3 === 2 ? split : ' '}`;
        });
        break;
      }
      default: {
        break;
      }
    }

    if (!content.length) {
      array.forEach((element) => {
        content += `${element}${split}`;
      });
    }

    const buffer = Buffer.from(content, 'utf-8');
    const attachment = { attachment: buffer, name: `${now}.txt` };

    return attachment;
  },
  /**
   * Tests if a String containts non-Latin Codepoints.
   * @constructor
   * @param {string} text - The String to Test.
   */
  containsNonLatinCodepoints: (text) => module.exports.regexes.emojiTester.test(text),
  /**
   * Checks and returns Uniques of 2 Bitfields.
   * @constructor
   * @param {object} bit1 - The first BitField.
   * @param {object} bit2 - The second BitField.
   */
  bitUniques: (bit1, bit2) => {
    const bit = new Discord.PermissionsBitField(bit1.bitfield & bit2.bitfield);
    const newBit1 = bit1.remove([...bit]);
    const newBit2 = bit2.remove([...bit]);
    return [newBit1, newBit2];
  },
  /**
   * Converts a String into a Discord Codeblock.
   * @constructor
   * @param {string} text - The Text to turn into a Codeblock.
   */
  makeCodeBlock: (text) => `\`\`\`${text}\`\`\``,
  /**
   * Converts a String into a Discord One-Line-Code.
   * @constructor
   * @param {string} text - The Text to turn into a One-Line-Code.
   */
  makeInlineCode: (text) => `\`${text}\``,
  /**
   * Converts a String to a Bold String.
   * @constructor
   * @param {string} text - The Text to turn Bold.
   */
  makeBold: (text) => `**${text}**`,
  /**
   * Converts a String to a underlined String.
   * @constructor
   * @param {string} text - The Text to turn Underlined.
   */
  makeUnderlined: (text) => `__${text}__`,
  /**
   * Awaits a reply of the Executor of a Moderation Command when the
   * Command is used on another Moderator.
   * @constructor
   * @param {object} msg - The triggering Message of module.exports Awaiter.
   */
  modRoleWaiter: async (msg) => {
    const SUCCESS = new Discord.UnsafeButtonComponent()
      .setCustomId('modProceedAction')
      .setLabel(msg.language.mod.warning.proceed)
      .setStyle(Discord.ButtonStyle.Primary)
      .setEmoji(Constants.emotes.tickBGID);
    const DANGER = new Discord.UnsafeButtonComponent()
      .setCustomId('modAbortAction')
      .setLabel(msg.language.mod.warning.abort)
      .setEmoji(Constants.emotes.crossBGID)
      .setStyle(Discord.ButtonStyle.Danger);
    const m = await module.exports.reply(msg, {
      content: msg.language.mod.warning.text,
      components: module.exports.buttonRower([SUCCESS, DANGER]),
      allowedMentions: { repliedUser: true },
    });
    const collector = m.createMessageComponentCollector({ time: 30000 });
    return new Promise((resolve) => {
      collector.on('collect', (answer) => {
        if (answer.user.id !== msg.author.id) module.exports.notYours(answer);
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
   * Sends an ephemeral Message to the triggering User,
   * telling them this Button/Select Menu was not meant for them.
   * @constructor
   * @param {object} interaction - The Interaction the triggering User sent.
   */
  notYours: async (interaction) => {
    let language;
    if (!language) language = await module.exports.languageSelector(interaction.guild);

    const embed = new Discord.UnsafeEmbed()
      .setAuthor({
        name: language.error,
        iconURL: Constants.standard.image,
        url: Constants.standard.invite,
      })
      .setColor(Constants.error)
      .setDescription(language.notYours);
    interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
  },
  /**
   * Edits a Message to display a "time has run out" Error.
   * @constructor
   * @param {object} msg - The Message module.exports Function replies to.
   */
  collectorEnd: (msg, m) => {
    const embed = new Discord.UnsafeEmbed()
      .setDescription(msg.language.timeError)
      .setColor(Constants.error);

    if (m) {
      m.edit({ embeds: [embed], components: [] }).catch(() => {});
    } else msg.m.edit({ embeds: [embed], components: [] }).catch(() => {});
    return embed;
  },
  /**
   * Converts Button Arrays into Action Rows usable by Discord.js.
   * Multiple Action Rows are separated by nested Arrays.
   * @constructor
   * @param {array} buttonArrays - The Buttons that will be put into the Action Rows.
   */
  buttonRower: (buttonArrays) => {
    const actionRows = [];
    buttonArrays.forEach((buttonRow) => {
      const row = new Discord.ActionRow();
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
   * Aborts a Collector.
   * @constructor
   * @param {object} msg - The Message that initiated module.exports.
   * @param {array} collectors - The Collectors to stop.
   */
  aborted: async (msg, collectors) => {
    collectors?.forEach((collector) => collector.stop());
    msg.m?.delete().catch(() => {});
    module.exports.reply(msg, { content: msg.language.aborted });
  },
  /**
   * Returns the Client Users Color to use in Embeds.
   * @constructor
   * @param {object} member - The Client User Member of module.exports Guild.
   */
  colorSelector: (member) =>
    member && member.displayColor !== 0
      ? member.displayColor
      : member.client.constants.standard.color,
  /**
   * Capitalizes the first Letter of a String.
   * @constructor
   * @param {string} string - The String of which to capitalize the first Letter.
   */
  CFL: (string) => string.charAt(0).toUpperCase() + string.slice(1),
  /**
   * Creates a sample Loading Embed.
   * @constructor
   * @param {object} lan - The Language which is to be used.
   * @param {object} guild - The Guild in which module.exports Command was called
   */
  loadingEmbed: async (lan, guild) => {
    const embed = new Discord.UnsafeEmbed()
      .setAuthor({
        name: lan.author,
        iconURL: guild.client.constants.emotes.loadingLink,
        url: guild.client.constants.standard.invite,
      })
      .setColor(module.exports.colorSelector(guild?.me))
      .setDescription(
        `${guild.client.constants.emotes.loading} ${
          lan.loading ? lan.loading : (await module.exports.languageSelector(guild)).loading
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
  arrayEquals: (arr1, arr2) => {
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
  objectClone: (obj) => v8.deserialize(v8.serialize(obj)),
  /**
   * Converts a File URL into a string if URL leads to a .txt File
   * @constructor
   * @param {string} url - The URL to convert
   */
  convertTxtFileLinkToString: async (url) => {
    if (!new URL(url).pathname.endsWith('.txt')) return null;

    const res = await SA.get(url).catch((e) => e);
    const buffer = res?.text;

    if (!buffer) return null;

    return buffer.toString('utf8');
  },
  /**
   * Returns a Guilds Invites mapped by invite Code
   * @constructor
   * @param {object} guild - The Guild to get invites from
   */
  getErisInvites: async (guild) => {
    const client = require('./DiscordClient');
    const invites = await client.eris.getGuildInvites(guild.id).catch(() => {});

    if (!invites) return null;

    const invitesMap = new Discord.Collection();
    invites.forEach((inv) => {
      const invite = {
        channel: client.channels.cache.get(inv.channel.id),
        channelId: inv.channel.id,
        code: inv.code,
        deletable: true,
        expiresAt: inv.maxAge ? new Date(inv.maxAge) : null,
        expiresTimestamp: inv.maxAge ? new Date(inv.maxAge).getTime() : null,
        guild,
        inviter: client.users.cache.get(inv.inviter?.id),
        inviterId: inv.inviter?.id,
        maxAge: inv.maxAge,
        maxUses: inv.maxUses,
        memberCount: inv.memberCount,
        presenceCount: inv.presenceCount,
        temporary: inv.temporary,
        url: `https://discord.gg/${inv.code}`,
        uses: inv.uses,
      };

      invitesMap.set(invite.code, invite);
    });

    if (guild.vanityURLCode) {
      const vanity = await guild.fetchVanityData();
      const language = module.exports.languageSelector(guild);

      invitesMap.set(vanity.code, {
        code: vanity.code,
        deletable: false,
        guild,
        inviter: { username: language.vanityUrl, tag: language.none, id: guild.id },
        memberCount: guild.memberCount,
        presenceCount: guild.approximatePresenceCount,
        url: `https://discord.gg/${vanity.code}`,
        uses: vanity.uses,
      });
    }

    return invitesMap;
  },
  /**
   * Returns a Guilds Bans mapped by ID of Ban Target
   * @constructor
   * @param {object} guild - The Guild to get invites from
   */
  getErisBans: async (guild) => {
    const client = require('./DiscordClient');
    const bans = await client.eris.getGuildBans(guild.id).catch(() => {});

    if (!bans) return null;

    const bansMap = new Discord.Collection();
    bans.forEach((b) => {
      const ban = {
        guild,
        user: client.users.cache.get(b.user.id),
        partial: false,
        reason: b.reason,
      };

      bansMap.set(b.user.id, ban);
    });

    return bansMap;
  },
  /**
   * Converts custom Embed Data into a Discord Embed
   * @constructor
   * @param {object} DBembed - The Embed Data from the Database
   */
  getDiscordEmbed: (DBembed) =>
    new Discord.Embed({
      color: Number(DBembed.color),
      title: DBembed.title,
      url: DBembed.url,
      author: {
        name: DBembed.authorname,
        icon_url: DBembed.authoriconurl,
        url: DBembed.authorurl,
      },
      description: DBembed.description,
      thumbnail: {
        url: DBembed.thumbnail,
      },
      fields:
        DBembed.fieldnames?.map((fieldName, i) => {
          const fieldValue = DBembed.fieldvalues[i];
          const fieldInline = DBembed.fieldinlines[i];
          return { name: fieldName, value: fieldValue, inline: fieldInline };
        }) || [],
      image: {
        url: DBembed.image,
      },
      timestamp: Number(DBembed.timestamp),
      footer: {
        text: DBembed.footertext,
        icon_url: DBembed.footericonurl,
      },
    }),
  /**
   * Makes the Embed Builder easily globally Available
   * @constructor
   * @param {object} msg - The Message that initiated this
   * @param {object} answer - An interaction if any
   * @param {array} options - Array of options with arg 1 being the option name and
   *                         arg 2 the language for the option name
   * @param {object} embed - An existing embed which can be edited
   * @param {number} page - An Page to instantly navigate to upon calling this
   */
  embedBuilder: (msg, answer, options, embed, page) => {
    options.push(msg.language.replaceOptions.msg);
    return msg.client.commands.get('embedbuilder').builder(msg, answer, embed, page, options);
  },
  /**
   * Converts a DB embed and its Dynamic Options to a Discord Embed
   * @constructor
   * @param {object} rawEmbed - The Embed to replace from
   * @param {array} options - Array of options with arg 1 being the
   *                          option accessor and arg 2 the option value
   */
  dynamicToEmbed: (rawEmbed, options) => {
    const embeds = [rawEmbed];

    const mod = module.exports.stp;

    options.forEach((option) => {
      const embedToUse = embeds[embeds.length - 1];
      const embed = new Discord.UnsafeEmbed();

      embed.color = embedToUse.color;
      embed.title = embedToUse.title ? mod(embedToUse.title, { [option[0]]: option[1] }) : null;
      embed.url = embedToUse.url ? mod(embedToUse.url, { [option[0]]: option[1] }) : null;

      if (embedToUse.author) {
        embed.author = {
          name: embedToUse.author.name
            ? mod(embedToUse.author.name, { [option[0]]: option[1] })
            : null,
          iconURL: embedToUse.author.iconURL
            ? mod(embedToUse.author.iconURL, { [option[0]]: option[1] })
            : null,
          url: embedToUse.author.url
            ? mod(embedToUse.author.url, { [option[0]]: option[1] })
            : null,
        };
      }

      embed.description = embedToUse.description
        ? mod(embedToUse.description, { [option[0]]: option[1] })
        : null;

      embed.thumbnail =
        embedToUse.thumbnail && embedToUse.thumbnail.url
          ? mod(embedToUse.thumbnail.url, { [option[0]]: option[1] })
          : null;

      embed.image =
        embedToUse.image && embedToUse.image.url
          ? mod(embedToUse.image.url, { [option[0]]: option[1] })
          : null;

      embed.timestamp = embedToUse.timestamp
        ? Number(mod(`${embedToUse.timestamp}`, { [option[0]]: option[1] }))
        : null;

      if (embedToUse.footer) {
        embed.footer = {
          name: embedToUse.footer.text
            ? mod(embedToUse.footer.text, { [option[0]]: option[1] })
            : null,
          iconURL: embedToUse.footer.iconURL
            ? mod(embedToUse.footer.iconURL, { [option[0]]: option[1] })
            : null,
        };
      }

      if (embedToUse.fields && embedToUse.fields.length) {
        embedToUse.fields.forEach(([name, value, inline]) => {
          embed.fields.push({
            name: name ? mod(name, { [option[0]]: option[1] }) : null,
            value: value ? mod(value, { [option[0]]: option[1] }) : null,
            inline,
          });
        });
      }

      embeds.push(embed);
    });

    return embeds.pop();
  },
  error: (msg, content, m) => {
    const embed = new Discord.UnsafeEmbed()
      .setAuthor({
        name: msg.language.error,
        iconURL: msg.client.constants.emotes.warningLink,
        url: msg.client.constants.standard.invite,
      })
      .setColor(msg.client.constants.error)
      .setDescription(content);

    if (
      [
        'PING',
        'APPLICATION_COMMAND',
        'MESSAGE_COMPONENT',
        'APPLICATION_COMMAND_AUTOCOMPLETE',
      ].includes(msg.type)
    ) {
      return msg.reply({ embeds: [embed], ephemeral: true });
    }

    if (m) return m.edit({ embeds: [embed] }).catch(() => {});
    return module.exports.reply(msg, { embeds: [embed] });
  },
  permError: (msg, bits, me) => {
    const [neededPerms] = module.exports.bitUniques(
      bits,
      me ? msg.guild.me.permissions : msg.member.permissions,
    );

    const embed = new Discord.UnsafeEmbed()
      .setAuthor({
        name: msg.language.error,
        iconURL: msg.client.constants.standard.errorImage,
        url: msg.client.constants.standard.invite,
      })
      .setColor(msg.client.constants.error)
      .setDescription(
        module.exports.makeUnderlined(
          me ? msg.language.permissions.error.msg : msg.language.permissions.error.you,
        ),
      )
      .addFields({
        name: module.exports.makeBold(msg.language.permissions.error.needed),
        value: `\u200b${
          neededPerms.has(8n)
            ? `${module.exports.makeInlineCode(msg.language.permissions.ADMINISTRATOR)}`
            : neededPerms
                .toArray()
                .map((p) => `${module.exports.makeInlineCode(msg.language.permissions[p])}`)
        }`,
        inline: false,
      });

    if (
      [
        'PING',
        'APPLICATION_COMMAND',
        'MESSAGE_COMPONENT',
        'APPLICATION_COMMAND_AUTOCOMPLETE',
      ].includes(msg.type)
    ) {
      return msg.reply({ embeds: [embed], ephemeral: true });
    }

    return module.exports.reply(msg, { embeds: [embed] });
  },
  disableComponents: async (msg, embed) => {
    msg.m.components.forEach((componentRow, i) => {
      componentRow.components.forEach((component, j) => {
        msg.m.components[i].components[j].disabled = true;
      });
    });

    await msg.m.edit({ embeds: [embed], components: msg.m.components });
  },
  Embed: require('./Other Client Files/CustomEmbed'),
};
