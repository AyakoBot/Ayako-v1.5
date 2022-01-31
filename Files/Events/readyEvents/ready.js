// const { statcord } = require('../../BaseClient/Statcord');

module.exports = {
  once: true,
  execute: async () => {
    // eslint-disable-next-line global-require
    const client = require('../../BaseClient/DiscordClient');
    console.log(`|Logged in as Ayako\n|-> Bot: ${client.user.tag}`);
    console.log(`Login at ${new Date(Date.now()).toLocaleString()}`);

    client.guilds.cache.forEach(async (guild) => {
      client.invites.set(guild.id, await client.ch.getErisInvites(guild));
      client.ch.getErisBans(guild);
    });

    // statcord.autopost();

    setInterval(() => {
      // require('./websiteFetcher').execute();
      if (new Date().getHours() === 0) {
        client.guilds.cache.forEach((g) => {
          require('../guildEvents/guildCreate/nitro').execute(g);
        });
        require('./nitro').execute();
        client.ch.query('DELETE FROM toxicitycheck;');
      }
    }, 3600000);

    require('./slashcommands').execute();
    require('./reminder').execute();
    require('./disboard').execute();
    require('./giveaway').execute();
    require('./separators').execute();
    require('./antivirusBlocklistCacher').execute();
    require('./voteHandler').execute();

    setInterval(() => require('./TimedManagers/TimedManagerSplitter').execute(), 2000);
    setInterval(() => require('./prunelog').execute(), 120000);
    setInterval(() => require('./presence').execute(), 60000);
    setInterval(() => require('./antivirusBlocklistCacher').execute(), 1800000);
    setInterval(() => console.log(new Date().toLocaleString()), 600000);
  },
};
