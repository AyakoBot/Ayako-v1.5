const Discord = require('discord.js');

module.exports = {
  async execute(command) {
    const { client } = command;
    const { guild } = command;
    const { ch } = client;
    const Constants = client.constants;
    const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
    if (res && res.rowCount > 0) {
      const channels = res.rows[0].applicationevents
        ?.map((id) =>
          typeof client.channels.cache.get(id)?.send === 'function'
            ? client.channels.cache.get(id)
            : null,
        )
        .filter((c) => c !== null);
      if (channels && channels.length) {
        const language = await ch.languageSelector(guild);
        const lan = language.commandDelete;
        const con = Constants.commandDelete;
        const embed = new Discord.MessageEmbed()
          .setTimestamp()
          .setAuthor({
            name: lan.author.name,
            iconURL: con.author.image,
          })
          .setColor(con.color)
          .setDescription(ch.stp(lan.description, { command }))
          .addField(
            language.defaultPermission,
            command.defaultPermission ? lan.isDefault : lan.isNotDefault,
          );
        if (command.name)
          embed.addField(language.name, Discord.Util.escapeInlineCode(command.name));
        if (command.description)
          embed.addField(
            language.description,
            Discord.Util.cleanCodeBlockContent(command.desciption),
          );
        ch.send(channels, { embeds: [embed] });
      }
    }
  },
};
