const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

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
      ...msg.lan.methods.map((method, i) => ({
        name: method,
        value: msg.client.contsants.commands.synclevel.methods[i],
      })),
    );
};

/*
  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: msg.lan.author,
      iconURL: msg.client.objectEmotes.settings.link,
      url: msg.client.constants.standard.invite,
    })
    */
