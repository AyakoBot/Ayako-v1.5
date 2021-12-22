module.exports = {
  async execute(oldMember, newMember) {
    if (!oldMember || !newMember) return;
    require('./log').execute(oldMember, newMember);
    if (oldMember.roles.cache !== newMember.roles.cache)
      require('./separator').execute(oldMember, newMember);
  },
};
