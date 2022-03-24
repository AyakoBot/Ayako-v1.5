const jobs = require('node-schedule');

module.exports = {
  once: true,
  execute: async () => {
    const client = require('../../BaseClient/DiscordClient');
    console.log(`|Logged in as Ayako\n|-> Bot: ${client.user.tag}`);
    console.log(`Login at ${new Date(Date.now()).toLocaleString()}`);

    client.guilds.cache.forEach(async (guild) => {
      client.invites.set(guild.id, await client.ch.getErisInvites(guild));
      client.ch.getErisBans(guild);
    });

    if (client.user.id === client.mainID) {
      const statcord = require('../../BaseClient/Statcord');
      statcord.autopost();
    }

    jobs.scheduleJob('*/1 */1 * * *', () => {
      if (client.user.id === client.mainID) {
        require('./WebsiteFetcher')();
      }
      if (new Date().getHours() === 0) {
        client.guilds.cache.forEach((g) => {
          require('./nitro').execute(g);
        });
        client.ch.query('DELETE FROM toxicitycheck;');
      }
    });

    require('./slashcommands').execute();
    require('./reminder').execute();
    require('./disboard').execute();
    require('./giveaway').execute();
    require('./separators').execute();
    require('./antivirusBlocklistCacher').execute();
    require('./voteHandler').execute();

    jobs.scheduleJob('*/2 * * * * *', () => {
      require('./TimedManagers/TimedManagerSplitter').execute();
    });
    jobs.scheduleJob('*/2 * * * *', () => {
      require('./prunelog').execute();
    });
    jobs.scheduleJob('*/1 * * * *', () => {
      require('./presence').execute();
      require('./verification').execute();
    });
    jobs.scheduleJob('*/30 * * * *', () => {
      require('./antivirusBlocklistCacher').execute();
    });
    jobs.scheduleJob('*/10 * * * *', () => {
      console.log(new Date().toLocaleString());
    });
  },
};
