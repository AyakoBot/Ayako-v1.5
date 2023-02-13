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
    const guildid = '298954459172700181';

    let leaderboard = await Mee6LevelsApi.getLeaderboardPage(`${guildid}`, 1000, 0);
    leaderboard = leaderboard.concat(await Mee6LevelsApi.getLeaderboardPage(`${guildid}`, 1000, 1));
    leaderboard = leaderboard.concat(await Mee6LevelsApi.getLeaderboardPage(`${guildid}`, 1000, 2));

    leaderboard.forEach(async (user) => {
      msg.client.ch.query(
        `INSERT INTO level (guildid, userid, xp, level, type) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (userid, guildid, type) DO UPDATE SET xp = $3, level = $4;`,
        [guildid, user.id, user.xp.totalXp, user.level, 'guild'],
      );
    });
    msg.reply('Done');
  },
};
