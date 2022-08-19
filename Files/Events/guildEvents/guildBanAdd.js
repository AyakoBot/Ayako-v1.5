const Builders = require('@discordjs/builders');

module.exports = {
  async execute(ban) {
    const { client } = ban;
    const { ch } = client;
    const Constants = client.constants;
    const logChannels = client.logChannels.get(ban.guild.id)?.guildevents;
    if (logChannels?.length) {
      const channels = logChannels
        ?.map((id) =>
          typeof client.channels.cache.get(id)?.send === 'function'
            ? client.channels.cache.get(id)
            : null,
        )
        .filter((c) => c !== null);
      if (channels && channels.length) {
        const language = await ch.languageSelector(ban.guild);
        const lan = language.guildBanAdd;
        const con = Constants.guildBanAdd;

        let entry;
        if (ban.guild.members.me.permissions.has(128n)) {
          const audits = await ban.guild.fetchAuditLogs({ limit: 3, type: 22 });
          if (audits && audits.entries) {
            const audit = audits.entries.filter((a) => a.target.id === ban.user.id);
            entry = audit.sort((a, b) => b.id - a.id);
            entry = entry.first();
          }
        }

        const embed = new Builders.UnsafeEmbedBuilder()
          .setAuthor({
            name: lan.author.title,
            iconURL: con.author.image,
          })
          .setColor(con.color)
          .setTimestamp();
        if (entry && entry.id) {
          embed.setDescription(
            ch.stp(lan.description.withUser, { user: entry.executor, target: ban.user }),
          );
          embed.addFields({
            name: language.reason,
            value: entry.reason ? `\n${entry.reason}` : language.none,
          });
        } else {
          embed.setDescription(ch.stp(lan.description.withoutUser, { target: ban.user }));
          embed.addFields({
            name: language.reason,
            value: ban.reason ? ban.reason : language.unknown,
          });
        }
        ch.send(channels, { embeds: [embed] }, 5000);
      }
    }
  },
};
