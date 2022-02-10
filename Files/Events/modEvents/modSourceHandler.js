const Discord = require('discord.js');

module.exports = {
  async execute(msg, embed) {
    let minimizeTimeout = 0;
    let deleteTimeout = 0;

    switch (msg.source) {
      default: {
        break;
      }
      case 'antivirus': {
        minimizeTimeout = Number(msg.r.minimize);
        deleteTimeout = Number(msg.r.delete);

        if (deleteTimeout <= minimizeTimeout) {
          setTimeout(() => msg.m.delete().catch(() => {}), deleteTimeout);
        } else {
          embed = new Discord.MessageEmbed(embed).setDescription(embed.fields[0].value);
          embed.fields = [];

          setTimeout(() => msg.m.edit({ embeds: [embed] }).catch(() => {}), minimizeTimeout);
          setTimeout(() => msg.m.delete().catch(() => {}), deleteTimeout);
        }

        break;
      }
    }
  },
};
