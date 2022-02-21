/* eslint-disable prettier/prettier */
/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
const axios = require('axios');
const fs = require('fs');
const superagent = require('superagent');
const Discord = require('discord.js');
const jobs = require('node-schedule');
const ms = require('ms');

module.exports = {
  name: 'execute',
  aliases: ['e'],
  perm: 0n,
  dm: true,
  takesFirstArg: false,
  execute: async (msg) => {
    
    const job = jobs.scheduleJob('*/1 * * * * *', () => {
      console.log('something happened');
    });


    setTimeout(() => {
      job.cancel();

    }, 10000)
  },
};
