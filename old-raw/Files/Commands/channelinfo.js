const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const moment = require('moment');
require('moment-duration-format');
const axios = require('axios');
const auth = require('../BaseClient/auth.json');

module.exports = {
  name: 'channelinfo',
  perm: null,
  dm: true,
  takesFirstArg: false,
  aliases: ['chi', 'chinfo'],
  type: 'info',
  unfinished: true,
  execute: async (msg) => {
    const channel = msg.guild.channels.cache.get(
      msg.args[0] ? msg.args[0].replace(/\D+/g, '') : msg.channel.id,
    );

    const embed = new Builders.UnsafeEmbedBuilder();
    embed.setAuthor({
      name: msg.client.ch.stp(msg.lan.author, {
        channelType: msg.language.channelTypes[channel.type],
      }),
      url: msg.client.constants.standard.invite,
      iconUrl: msg.client.objectEmotes.channelTypes[channel.type].link,
    });

    if (channel.type === 0) return textChannel(msg, channel, embed);
    if (channel.type === 2) return voiceChannel(msg, channel, embed);
    if (channel.type === 4) return categoryChannel(msg, channel, embed);
    if (channel.type === 5) return newsChannel(msg, channel, embed);
    if (channel.type === 10 || channel.type === 11 || channel.type === 12) {
      return threadChannel(msg, channel, embed);
    }
    if (channel.type === 13) return stageChannel(msg, channel, embed);

    return msg.client.ch.error(msg, msg.lan.unknownChannelType);
  },
};

const categoryChannel = (msg, channel, embed) => {
  embed.setDescription(
    `${msg.client.textEmotes.channelTypes[channel.type]}**${
      channel.name
    }**\n${channel.children.cache
      .sort((a, b) => a.rawPosition - b.rawPosition)
      .map((c, i) => {
        console.log(i);

        return `${
          i + 1 === channel.children.cache.size
            ? msg.client.textEmotes.lastUnderCategory
            : msg.client.textEmotes.underCategory
        } ${msg.client.textEmotes.channelTypes[c.type]}${c.name}`;
      })
      .join('\n')}`,
  );

  console.log(channel.children.cache.size);

  msg.client.ch.reply(msg, { embeds: [embed] });
};

const newsChannel = (msg, channel, embed) => {};

const stageChannel = (msg, channel, embed) => {};

const textChannel = (msg, channel, embed) => {};

const threadChannel = (msg, channel, embed) => {};

const voiceChannel = (msg, channel, embed) => {};
