const Discord = require('discord.js');

module.exports = {
  name: 'amiin',
  perm: null,
  dm: false,
  takesFirstArg: true,
  category: null,
  description: 'Check if you are in the latest WiLLiS Giveaway',
  usage: ['amiin'],
  thisGuildOnly: ['108176345204264960'],
  async execute(msg) {
    if (msg.channel.id === '805839305377447936') return;
    const id = msg.args[0] ? msg.args[0] : msg.author.id;
    const embed = new Discord.MessageEmbed();
    const res = await msg.client.ch.query('SELECT * FROM stats;');
    if (res.rows[0].willis == null) {
      embed
        .setDescription(
          `${msg.client.constants.emotes.tick} You are NOT participating!\nGo to <#805839305377447936> and follow the instructions to enter`,
        )
        .setColor('YELLOW');
      msg.channel.send(embed);
    } else if (res.rows[0].willis.includes(id)) {
      embed
        .setDescription(`${msg.client.constants.emotes.tick} You are participating! Good Luck!`)
        .setColor('GREEN');
      msg.channel.send(embed);
    } else {
      embed
        .setDescription(
          `${msg.client.constants.emotes.tick} You are NOT participating!\nGo to <#805839305377447936> and follow the instructions to enter`,
        )
        .setColor('RED');
      msg.channel.send(embed);
    }
  },
};
