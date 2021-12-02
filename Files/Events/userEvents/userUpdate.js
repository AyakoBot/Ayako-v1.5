/* eslint-disable import/extensions */
/* eslint-disable global-require */
module.exports = {
  async execute(oldUser, newUser) {
    require('./log.js').execute(oldUser, newUser);
    require('./nameLog.js').execute(oldUser, newUser);
  },
};
