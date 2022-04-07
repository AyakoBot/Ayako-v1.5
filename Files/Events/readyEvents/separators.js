/* eslint-disable import/no-unresolved */

const Builders = require('@discordjs/builders');
const client = require('../../BaseClient/DiscordClient');

module.exports = {
  async execute() {
    const res = await client.ch.query(
      'SELECT * FROM roleseparatorsettings WHERE stillrunning = $1;',
      [true],
    );
    res.rows.forEach(async (row) => {
      const guild = client.guilds.cache.get(row.guildid);
      if (guild) {
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
        require('../guildEvents/guildMemberUpdate/separator').oneTimeRunner(
          msg,
          new Builders.UnsafeEmbedBuilder(),
        );
      }
    });
  },
};
