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

/*
    const command = new Builders.SlashCommandBuilder()
      .addChannelOption(
        new Builders.SlashCommandChannelOption()
          .addChannelTypes(...[0, 5])
          .setDescription('The Channel to start the Giveaway in')
          .setName('channel')
          .setRequired(true),
      )
      .addIntegerOption(
        new Builders.SlashCommandIntegerOption()
          .setDescription('The Amount of Winners this Giveaway has')
          .setMaxValue(9999999)
          .setMinValue(1)
          .setName('winners')
          .setRequired(true),
      )
      .addRoleOption(
        new Builders.SlashCommandRoleOption()
          .setDescription('Role required to participate in this Giveaway')
          .setName('role')
          .setRequired(false),
      )
      .addStringOption(
        new Builders.SlashCommandStringOption()
          .setDescription('A Description of the Prize the Winners will win')
          .setName('prize-description')
          .setRequired(true),
      )
      .addStringOption(
        new Builders.SlashCommandStringOption()
          .setDescription(
            'The actual Prize (If given, the Prize will be sent to winners automatically)',
          )
          .setName('actual-prize')
          .setRequired(false),
      )
      .addStringOption(
        new Builders.SlashCommandStringOption()
          .setDescription('The Time after which the Winner will be chosen')
          .setName('time')
          .setRequired(true),
      )
      .setDefaultPermission(true)
      .setDescription('Create a Giveaway')
      .setName('giveaway')
      .toJSON();
    console.log(JSON.stringify(command, null, 2));
    */
