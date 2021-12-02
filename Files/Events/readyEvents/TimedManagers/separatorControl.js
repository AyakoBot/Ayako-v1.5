const Discord = require('discord.js');
const client = require('../../../BaseClient/DiscordClient');

module.exports = {
  async execute() {
    const res = await client.ch.query('SELECT * FROM roleseparatorsettings WHERE startat < $1;', [
      Date.now() - 3600000,
    ]);
    res.rows.forEach(async (row) => {
      const guild = client.guilds.cache.get(row.guildid);
      if (client.separatorAssigner) {
        if (client.separatorAssigner[guild.id]) {
          Object.entries(client.separatorAssigner[guild.id]).forEach((_, index) => {
            clearTimeout(client.separatorAssigner[guild.id][index]);
          });
        }
        client.separatorAssigner[guild.id] = undefined;
        const message = await client.channels.cache
          .get(row.channelid)
          ?.messages.fetch(row.messageid)
          .catch(() => {});
        const msg = {};
        const language = await client.ch.languageSelector(guild);
        msg.client = client;
        msg.author = client.user;
        msg.guild = guild;
        msg.lanSettings = language.commands.settings;
        msg.lan = msg.lanSettings.separators;
        msg.m = message;
        msg.language = language;
        msg.channel = client.channels.cache.get(row.channelid);
        if (row.index === row.length) msg.lastRun = true;
        // eslint-disable-next-line global-require
        require('../../guildEvents/guildMemberUpdate/separator').oneTimeRunner(
          msg,
          new Discord.MessageEmbed(),
        );
      }
    });
  },
};
