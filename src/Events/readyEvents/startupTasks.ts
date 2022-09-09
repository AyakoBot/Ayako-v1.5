import Jobs from 'node-schedule';
import client from '../../BaseClient/ErisClient';

export default async () => {
  (await import('./antivirusBlocklistCacher')).default();
  Jobs.scheduleJob('*/30 * * * *', async () => {
    (await import('./antivirusBlocklistCacher')).default();
  });

  Jobs.scheduleJob('*/1 */1 */1 * *', async () => {
    (await import('./nitroCycle')).default();

    if (client.user.id === client.mainID) (await import('./websiteFetcher')).default();
    if (new Date().getHours() === 0) {
      (await import('../messageEvents/messageCreate/antispam')).resetData();
      (await import('../messageEvents/messageCreate/blacklist')).resetData();
      (await import('../antivirusEvents/antivirusHandler')).resetData();
    }
  });

  Jobs.scheduleJob('*/1 * * * *', async () => {
    (await import('./presence')).default();
    (await import('./verification')).default();
  });

  Jobs.scheduleJob('*/2 * * * * *', async () => {
    (await import('./timedFiles/timedManager')).default();
  });

  (await import('./startupTasks/giveaway')).default();
  (await import('./startupTasks/giveawayCollectTime')).default();
  (await import('./startupTasks/punishments')).default();
  (await import('./startupTasks/voteHandle')).default();
  (await import('./startupTasks/nitro')).default();
  (await import('./startupTasks/reminder')).default();
  (await import('./startupTasks/disboard')).default();
  (await import('./startupTasks/separators')).default();
  (await import('./startupTasks/invitesAnimekos')).default();
  (await import('./startupTasks/invites')).default();
  (await import('./startupTasks/webhooks')).default();
};
