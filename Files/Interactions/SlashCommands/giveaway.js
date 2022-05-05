const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  name: 'giveaway',
  perm: 32n,
  dm: false,
  type: 'giveaway',
  execute: async (cmd) => {
    console.log(cmd);
  },
};
