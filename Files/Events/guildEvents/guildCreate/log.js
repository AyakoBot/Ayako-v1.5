const Discord = require('discord.js');

module.exports = {
  async execute(guild) {
    const { client } = guild;
    const { ch } = client;
    const Constants = client.constants;
    const con = Constants.guildCreate;
    const logEmbed = new Discord.MessageEmbed()
      .setDescription(con.logEmbed.joinedAGuild)
      .addField(con.logEmbed.guildName, `\u200b${guild.name}`, true)
      .addField(con.logEmbed.guildId, `\u200b${guild.id}`, true)
      .addField(con.logEmbed.memberCount, `\u200b${guild.memberCount}`, true)
      .addField(con.logEmbed.guildOwner, `\u200b${guild.ownerID}`, true)
      .setFooter({ text: ch.stp(con.logEmbed.currentGuildCount, { client }) })
      .setColor(con.logEmbed.color);
    ch.send(client.channels.cache.get(Constants.standard.guildLogChannel), { embeds: [logEmbed] });
  },
};
