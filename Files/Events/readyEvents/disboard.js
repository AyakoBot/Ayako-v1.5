const Discord = require('discord.js');
const jobs = require('node-schedule');

module.exports = {
  async execute() {
    const client = require('../../BaseClient/DiscordClient');
    const { ch } = client;
    const Constants = client.constants;
    const res = await ch.query('SELECT * FROM disboard;');

    if (res && res.rowCount > 0) {
      for (let i = 0; i < res.rows.length; i += 1) {
        const { lastbump, enabled } = res.rows[i];
        const guild = client.guilds.cache.get(res.rows[i].guildid);
        const channel = client.channels.cache.get(res.rows[i].channelid);
        const timeLeft = lastbump - Date.now();

        if (!enabled) return;

        if (guild && guild.id && channel && channel.id) {
          if (timeLeft <= 0) end(ch, guild, Constants, channel, res.rows[i]);
          else {
            jobs.scheduleJob(new Date(Date.now() + timeLeft), async () => {
              end(ch, guild, Constants, channel, res.rows[i]);
            });
          }
        }
      }
    }
  },
};

async function end(ch, guild, Constants, channel) {
  const res = await ch.query('SELECT * FROM disboard WHERE guildid = $1;', [guild.id]);
  if (res && res.rowCount > 0) {
    const [row] = res.rows;
    const language = await ch.languageSelector(guild);

    const embed = new Discord.MessageEmbed()
      .setDescription(language.ready.disboard.bumpMsg)
      .setColor(Constants.standard.color)
      .setTimestamp()
      .setThumbnail(ch.iconURL(guild))
      .setAuthor({
        name: language.ready.disboard.title,
        iconURL: Constants.standard.image,
        url: Constants.standard.invite,
      });

    ch.send(channel, {
      embeds: [embed],
      content: `${row.roles.map((r) => `<@&${r}>`).join(' ')}\n${row.users
        .map((u) => `<@${u}>`)
        .join(' ')}`,
    });

    ch.query('UPDATE disboard SET lastbump = NULL WHERE guildid = $1;', [guild.id]);
  }
}
