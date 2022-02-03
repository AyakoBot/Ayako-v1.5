/* eslint-disable prettier/prettier */
/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
const axios = require('axios');
const fs = require('fs');
const superagent = require('superagent');
const Discord = require('discord.js');

module.exports = {
  name: 'execute',
  aliases: ['e'],
  perm: 0n,
  dm: true,
  takesFirstArg: false,
  async execute(msg) {
    const options = [['msg', 'Message and every Child of the Message Option']];

    const { embed, answer } = await msg.client.ch.embedBuilder(msg, null, options, null, 4);
    const fin = msg.client.ch.dynamicToEmbed(embed, [
      ['msg', new Discord.Message(msg.client, msg)],
    ]);
    answer.update({ embeds: [fin] });
  },
};
