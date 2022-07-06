import jobs from 'node-schedule';
import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';

export default async (guild: Eris.Guild) => {
  jobs.scheduleJob(new Date(Date.now() + 600000), () => {
    const role = guild.roles.find((r) => r.tags?.bot_id === client.user.id);
    role?.edit({ color: client.constants.standard.color }).catch(() => null);
  });
};
