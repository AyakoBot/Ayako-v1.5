const Discord = require('discord.js');

module.exports = {
  async execute() {
    // eslint-disable-next-line global-require
    const client = require('../../../BaseClient/DiscordClient');
    const { ch } = client;
    const Constants = client.constants;
    const res = await ch.query('SELECT * FROM disboard;');
    if (res && res.rowCount > 0) {
      res.rows.forEach(async (row) => {
        const role = `<@&${row.role}>`;
        const { lastbump } = row;
        const { enabled } = row;
        const guild = client.guilds.cache.get(row.guildid);
        const channel = client.channels.cache.get(row.channelid);
        if (!enabled) return;
        if (+lastbump < Date.now()) {
          if (guild && guild.id) {
            if (channel && channel.id) {
              const language = await ch.languageSelector(guild);
              const embed = new Discord.MessageEmbed()
                .setDescription(language.ready.disboard.bumpMsg)
                .setColor(Constants.standard.color)
                .setTimestamp()
                .setThumbnail(ch.iconURL(guild))
                .setAuthor(
                  language.ready.disboard.title,
                  Constants.standard.image,
                  Constants.standard.invite,
                );
              ch.send(channel, role, embed);
              ch.query(
                `
				UPDATE disboard SET channelid = null WHERE guildid = $1;
				UPDATE disboard SET lastbump = null WHERE guildid = $1;
				`,
                [guild.id],
              );
            }
          }
        }
      });
    }
  },
};
