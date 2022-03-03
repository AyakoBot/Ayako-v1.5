const Discord = require('discord.js');

module.exports = {
  async execute(guild) {
    const { client } = guild;
    const { ch } = client;
    const Constants = client.constants;
    const con = Constants.guildDelete;
    const logEmbed = new Discord.UnsafeEmbed()
      .setDescription(con.logEmbed.joinedAGuild)
      .addFields({ name: con.logEmbed.guildName, value: `${guild.name}`, inline: true })
      .addFields({ name: con.logEmbed.guildId, value: `${guild.id}`, inline: true })
      .addFields({ name: con.logEmbed.memberCount, value: `${guild.memberCount}`, inline: true })
      .addFields({ name: con.logEmbed.guildOwner, value: `${guild.ownerID}`, inline: true })
      .setFooter({ text: ch.stp(con.logEmbed.currentGuildCount, { client }) })
      .setColor(con.logEmbed.color);
    ch.send(client.channels.cache.get(Constants.standard.guildLogChannel), { embeds: [logEmbed] });
  },
};
