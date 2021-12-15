/* eslint-disable import/extensions */

module.exports = {
  async execute(oldUser, newUser) {
    require('./log.js').execute(oldUser, newUser);
    require('./nameLog.js').execute(oldUser, newUser);
  },
};
