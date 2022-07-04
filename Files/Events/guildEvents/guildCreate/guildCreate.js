module.exports = {
  async execute(guild) {
    if (!guild.memberCount) return;

    require('./log').execute(guild);
    require('./role').execute(guild);
    require('./welcome').execute(guild);
  },
};
