const Builders = require('@discordjs/builders');
const jobs = require('node-schedule');
const client = require('../../../BaseClient/DiscordClient');

module.exports = async () => {
  const res = await client.ch.query('SELECT * FROM roleseparatorsettings WHERE startat < $1;', [
    Date.now() - 3900000,
  ]);
  res.rows.forEach(async (row) => {
    const guild = client.guilds.cache.get(row.guildid);
    if (!guild) return;

    if (client.separatorAssigner) {
      if (client.separatorAssigner[guild.id]) {
        Object.entries(client.separatorAssigner[guild.id]).forEach((_, index) => {
          client.separatorAssigner[guild.id][index].cancel();
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
      jobs.scheduleJob(new Date(Date.now() + 300000), () => {
        require('../../guildEvents/guildMemberUpdate/separator').oneTimeRunner(
          msg,
          new Builders.UnsafeEmbedBuilder(),
        );
      });
    }
  });
};
