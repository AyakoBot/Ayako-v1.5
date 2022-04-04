const Builders = require('@discordjs/builders');

module.exports = {
  async execute(member, user) {
    const { client } = user;
    const { guild } = member;
    const { ch } = client;
    const res = await ch.query('SELECT * FROM welcome WHERE guildid = $1;', [guild.id]);
    if (res && res.rowCount > 0) {
      const r = res.rows[0];
      if (r.enabledtof === true) {
        const channel = guild.channels.cache.get(r.channelid);
        if (channel && channel.id) {
          if (!r.text) {
            const language = await ch.languageSelector(guild);
            r.text = ch.stp(language.guildMemberAddWelcome.welcome, { guild });
          }
          r.text = r.text
            .replace(/%u205/g, "'")
            .replace(/%o205/g, '`')
            .replace(/%i205/g, `${user}`);
          const embed = new Builders.UnsafeEmbedBuilder()
            .setDescription(`${r.text.toString()}`)
            .setColor(parseInt(r.color, 16));
          if (r.imageurl !== null) {
            embed.setImage(`${r.imageurl}`);
          }
          if (r.pingrole) {
            const role = guild.roles.cache.get(r.pingrole);
            role.exists = !!role.id;
            if (r.pingtof === true) {
              ch.send(
                channel,
                {
                  content: role.exists ? `${role}, ${user}` : `${user}`,
                  embeds: [embed],
                },
                5000,
              );
            } else if (role.exists) ch.send(channel, { content: `${role}`, embeds: [embed] }, 5000);
            else ch.send(channel, { embeds: [embed] });
          } else if (r.pingtof === true) {
            ch.send(channel, { content: `${user}`, embeds: [embed] }, 5000);
          } else {
            ch.send(channel, { embeds: [embed] }, 5000);
          }
        }
      }
    }
  },
};
