const Discord = require('discord.js');

module.exports = {
  async execute(oldUser, newUser) {
    const client = oldUser ? oldUser.client : newUser.client;
    const { ch } = client;
    const Constants = client.constants;
    client.guilds.cache.forEach(async (guild) => {
      const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
      if (res && res.rowCount > 0) {
        const channels = res.rows[0].userevents
          ?.map((id) =>
            typeof client.channels.cache.get(id)?.send === 'function'
              ? client.channels.cache.get(id)
              : null,
          )
          .filter((c) => c !== null);
        if (channels && channels.length) {
          const member = guild.members.cache.get(newUser.id);
          if (member) {
            const language = await ch.languageSelector(guild);
            const lan = language.userUpdate;
            const con = Constants.userUpdate;
            const changedKey = [];
            const embed = new Discord.MessageEmbed()
              .setTimestamp()
              .setAuthor({
                name: lan.author.name,
                iconURL: con.author.image,
                url: ch.stp(con.author.link, { user: newUser }),
              })
              .setColor(con.color);

            const files = [];
            let path;
            if (oldUser.avatar !== newUser.avatar) {
              changedKey.push(language.avatar);

              [path] = await ch.downloader(newUser, [ch.displayAvatarURL(newUser)], 'user');
              if (path) {
                files.push(path);
                const name = await ch.getName(path);
                embed.addField(language.avatar, lan.avatar);
                embed.setThumbnail(`attachment://${name}`);
              }
            }
            if (oldUser.username !== newUser.username) {
              changedKey.push(language.username);
              embed.addField(
                language.username,
                `${language.before}: \`${oldUser.username}\`\n${language.after}: \`${newUser.username}\``,
              );
            }
            if (oldUser.discriminator !== newUser.discriminator) {
              changedKey.push(language.discriminator);
              embed.addField(
                language.discriminator,
                `${language.before}: \`${oldUser.discriminator}\`\n${language.after}: \`${newUser.discriminator}\``,
              );
            }
            embed.setDescription(
              ch.stp(lan.description, { user: newUser }) + changedKey.map((o) => ` \`${o}\``),
            );
            if (embed.fields.length || (embed.thumbnail && embed.thumbnail.url)) {
              ch.send(channels, { embeds: [embed], files });
            }
          }
        }
      }
    });
  },
};
