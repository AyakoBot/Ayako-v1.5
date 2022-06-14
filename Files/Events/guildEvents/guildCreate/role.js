const jobs = require('node-schedule');

module.exports = {
  async execute(guild) {
    jobs.scheduleJob(new Date(Date.now() + 600000), () => {
      const role = guild.roles.cache.find((r) => r.name === guild.client.constants.standard.name);
      if (role && role.id) {
        role.edit({ color: guild.client.constants.standard.color }).catch(() => {});
      }
    });
  },
};
