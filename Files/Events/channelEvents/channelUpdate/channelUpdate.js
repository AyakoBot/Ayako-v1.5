module.exports = {
  async execute(oldChannel, newChannel) {
    require('./log').execute(oldChannel, newChannel);
    require('./sticky').execute(oldChannel, newChannel);
  },
};
