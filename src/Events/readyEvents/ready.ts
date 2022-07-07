/* eslint-disable no-console */
import Jobs from 'node-schedule';
import client from '../../BaseClient/ErisClient';

export default async () => {
  console.log(
    `| Logged in as ${client.user.username}\n| => Bot: ${client.user.username}#${
      client.user.discriminator
    } / ${client.user.id}\n| Login at ${new Date(Date.now()).toLocaleString()}`,
  );

  Jobs.scheduleJob('*/10 * * * *', () => {
    console.log(`=> Current Date: ${new Date().toLocaleString()}`);
  });

  (await import('./startupTasks')).default();
};
