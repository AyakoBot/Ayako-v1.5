const Discord = require('discord.js');

module.exports = {
  name: 'stp',
  perm: null,
  dm: true,
  takesFirstArg: true,
  aliases: [],
  type: 'debugging',
  async execute(msg) {
    const returned = msg.client.ch.stp(msg.args.join(' '), { msg });

    msg.channel.send({ embeds: [new Discord.MessageEmbed().setDescription(returned)] });
  },
};
