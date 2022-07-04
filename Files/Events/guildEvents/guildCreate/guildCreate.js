module.exports = {
  async execute(guild) {
    if (String(guild.name) === 'undefined') return;

    require('./log').execute(guild);
    require('./role').execute(guild);
    require('./welcome').execute(guild);
  },
};
