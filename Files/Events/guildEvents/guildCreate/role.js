const jobs = require('node-schedule');

module.exports = {
  async execute(guild) {
    jobs.scheduleJob(new Date(Date.now() + 600000), () => {
      const role = guild.roles.botRoleFor(guild.client.user);
      if (role && role.id) {
        role.edit({ color: guild.client.constants.standard.color }).catch(() => {});
      }
    });
  },
};
