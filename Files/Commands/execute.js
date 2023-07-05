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
  execute: async (msg) => {},
};
