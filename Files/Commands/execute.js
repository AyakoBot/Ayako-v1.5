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

module.exports = {
  name: 'execute',
  aliases: ['e'],
  perm: 0n,
  dm: true,
  takesFirstArg: false,
  execute: async (msg) => {
    if (msg.author.id !== '318453143476371456') return;
    msg.client.channels.cache.get('827302309368561715').send({
      content: `This is a Channel about Support for <@650691698409734151>\n**Do not send Messages here if you don't need help with Ayako**\nThis is not a general Support Channel`,
    });
  },
};
