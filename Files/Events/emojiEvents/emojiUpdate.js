const Builders = require('@discordjs/builders');

module.exports = {
  async execute(oldEmoji, newEmoji) {
    const { guild } = oldEmoji;
    const client = oldEmoji ? oldEmoji.client : newEmoji.client;
    const ch = require('../../BaseClient/ClientHelper');
    const Constants = require('../../BaseClient/Other Client Files/Constants.json');
    const logChannels = client.logChannels.get(guild.id)?.emojievents;
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
        const lan = language.emojiUpdate;
        const con = Constants.emojiUpdate;

        let entry;
        if (guild.members.me.permissions.has(128n)) {
          const audits = await guild.fetchAuditLogs({ limit: 2, type: 61 }).catch(() => {});
          if (audits && audits.entries) {
            const audit = audits.entries.filter((a) => a.target.id === newEmoji.id);
            entry = audit.sort((a, b) => b.id - a.id);
            entry = entry.first();
          }
        }

        const embed = new Builders.UnsafeEmbedBuilder()
          .setAuthor({
            name: lan.author.title,
            iconURL: con.author.image,
            url: ch.stp(con.author.link, {
              emoji: newEmoji,
              ending: newEmoji.animated ? 'gif' : 'png',
            }),
          })
          .setThumbnail(
            ch.stp(con.author.link, { emoji: oldEmoji, ending: newEmoji.animated ? 'gif' : 'png' }),
          )
          .setColor(con.color)
          .setTimestamp();
        if (entry && entry.id) {
          embed.setDescription(
            ch.stp(lan.description.withUser, {
              user: entry.executor,
              newEmoji,
              oldEmoji,
            }),
          );
        } else embed.setDescription(ch.stp(lan.description.withoutUser, { newEmoji, oldEmoji }));
        ch.send(channels, { embeds: [embed] }, 5000);
      }
    }
  },
};
