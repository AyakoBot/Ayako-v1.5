const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  name: 'giveaway',
  perm: 32n,
  dm: false,
  type: 'giveaway',
  execute: async (cmd) => {
    switch (cmd.options._subcommand) {
      case 'create': {
        require('./giveaway/create')(cmd);
        break;
      }
      case 'edit': {
        require('./giveaway/edit')(cmd);
        break;
      }
      case 'list': {
        require('./giveaway/list')(cmd);
        break;
      }
      case 'end': {
        require('./giveaway/end')(cmd);
        break;
      }
      default: {
        break;
      }
    }
  },
};
