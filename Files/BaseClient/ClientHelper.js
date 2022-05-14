/* eslint-disable no-console */
const https = require('https');
const http = require('http');
const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const fs = require('fs');
const SA = require('superagent');
const jobs = require('node-schedule');
const clone = require('clone');

const auth = require('./auth.json');
const ChannelRules = require('./Other Client Files/Classes/ChannelRules');
const Constants = require('./Other Client Files/Constants.json');

const DiscordEpoch = 1420070400000;
const acceptedErrorCodes = ['50001', '50007', '10062'];

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
  send: async (channel, rawPayload, timeout) => {
    if (!channel) return null;

    if (Array.isArray(channel)) {
      return channel.map((c) => module.exports.send(c, rawPayload, timeout));
    }

    const payload = typeof rawPayload === 'string' ? { content: rawPayload } : rawPayload;

    if (
      !payload ||
      (!payload.embeds?.length &&
        !payload.content?.length &&
        !payload.files?.length &&
        !payload.components?.length)
    ) {
      throw new Error('No Payload');
    }

    if (timeout) {
      combineMessages({ channel }, payload, timeout);
      return null;
    }

    if (!payload) throw new Error('No Payload!');

    if (typeof channel.send !== 'function') throw new Error('Invalid Channel');

    return channel.send(payload).catch((e) => {
      if ([...acceptedErrorCodes, '50013'].some((code) => String(e).includes(code))) return null;

      if (String(e).includes('AbortError: The user aborted a request')) {
        return module.exports.send(payload);
      }

      console.log(
        e,
        payload.content,
        payload.embeds?.map((em) => em.data),
      );
      return null;
    });
  },
  /**
   * Replies to a Message.
   * @constructor
   * @param {object} msg - The Message the Reply will be replied to.
   * @param {object|string} rawPayload - The Payload or String sent
   */
  reply: async (msg, rawPayload, timeout) => {
    const payload = typeof rawPayload === 'string' ? { content: rawPayload } : rawPayload;

    if (typeof msg.reply !== 'function') {
      const response = await module.exports.send(msg.channel, payload, timeout);
      return response ? response[0] : null;
    }

    if (timeout) {
      combineMessages(msg, payload, timeout);
      return null;
    }

    if (!payload) throw new Error('No Payload!');

    const m = await msg.reply(payload).catch((e) => {
      if (acceptedErrorCodes.some((code) => String(e).includes(code))) return null;

      if (String(e).includes('10062')) {
        return module.exports.reply(msg.message, payload, timeout);
      }

      if (String(e).includes('50013')) {
        return module.exports.send(msg.author, {
          embeds: [
            new Builders.UnsafeEmbedBuilder()
              .setAuthor({
                name: msg.language.error,
                iconURL: msg.client.objectEmotes.warning.link,
                url: msg.client.constants.standard.invite,
              })
              .setColor(msg.client.constants.error)
              .setDescription(msg.language.errors.sendMessage),
          ],
        });
      }

      if (String(e).includes('AbortError: The user aborted a request')) {
        return module.exports.reply(msg, payload);
      }

      if (String(e).includes('50035') || String(e).includes('160002')) {
        return module.exports.send(msg.channel, payload, timeout);
      }

      console.log(
        e,
        payload.content,
        payload.embeds?.map((em) => em.data),
      );
      return null;
    });

    cooldownHandler(msg, m);
    deleteCommandHandler(msg, m);

    return m;
  },
  edit: async (msg, payload) => {
    if (!msg) return null;

    if (msg.message && msg.isRepliable() && !msg.replied) {
      return msg.update(payload).catch(() => module.exports.edit(msg.message, payload));
    }
    return msg.edit(payload).catch(() => module.exports.edit(msg.message, payload));
  },
  /**
   * STP (String Template Replacer)
   * Inserts Strings given via Object parameter into the expression parameter
   * Can access Object Children
   * Replace keys need to be named the same as their Object parameter
   * Replace keys need to be surrouned by {{ }}
   *
   * example:
   * stp("My Name is {{msg.client.user.username}}", { msg })
   *
   *
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
    if (log) console.error(type, log);
    else console.log(type);
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
      Flags.push(`${emotes ? client.textEmotes.userFlags.Boost1 : ''} ${lan.userFlags.Boost1}`);
    }
    if (BitField.has(2)) {
      Flags.push(`${emotes ? client.textEmotes.userFlags.Boost2 : ''} ${lan.userFlags.Boost2}`);
    }
    if (BitField.has(4)) {
      Flags.push(`${emotes ? client.textEmotes.userFlags.Boost3 : ''} ${lan.userFlags.Boost3}`);
    }
    if (BitField.has(8)) {
      Flags.push(`${emotes ? client.textEmotes.userFlags.Boost6 : ''} ${lan.userFlags.Boost6}`);
    }
    if (BitField.has(16)) {
      Flags.push(`${emotes ? client.textEmotes.userFlags.Boost9 : ''} ${lan.userFlags.Boost9}`);
    }
    if (BitField.has(32)) {
      Flags.push(`${emotes ? client.textEmotes.userFlags.Boost12 : ''} ${lan.userFlags.Boost12}`);
    }
    if (BitField.has(64)) {
      Flags.push(`${emotes ? client.textEmotes.userFlags.Boost15 : ''} ${lan.userFlags.Boost15}`);
    }
    if (BitField.has(128)) {
      Flags.push(`${emotes ? client.textEmotes.userFlags.Boost18 : ''} ${lan.userFlags.Boost18}`);
    }
    if (BitField.has(256)) {
      Flags.push(`${emotes ? client.textEmotes.userFlags.Boost24 : ''} ${lan.userFlags.Boost24}`);
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
        `${emotes ? client.textEmotes.userFlags.DiscordEmployee : ''} ${
          lan.userFlags.DiscordEmployee
        }`,
      );
    }
    if (BitField.has(2)) {
      Flags.push(
        `${emotes ? client.textEmotes.userFlags.PartneredServerOwner : ''} ${
          lan.userFlags.PartneredServerOwner
        }`,
      );
    }
    if (BitField.has(4)) {
      Flags.push(
        `${emotes ? client.textEmotes.userFlags.HypesquadEvents : ''} ${
          lan.userFlags.HypesquadEvents
        }`,
      );
    }
    if (BitField.has(8)) {
      Flags.push(
        `${emotes ? client.textEmotes.userFlags.BughunterLevel1 : ''} ${
          lan.userFlags.BughunterLevel1
        }`,
      );
    }
    if (BitField.has(64)) {
      Flags.push(
        `${emotes ? client.textEmotes.userFlags.HouseBravery : ''} ${lan.userFlags.HouseBravery}`,
      );
    }
    if (BitField.has(128)) {
      Flags.push(
        `${emotes ? client.textEmotes.userFlags.HouseBrilliance : ''} ${
          lan.userFlags.HouseBrilliance
        }`,
      );
    }
    if (BitField.has(256)) {
      Flags.push(
        `${emotes ? client.textEmotes.userFlags.HouseBalance : ''} ${lan.userFlags.HouseBalance}`,
      );
    }
    if (BitField.has(512)) {
      Flags.push(
        `${emotes ? client.textEmotes.userFlags.EarlySupporter : ''} ${
          lan.userFlags.EarlySupporter
        }`,
      );
    }
    if (BitField.has(1024)) {
      Flags.push(`${lan.userFlags.TeamUser}`);
    }
    if (BitField.has(2048)) {
      Flags.push(`${emotes ? client.textEmotes.userFlags.Bot : ''} ${lan.userFlags.Bot}`);
    }
    if (BitField.has(4096)) {
      Flags.push(`${emotes ? client.textEmotes.userFlags.Nitro : ''} ${lan.userFlags.Nitro}`);
    }
    if (BitField.has(16384)) {
      Flags.push(
        `${emotes ? client.textEmotes.userFlags.BughunterLevel2 : ''} ${
          lan.userFlags.BughunterLevel2
        }`,
      );
    }
    if (BitField.has(65536)) {
      Flags.push(
        `${emotes ? client.textEmotes.userFlags.VerifiedBot : ''} ${lan.userFlags.VerifiedBot}`,
      );
    }
    if (BitField.has(131072)) {
      Flags.push(
        `${emotes ? client.textEmotes.userFlags.EarlyVerifiedBotDeveloper : ''} ${
          lan.userFlags.EarlyVerifiedBotDeveloper
        }`,
      );
    }
    if (BitField.has(262144)) {
      Flags.push(
        `${emotes ? client.textEmotes.userFlags.DiscordCertifiedModerator : ''} ${
          lan.userFlags.DiscordCertifiedModerator
        }`,
      );
    }
    if (BitField.has(524288)) {
      Flags.push(`${lan.userFlags.BotHTTPInteractions}`);
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
    const BitField = new ChannelRules(bits);
    const Rules = [];

    if (BitField.has(1)) {
      Rules.push(lan.channelRules.HasLeastAttachments);
    }
    if (BitField.has(2)) {
      Rules.push(lan.channelRules.HasMostAttachments);
    }
    if (BitField.has(4)) {
      Rules.push(lan.channelRules.HasLeastCharacters);
    }
    if (BitField.has(8)) {
      Rules.push(lan.channelRules.HasMostCharacters);
    }
    if (BitField.has(16)) {
      Rules.push(lan.channelRules.HasLeastWords);
    }
    if (BitField.has(32)) {
      Rules.push(lan.channelRules.HasMostWords);
    }
    if (BitField.has(64)) {
      Rules.push(lan.channelRules.MentionsLeastUsers);
    }
    if (BitField.has(128)) {
      Rules.push(lan.channelRules.MentionsMostUsers);
    }
    if (BitField.has(256)) {
      Rules.push(lan.channelRules.MentionsLeastChannels);
    }
    if (BitField.has(512)) {
      Rules.push(lan.channelRules.MentionsMostChannels);
    }
    if (BitField.has(1024)) {
      Rules.push(lan.channelRules.MentionsLeastRoles);
    }
    if (BitField.has(2048)) {
      Rules.push(lan.channelRules.MentionsMostRoles);
    }
    if (BitField.has(4096)) {
      Rules.push(lan.channelRules.HasLeastLinks);
    }
    if (BitField.has(8192)) {
      Rules.push(lan.channelRules.HasMostLinks);
    }
    if (BitField.has(16384)) {
      Rules.push(lan.channelRules.HasLeastEmotes);
    }
    if (BitField.has(32768)) {
      Rules.push(lan.channelRules.HasMostEmotes);
    }
    if (BitField.has(65536)) {
      Rules.push(lan.channelRules.HasLeastMentions);
    }
    if (BitField.has(131072)) {
      Rules.push(lan.channelRules.HasMostMentions);
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
      Perms.push(lan.permissions.CreateInstantInvite);
    }
    if (BitField.has(2n, false)) {
      Perms.push(lan.permissions.KickMembers);
    }
    if (BitField.has(4n, false)) {
      Perms.push(lan.permissions.BanMembers);
    }
    if (BitField.has(8n, false)) {
      Perms.push(lan.permissions.Administrator);
    }
    if (BitField.has(16n, false)) {
      if (isntRole) {
        Perms.push(lan.permissions.ManageChannel);
      } else {
        Perms.push(lan.permissions.ManageChannels);
      }
    }
    if (BitField.has(32n, false)) {
      Perms.push(lan.permissions.ManageGuild);
    }
    if (BitField.has(64n, false)) {
      Perms.push(lan.permissions.AddReactions);
    }
    if (BitField.has(128n, false)) {
      Perms.push(lan.permissions.ViewAuditLog);
    }
    if (BitField.has(256n, false)) {
      Perms.push(lan.permissions.PrioritySpeaker);
    }
    if (BitField.has(512n, false)) {
      Perms.push(lan.permissions.Stream);
    }
    if (BitField.has(1024n, false)) {
      if (isntRole) {
        Perms.push(lan.permissions.ViewChannel);
      } else {
        Perms.push(lan.permissions.ViewChannels);
      }
    }
    if (BitField.has(2048n, false)) {
      Perms.push(lan.permissions.SendMessages);
    }
    if (BitField.has(4096n, false)) {
      Perms.push(lan.permissions.SendTTSMessages);
    }
    if (BitField.has(8192n, false)) {
      Perms.push(lan.permissions.ManageMessages);
    }
    if (BitField.has(16384n, false)) {
      Perms.push(lan.permissions.EmbedLinks);
    }
    if (BitField.has(32768n, false)) {
      Perms.push(lan.permissions.AttachFiles);
    }
    if (BitField.has(65536n, false)) {
      Perms.push(lan.permissions.ReadMessageHistory);
    }
    if (BitField.has(131072n, false)) {
      Perms.push(lan.permissions.MentionEveryone);
    }
    if (BitField.has(262144n, false)) {
      Perms.push(lan.permissions.UseExternalEmojis);
    }
    if (BitField.has(524288n, false)) {
      Perms.push(lan.permissions.ViewGuildInsights);
    }
    if (BitField.has(1048576n, false)) {
      Perms.push(lan.permissions.Connect);
    }
    if (BitField.has(2097152n, false)) {
      Perms.push(lan.permissions.Speak);
    }
    if (BitField.has(4194304n, false)) {
      Perms.push(lan.permissions.MuteMembers);
    }
    if (BitField.has(8388608n, false)) {
      Perms.push(lan.permissions.DeafenMembers);
    }
    if (BitField.has(16777216n, false)) {
      Perms.push(lan.permissions.MoveMembers);
    }
    if (BitField.has(33554432n, false)) {
      Perms.push(lan.permissions.UseVAD);
    }
    if (BitField.has(67108864n, false)) {
      Perms.push(lan.permissions.ChangeNickname);
    }
    if (BitField.has(134217728n, false)) {
      Perms.push(lan.permissions.ManageNicknames);
    }
    if (BitField.has(268435456n, false)) {
      if (isntRole) {
        Perms.push(lan.permissions.ManagePermissions);
      } else {
        Perms.push(lan.permissions.ManageRoles);
      }
    }
    if (BitField.has(536870912n, false)) {
      Perms.push(lan.permissions.ManageWebhooks);
    }
    if (BitField.has(1073741824n, false)) {
      Perms.push(lan.permissions.ManageEmojisAndStickers);
    }
    if (BitField.has(2147483648n, false)) {
      Perms.push(lan.permissions.UseApplicationCommands);
    }
    if (BitField.has(4294967296n, false)) {
      Perms.push(lan.permissions.RequestToSpeak);
    }
    if (BitField.has(8589934592n, false)) {
      Perms.push(lan.permissions.ManageEvents);
    }
    if (BitField.has(17179869184n, false)) {
      Perms.push(lan.permissions.ManageThreads);
    }
    if (BitField.has(34359738368n, false)) {
      Perms.push(lan.permissions.CreatePublicThreads);
    }
    if (BitField.has(68719476736n, false)) {
      Perms.push(lan.permissions.CreatePrivateThreads);
    }
    if (BitField.has(137438953472n, false)) {
      Perms.push(lan.permissions.UseExternalStickers);
    }
    if (BitField.has(274877906944n, false)) {
      Perms.push(lan.permissions.SendMessagesInThreads);
    }
    if (BitField.has(549755813888n, false)) {
      Perms.push(lan.permissions.StartEmbeddedActivities);
    }
    if (BitField.has(1099511627776n, false)) {
      Perms.push(lan.permissions.ModerateMembers);
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
    const newBit1 = new Discord.PermissionsBitField(bit1.bitfield).remove([...bit]);
    const newBit2 = new Discord.PermissionsBitField(bit2.bitfield).remove([...bit]);
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
    const buttons = [
      new Builders.UnsafeButtonBuilder()
        .setCustomId('proceed')
        .setLabel(msg.language.mod.warning.proceed)
        .setStyle(Discord.ButtonStyle.Danger)
        .setEmoji(msg.client.objectEmotes.warning),
      new Builders.UnsafeButtonBuilder()
        .setCustomId('abort')
        .setLabel(msg.language.mod.warning.abort)
        .setStyle(Discord.ButtonStyle.Secondary)
        .setEmoji(msg.client.objectEmotes.cross),
    ];

    const m = await module.exports.reply(msg, {
      content: msg.language.mod.warning.text,
      components: module.exports.buttonRower([buttons]),
      allowedMentions: { repliedUser: true },
    });
    const collector = m.createMessageComponentCollector({ time: 30000 });
    return new Promise((resolve) => {
      collector.on('collect', (answer) => {
        if (answer.user.id !== msg.author.id) module.exports.notYours(answer);
        else if (answer.customId === 'proceed') {
          m.delete().catch(() => {});
          resolve(true);
        } else if (answer.customId === 'abort') {
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

    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: language.error,
        iconURL: Constants.standard.image,
        url: Constants.standard.invite,
      })
      .setColor(Constants.error)
      .setDescription(language.notYours);
    module.exports.reply(interaction, { embeds: [embed], ephemeral: true });
  },
  /**
   * Edits a Message to display a "time has run out" Error.
   * @constructor
   * @param {object} msg - The Message module.exports Function replies to.
   */
  collectorEnd: (msg, m) => {
    const embed = new Builders.UnsafeEmbedBuilder()
      .setDescription(msg.language.timeError)
      .setColor(Constants.error);

    if (m) {
      module.exports.edit(m, { embeds: [embed], components: [] });
    } else module.exports.edit(msg.m, { embeds: [embed], components: [] });
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
      const row = new Builders.ActionRowBuilder();
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
    const client = require('./DiscordClient');

    return member && member.displayColor !== 0
      ? member.displayColor
      : client.constants.standard.color;
  },
  /**
   * Creates a sample Loading Embed.
   * @constructor
   * @param {object} lan - The Language which is to be used.
   * @param {object} guild - The Guild in which module.exports Command was called
   */
  loadingEmbed: async (lan, guild) => {
    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: lan.author,
        iconURL: guild.client.objectEmotes.loading.link,
        url: guild.client.constants.standard.invite,
      })
      .setColor(module.exports.colorSelector(guild?.me))
      .setDescription(
        `${guild.client.textEmotes.loading} ${
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
  objectClone: (obj) => clone(obj),
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
  getAllInvites: async (guild) => {
    const invites = await guild.invites.fetch().catch(() => {});

    if (!invites) return null;

    if (guild.vanityURLCode) {
      const vanity = await guild.fetchVanityData();
      const language = module.exports.languageSelector(guild);

      invites.set(vanity.code, {
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

    return invites;
  },
  /**
   * Converts custom Embed Data into a Discord Embed
   * @constructor
   * @param {object} DBembed - The Embed Data from the Database
   */
  getDiscordEmbed: (DBembed) =>
    new Builders.UnsafeEmbedBuilder({
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
  embedBuilder: (msg, answer, options, embed, page) =>
    msg.client.commands.get('embedbuilder').builder(msg, answer, embed, page, options),
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
      let embedToUse = embeds[embeds.length - 1];
      if (embedToUse.data) embedToUse = embedToUse.data;

      const embed = new Builders.UnsafeEmbedBuilder();

      embed.data.color = embedToUse.color;
      embed.data.title = embedToUse.title
        ? mod(embedToUse.title, { [option[0]]: option[1] })
        : null;
      embed.data.url = embedToUse.url ? mod(embedToUse.url, { [option[0]]: option[1] }) : null;

      if (embedToUse.author) {
        embed.data.author = {
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

      embed.data.description = embedToUse.description
        ? mod(embedToUse.description, { [option[0]]: option[1] })
        : null;

      embed.data.thumbnail =
        embedToUse.thumbnail && embedToUse.thumbnail.url
          ? mod(embedToUse.thumbnail.url, { [option[0]]: option[1] })
          : null;

      if (embedToUse.image && embedToUse.image.url) {
        embed.data.image = {
          url: mod(embedToUse.image.url, { [option[0]]: option[1] }),
        };
      }

      embed.data.timestamp = embedToUse.timestamp
        ? Number(mod(`${embedToUse.timestamp}`, { [option[0]]: option[1] }))
        : null;

      if (embedToUse.footer) {
        embed.data.footer = {
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
          embed.data.fields.push({
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
  error: (msg, content, m, timeout) => {
    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: msg.language.error,
        iconURL: msg.client.objectEmotes.warning.link,
        url: msg.client.constants.standard.invite,
      })
      .setColor(msg.client.constants.error)
      .setDescription(content);

    if (msg.isRepliable && msg.isRepliable()) {
      return module.exports.reply.reply(msg, { embeds: [embed], ephemeral: true });
    }

    if (m) return module.exports.edit(m, { embeds: [embed] });
    return module.exports.reply(msg, { embeds: [embed] }, timeout);
  },
  permError: (msg, bits, me) => {
    const [neededPerms] = module.exports.bitUniques(
      { bitfield: bits },
      me ? msg.guild.me.permissions : msg.member.permissions,
    );

    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: msg.language.error,
        iconURL: msg.client.constants.standard.errorImage,
        url: msg.client.constants.standard.invite,
      })
      .setColor(msg.client.constants.error)
      .setDescription(me ? msg.language.permissions.error.msg : msg.language.permissions.error.you)
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

    if (msg.isRepliable && msg.isRepliable()) {
      return module.exports.reply(msg, { embeds: [embed], ephemeral: true });
    }

    return module.exports.reply(msg, { embeds: [embed] });
  },
  disableComponents: async (m, embeds) => {
    await m.edit({
      embeds: embeds || m.embeds,
      components: module.exports.buttonRower(
        m.components.map((c, i) =>
          c.components.map((_, j) => {
            m.components[i].components[j].data.disabled = true;
            return m.components[i].components[j];
          }),
        ),
      ),
    });
  },
};

const getCooldown = async (msg) => {
  const res = await module.exports.query(
    `SELECT * FROM cooldowns WHERE guildid = $1 AND active = true AND command = $2;`,
    [msg.guild.id, msg.command.name],
  );

  if (res && res.rowCount) {
    res.rows[0].cooldown = Number(res.rows[0].cooldown) * 1000;
    return res.rows[0];
  }
  return { cooldown: 1000 };
};

const cooldownHandler = async (msg, m) => {
  if (msg.noCommand) return;
  if (!msg.command) return;
  if (!msg.cooldown || msg.cooldown < 2000) return;
  const res = await getCooldown(msg);
  if (
    !res.bpuserid?.includes(msg.author.id) &&
    !res.bpchannelid?.includes(msg.channel.id) &&
    !res.bproleid?.some((id) => msg.member.roles.cache.has(id)) &&
    (!res.activechannelid?.length || !res.activechannelid.includes(msg.channel.id))
  ) {
    let emote;
    if (msg.cooldown <= 60000) emote = msg.client.objectEmotes.timers[msg.cooldown / 1000];

    if (emote) {
      m.react(emote.id).catch(() => {});
    } else {
      jobs.scheduleJob(new Date(Date.now() + (msg.cooldown - 60000)), () => {
        m.react(msg.client.objectEmotes.timers[60].id).catch(() => {});
      });
    }

    jobs.scheduleJob(new Date(Date.now() + msg.cooldown), () => {
      const reaction = emote
        ? m.reactions.cache.get(emote.id)
        : m.reactions.cache.get(msg.client.objectEmotes.timers[60].id);

      if (reaction) reaction.remove().catch(() => {});
    });
  }
};

const deleteCommandHandler = async (msg, m) => {
  if (!msg.command || !msg.guild || !m) return;
  const deleteRows = await getDeleteRes(msg);

  deleteRows.forEach((row) => {
    if (!row.commands?.includes(msg.command.name)) return;
    if (!row.deletetimeout || Number(row.deletetimeout) === 0) return;

    jobs.scheduleJob(new Date(Date.now() + row.deletetimeout * 1000), () => {
      if (row.deletecommand) {
        msg.delete().catch(() => {});
      }
      if (m.embeds.length > 1) {
        return;
      }
      if (row.deletereply) {
        m.delete().catch(() => {});
      }
    });
  });
};

const getDeleteRes = async (msg) => {
  const res = await module.exports.query(
    `SELECT * FROM deletecommands WHERE guildid = $1 AND active = true;`,
    [msg.guild.id],
  );

  if (res && res.rowCount) return res.rows;
  return [];
};

// msg might not be a real message but "{ channel }" instead
const combineMessages = async (msg, payload, timeout) => {
  if (!msg.client) msg.client = require('./DiscordClient');

  if (!payload.embeds || !payload.embeds.length || !payload.files || !payload.files.length) {
    module.exports.send(msg.channel, payload);
    return;
  }

  if (msg.client.channelQueue.has(msg.channel.id)) {
    const updatedQueue = msg.client.channelQueue.get(msg.channel.id);
    const charsToPush = getEmbedCharLens(payload.embeds);

    if (
      updatedQueue.length < 10 &&
      msg.client.channelCharLimit.get(msg.channel.id) + charsToPush <= 5000
    ) {
      updatedQueue.push(payload);
      msg.client.channelCharLimit.set(
        msg.channel.id,
        msg.client.channelCharLimit.get(msg.channel.id) + charsToPush,
      );
      msg.client.channelQueue.set(msg.channel.id, updatedQueue);

      msg.client.channelTimeout.get(msg.channel.id)?.cancel();

      queueSend(msg, timeout);
    } else if (
      updatedQueue.length === 10 ||
      msg.client.channelCharLimit.get(msg.channel.id) + charsToPush >= 5000
    ) {
      module.exports.send(msg.channel, { embeds: updatedQueue.map((p) => p.embeds).flat(1) });
      msg.client.channelQueue.set(msg.channel.id, [payload]);

      msg.client.channelTimeout.get(msg.channel.id)?.cancel();

      msg.client.channelCharLimit.set(msg.channel.id, getEmbedCharLens(payload.embeds));
      queueSend(msg, timeout);
    }
  } else {
    msg.client.channelQueue.set(msg.channel.id, [payload]);
    msg.client.channelCharLimit.set(msg.channel.id, getEmbedCharLens(payload.embeds));

    msg.client.channelTimeout.get(msg.channel.id)?.cancel();

    queueSend(msg, timeout);
  }
};

const getEmbedCharLens = (embeds) => {
  let total = 0;
  embeds.forEach((embed) => {
    Object.values(embed.data).forEach((data) => {
      if (typeof data === 'string') {
        total += data.length;
      }
    });

    for (let i = 0; i < (embed.data.fields ? embed.data.fields.length : 0); i += 1) {
      if (typeof embed.data.fields[i].name === 'string') {
        total += embed.data.fields[i].name.length;
      }
      if (typeof embed.data.fields[i].value === 'string') {
        total += embed.data.fields[i].value.length;
      }
    }
  });
  return total > 6000 ? 1000 : total;
};

const queueSend = (msg, timeout) => {
  msg.client.channelTimeout.set(
    msg.channel.id,
    jobs.scheduleJob(new Date(Date.now() + timeout), () => {
      module.exports.send(msg.channel, {
        embeds: msg.client.channelQueue
          .get(msg.channel.id)
          ?.map((p) => p.embeds)
          ?.flat(1)
          .filter((p) => !!p),
        files: msg.client.channelQueue
          .get(msg.channel.id)
          ?.map((p) => p.files)
          ?.flat(1)
          .filter((p) => !!p),
      });

      msg.client.channelQueue.delete(msg.channel.id);
      msg.client.channelTimeout.delete(msg.channel.id);
      msg.client.channelCharLimit.delete(msg.channel.id);
    }),
  );
};
