const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  name: 'test',
  perm: null,
  dm: false,
  takesFirstArg: false,
  category: 'Owner',
  description: 'Debug Purposes',
  aliases: [],
  type: 'owner',
  execute: async (cmd) => {
    console.log(cmd);
  },
};
