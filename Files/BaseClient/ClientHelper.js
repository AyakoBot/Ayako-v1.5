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

// const { dirname } = require('path');
// const appDir = dirname(require.main.filename);
const DiscordEpoch = 1420070400000;

module.exports = {
  /**
   * Various regexes
   * If using emojiTester regex with match(), !!filter output by length!!, as output can include 0 char strings
   */
  regexes: {
    templateMatcher: /{{\s?([^{}\s]*)\s?}}/g,
    emojiTester: require('./Other Client Files/EmojiRegex'),
  },
  /**
   * Sends a Message to a channel.
   * @constructor
   * @param {object} channel - The Channel the Messages will be sent in (supports Array of Channels).
   * @param {object|string} rawPayload - The Payload or String sent
   */
  send: async (channel, rawPayload) => {
    if (!channel) return null;

    const payload =
      typeof rawPayload === 'string' ? { failIfNotExists: false, content: rawPayload } : rawPayload;

    if (channel.type === 'DM') {
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
   * Places Objects or Strings of the Objects Option into the Expressions option, replacing same named variables marked by "{{variable Name}}".
   * @constructor
   * @param {string} expression - The String following Strings/Objects will be put into.
   * @param {object} Object - The Object containing all Strings/Objects that will be put into the expression.
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
        if (`${text}`.replace(/\D+/g, '') === text && Number.MAX_SAFE_INTEGER > parseInt(text, 10))
          text = Number(text);
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
    const res = await pool.query(query, arr).catch((err) => {
      console.log(query, arr);
      module.exports.logger('Pool Query Error', err);
    });
    if (res) return res;
    return null;
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
          if (log.stack)
            channel.send(`${type}${module.exports.makeCodeBlock(log.stack)}`).catch(() => {});
          else channel.send(`${type}${module.exports.makeCodeBlock(log)}`).catch(() => {});
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
  permCalc: (bits, lan) => {
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
  getDifference: (array1, array2) => {
    return array1.filter((i) => array2.indexOf(i) < 0);
  },
  /**
   * Extracts a Dynamic Avatar URL from a Discord User.
   * @constructor
   * @param {object} rawUser - The User Object the Avatar URL is extracted from.
   */
  displayAvatarURL: (rawUser) => {
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
  iconURL: (guild) => {
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
  bannerURL: (guild) => {
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
  splashURL: (guild) => {
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
  discoverySplashURL: (guild) => {
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
  avatarURL: (webhook) => {
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
   * @param {source} string - The Source of module.exports function call for sorting in correct Folders.
   */
  txtFileWriter: (array, source) => {
    if (!array.length) return null;

    const now = Date.now();
    let content = '';
    const split = '\n';

    switch (source) {
      default: {
        break;
      }
      case 'antiraid': {
        array.forEach((element, i) => {
          content += `${element}${i % 3 === 2 ? split : ' '}`;
        });
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
  containsNonLatinCodepoints: (text) => {
    return module.exports.regexes.emojiTester.test(text);
  },
  /**
   * Checks and returns Uniques of 2 Bitfields.
   * @constructor
   * @param {object} bit1 - The first BitField.
   * @param {object} bit2 - The second BitField.
   */
  bitUniques: (bit1, bit2) => {
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
  makeCodeBlock: (text) => {
    return `\`\`\`${text}\`\`\``;
  },
  /**
   * Converts a String into a Discord One-Line-Code.
   * @constructor
   * @param {string} text - The Text to turn into a One-Line-Code.
   */
  makeInlineCode: (text) => {
    return `\`${text}\``;
  },
  /**
   * Converts a String to a Bold String.
   * @constructor
   * @param {string} text - The Text to turn Bold.
   */
  makeBold: (text) => {
    return `**${text}**`;
  },
  /**
   * Converts a String to a underlined String.
   * @constructor
   * @param {string} text - The Text to turn Underlined.
   */
  makeUnderlined: (text) => {
    return `__${text}__`;
  },
  /**
   * Awaits a reply of the Executor of a Moderation Command when the Command is used on another Moderator.
   * @constructor
   * @param {object} msg - The triggering Message of module.exports Awaiter.
   */
  modRoleWaiter: async (msg) => {
    const SUCCESS = new Discord.MessageButton()
      .setCustomId('modProceedAction')
      .setLabel(msg.language.mod.warning.proceed)
      .setStyle('SUCCESS')
      .setEmoji(Constants.emotes.tickBGID);
    const DANGER = new Discord.MessageButton()
      .setCustomId('modAbortAction')
      .setLabel(msg.language.mod.warning.abort)
      .setEmoji(Constants.emotes.crossBGID)
      .setStyle('DANGER');
    const m = await module.exports.reply(msg, {
      content: msg.language.mod.warning.text,
      components: module.exports.buttonRower([SUCCESS, DANGER]),
      allowedMentions: { repliedUser: true },
    });
    const collector = m.createMessageComponentCollector({ time: 30000 });
    return new Promise((resolve) => {
      collector.on('collect', (answer) => {
        if (answer.user.id !== msg.author.id) module.exports.notYours(answer, msg);
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
   * Sends an ephemeral Message to the triggering User, telling them module.exports Button/Select Menu was not meant for them.
   * @constructor
   * @param {object} interaction - The Interaction the triggering User sent.
   * @param {object} msg - The Message module.exports Button/Select Menu triggered.
   */
  notYours: (interaction, msg) => {
    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.language.error,
        iconURL: Constants.standard.image,
        url: Constants.standard.invite,
      })
      .setColor(Constants.error)
      .setDescription(msg.language.notYours);
    interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
  },
  /**
   * Edits a Message to display a "time has run out" Error.
   * @constructor
   * @param {object} msg - The Message module.exports Function replies to.
   */
  collectorEnd: (msg) => {
    const embed = new Discord.MessageEmbed()
      .setDescription(msg.language.timeError)
      .setColor(Constants.error);
    msg.m.edit({ embeds: [embed], components: [] }).catch(() => {});
    return embed;
  },
  /**
   * Converts Button Arrays into Action Rows usable by Discord.js. Multiple Action Rows are separated by nested Arrays.
   * @constructor
   * @param {array} buttonArrays - The Buttons that will be put into the Action Rows.
   */
  buttonRower: (buttonArrays) => {
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
  colorSelector: (member) => {
    return member && member.displayHexColor !== 0 ? member.displayHexColor : 'b0ff00';
  },
  /**
   * Capitalizes the first Letter of a String.
   * @constructor
   * @param {string} string - The String of which to capitalize the first Letter.
   */
  CFL: (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  /**
   * Creates a sample Loading Embed.
   * @constructor
   * @param {object} lan - The Language which is to be used.
   * @param {object} guild - The Guild in which module.exports Command was called
   */
  loadingEmbed: async (lan, guild) => {
    const embed = new Discord.MessageEmbed()
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
  objectClone: (obj) => {
    return v8.deserialize(v8.serialize(obj));
  },
  /**
   * Converts a File URL into a string if URL leads to a .txt File
   * @constructor
   * @param {string} url - The URL to convert
   */
  convertTxtFileLinkToString: async (url) => {
    if (!URL(url).pathname.endsWith('.txt')) return null;

    const res = await SA.get(url).catch((e) => e);
    const buffer = res?.body;

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
        inviter: client.users.cache.get(inv.inviter.id),
        inviterId: inv.inviter.id,
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
      const language = await module.exports.languageSelector(guild);

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
  getDiscordEmbed: (DBembed) => {
    return new Discord.MessageEmbed({
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
    });
  },
  /**
   * Makes the Embed Builder easily globally Available
   * @constructor
   * @param {object} msg - The Message that initiated this
   * @param {object} answer - An interaction if any
   * @param {array} options - Array of options with arg 1 being the option name and arg 2 the language for the option name
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
   * @param {object} embed - The Embed to replace from
   * @param {array} options - Array of options with arg 1 being the option accessor and arg 2 the option value
   */
  dynamicToEmbed: (rawEmbed, options) => {
    const embed = new Discord.MessageEmbed();
    const mod = module.exports.stp;

    options.forEach((option) => {
      embed.color = rawEmbed.color ? mod(rawEmbed.color, { [option[0]]: option[1] }) : null;
      embed.title = rawEmbed.title ? mod(rawEmbed.title, { [option[0]]: option[1] }) : null;
      embed.url = rawEmbed.url ? mod(rawEmbed.url, { [option[0]]: option[1] }) : null;

      if (rawEmbed.author) {
        embed.author = {
          name: rawEmbed.author.name ? mod(rawEmbed.author.name, { [option[0]]: option[1] }) : null,
          iconURL: rawEmbed.author.iconURL
            ? mod(rawEmbed.author.iconURL, { [option[0]]: option[1] })
            : null,
          url: rawEmbed.author.url ? mod(rawEmbed.author.url, { [option[0]]: option[1] }) : null,
        };
      }

      embed.description = rawEmbed.description
        ? mod(rawEmbed.description, { [option[0]]: option[1] })
        : null;
      console.log(embed.description, rawEmbed.description);

      embed.thumbnail =
        rawEmbed.thumbnail && rawEmbed.thumbnail.url
          ? mod(rawEmbed.thumbnail.url, { [option[0]]: option[1] })
          : null;

      embed.image =
        rawEmbed.image && rawEmbed.image.url
          ? mod(rawEmbed.image.url, { [option[0]]: option[1] })
          : null;

      embed.timestamp = rawEmbed.timestamp
        ? Number(mod(`${rawEmbed.timestamp}`, { [option[0]]: option[1] }))
        : null;

      if (rawEmbed.footer) {
        embed.footer = {
          name: rawEmbed.footer.text ? mod(rawEmbed.footer.text, { [option[0]]: option[1] }) : null,
          iconURL: rawEmbed.footer.iconURL
            ? mod(rawEmbed.footer.iconURL, { [option[0]]: option[1] })
            : null,
        };
      }

      if (rawEmbed.fields && rawEmbed.fields.length) {
        rawEmbed.fields.forEach(([name, value, inline]) => {
          embed.fields.push({
            name: name ? mod(name, { [option[0]]: option[1] }) : null,
            value: value ? mod(value, { [option[0]]: option[1] }) : null,
            inline,
          });
        });
      }
    });

    return embed;
  },
};
