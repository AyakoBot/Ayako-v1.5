const Builders = require('@discordjs/builders');

module.exports = {
  async execute(guild) {
    if (['936932672561872896', '814476583347814430', '980345575012704286', '1004919883387121664', '814476583347814430'].includes(guild.id)) return;

    const { client } = guild;
    const { ch } = client;
    const Constants = client.constants;
    const con = Constants.guildDelete;
    const logEmbed = new Builders.UnsafeEmbedBuilder()
      .setDescription(con.logEmbed.joinedAGuild)
      .addFields({ name: con.logEmbed.guildName, value: `${guild.name}`, inline: true })
      .addFields({ name: con.logEmbed.guildId, value: `${guild.id}`, inline: true })
      .addFields({ name: con.logEmbed.memberCount, value: `${guild.memberCount}`, inline: true })
      .addFields({ name: con.logEmbed.guildOwner, value: `${guild.ownerId}`, inline: true })
      .setFooter({ text: ch.stp(con.logEmbed.currentGuildCount, { client }) })
      .setColor(con.logEmbed.color);
    ch.send(
      client.channels.cache.get(Constants.standard.guildLogChannel),
      { embeds: [logEmbed] },
      5000,
    );
  },
};
