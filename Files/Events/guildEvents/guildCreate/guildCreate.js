module.exports = {
  async execute(guild) {
    require('./log').execute(guild);
    require('./role').execute(guild);
    require('./welcome').execute(guild);
  },
};
