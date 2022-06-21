module.exports = {
  async execute(oldUser, newUser) {
    if (oldUser.bot || newUser.bot) return;
    require('./log').execute(oldUser, newUser);
    require('./nameLog').execute(oldUser, newUser);
  },
};
