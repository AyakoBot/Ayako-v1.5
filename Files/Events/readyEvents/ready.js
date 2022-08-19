const jobs = require('node-schedule');

module.exports = {
  once: true,
  execute: async () => {
    const client = require('../../BaseClient/DiscordClient');
    console.log(`|Logged in as Ayako\n|-> Bot: ${client.user.tag}`);
    console.log(`Login at ${new Date(Date.now()).toLocaleString()}`);

    jobs.scheduleJob('*/30 * * * *', () => {
      require('./antivirusBlocklistCacher')();
    });
    jobs.scheduleJob('*/10 * * * *', () => {
      // eslint-disable-next-line no-console
      console.log(new Date().toLocaleString());
    });

    if (client.user.id === client.mainID) {
      const statcord = require('../../BaseClient/Statcord');
      statcord.autopost();
    }

    jobs.scheduleJob('*/1 */1 */1 * *', () => {
      require('./nitroCycle')();

      if (client.user.id === client.mainID) {
        require('./WebsiteFetcher')();
      }
      if (new Date().getHours() === 0) {
        client.ch.query('DELETE FROM toxicitycheck;');
      }
    });

    jobs.scheduleJob('*/1 * * * *', () => {
      require('./presence')();
      require('./verification')();
    });

    jobs.scheduleJob('*/2 * * * * *', () => {
      require('./TimedManagers/TimedManagerSplitter')();
    });

    require('./giveawayManager')();
    require('./muteManager')();
    require('./channelbanManager')();
    require('./banManager')();
    require('./voteHandler')();
    require('./antivirusBlocklistCacher')();
    require('./nitro')();
    require('./reminder')();
    require('./disboard')();
    require('./separators')();
    require('./inviteLogger')();
    setTimeout(() => {
    //  process.exit();
    }, 86400000);
  },
};
