/* eslint-disable prettier/prettier */
/* eslint-disable no-empty-function */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable no-lone-blocks */
/* eslint-disable no-unused-vars */
const axios = require('axios');
const fs = require('fs');
const superagent = require('superagent');
const Discord = require('discord.js');
const jobs = require('node-schedule');
const ms = require('ms');
const Builders = require('@discordjs/builders');
const Mee6LevelsApi = require('mee6-levels-api');

module.exports = {
  name: 'execute',
  aliases: ['e'],
  perm: 0,
  dm: true,
  takesFirstArg: false,
  type: 'owner',
  execute: async (msg) => {
    const m = await msg.client.channels.cache
      .get('1090288389296758954')
      .messages.fetch('1090290819421966397');

    const e = new Discord.EmbedBuilder()
      .setTitle('$100 Giftcard Giveaway')
      .setDescription(
        `How to enter:\n` +
          `1. Download my sponsor [World of Warships](https://wo.ws/3lsBHyH)\n` +
          `2. Once inside the game, take a **screenshot on the Main Menu __with your Username and Ship visible__**\n` +
          `3. Send the screenshot in this channel\n` +
          `4. Done! **Once approved by one of our mods** you will be entered into the Giveaway\n`,
      )
      .addFields({
        name: `Notice!`,
        value:
          `- Only 50 Spots available for this Giveaway, so enter fast!\n` +
          `- Winner can pick any $100 online Giftcard of their choice or ingame currency\n` +
          `- Giveaway unfortunately is PC only`,
      })
      .setColor(16777215)
      .setImage(
        'https://cdn.discordapp.com/attachments/768559225538084874/1090291737035034734/giftcardddd.jpg',
      )
      .setThumbnail(
        'https://1000logos.net/wp-content/uploads/2020/09/World-of-Warships-emblem-500x315.jpg',
      )
      .setFooter({ text: 'Giveaway end: 28th April' });

    m.edit({ embeds: [e], content: 'https://wo.ws/3lsBHyH' }).catch(() => {});
  },
};
