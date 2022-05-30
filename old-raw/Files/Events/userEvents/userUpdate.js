module.exports = {
  async execute(oldUser, newUser) {
    require('./log').execute(oldUser, newUser);
    require('./nameLog').execute(oldUser, newUser);
  },
};
