const Discord = require('discord.js');

module.exports = {
  name: 'synclevel',
  perm: 32n,
  dm: false,
  takesFirstArg: false,
  aliases: ['synclevels'],
  type: 'leveling',
  async execute(msg) {
    const method = getMethod(msg);
  },
};

const getMethod = (msg) => {
  const methodMenu = new Discord.SelectMenuInteraction()
    .setLabel(msg.lan.method)
    .setCustomId('methods')
    .setOptions(
      msg.lan.methods.map((method, i) => ({
        name: method,
        value: msg.client.contsants.commands.synclevel.methods[i],
      })),
    );
};

/*
  const embed = new Discord.MessageEmbed()
    .setAuthor({
      name: msg.lan.author,
      iconURL: msg.client.constants.emotes.settingsLink,
      url: msg.client.constants.standard.invite,
    })
    */
