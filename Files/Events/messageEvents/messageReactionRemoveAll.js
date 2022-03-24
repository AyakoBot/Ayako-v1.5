const Builders = require('@discordjs/builders');

module.exports = {
  async execute(msg) {
    const { client } = msg;
    const { guild } = msg;
    const { ch } = client;
    const Constants = client.constants;
    const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
    if (res && res.rowCount > 0) {
      const channels = res.rows[0].messageevents
        ?.map((id) =>
          typeof client.channels.cache.get(id)?.send === 'function'
            ? client.channels.cache.get(id)
            : null,
        )
        .filter((c) => c !== null);
      if (channels && channels.length) {
        const language = await ch.languageSelector(guild);
        const con = Constants.messageReactionRemoveAll;
        const lan = language.messageReactionRemoveAll;
        const embed = new Builders.UnsafeEmbedBuilder()
          .setColor(con.color)
          .setAuthor({
            name: lan.author.name,
            iconURL: con.author.image,
            url: con.author.link,
          })
          .setTimestamp()
          .setDescription(ch.stp(lan.description, { link: ch.stp(con.author.link, { msg }) }));
        ch.send(channels, { embeds: [embed] });
      }
    }
  },
};
