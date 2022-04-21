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
          require('./nitro')(g);
        });
        client.ch.query('DELETE FROM toxicitycheck;');
      }
    });

    require('./reminder')();
    require('./disboard')();
    require('./giveaway')();
    require('./separators')();
    require('./antivirusBlocklistCacher')();
    require('./voteHandler')();
    require('./inviteLogger')();
    require('./banManager')();
    require('./channelbanManager')();

    jobs.scheduleJob('*/2 * * * * *', () => {
      require('./TimedManagers/TimedManagerSplitter')();
    });
    jobs.scheduleJob('*/2 * * * *', () => {
      require('./prunelog')();
    });
    jobs.scheduleJob('*/1 * * * *', () => {
      require('./presence')();
      require('./verification')();
    });
    jobs.scheduleJob('*/30 * * * *', () => {
      require('./antivirusBlocklistCacher')();
    });
    jobs.scheduleJob('*/10 * * * *', () => {
      // eslint-disable-next-line no-console
      console.log(new Date().toLocaleString());
    });
  },
};
