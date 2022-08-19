const Builders = require('@discordjs/builders');

module.exports = {
  async execute(msg) {
    const { client } = msg;
    const { guild } = msg;
    const { ch } = client;
    const Constants = client.constants;
    const logChannels = client.logChannels.get(guild.id)?.messageevents;
    if (logChannels?.length) {
      const channels = logChannels
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
        ch.send(channels, { embeds: [embed] }, 5000);
      }
    }
  },
};
