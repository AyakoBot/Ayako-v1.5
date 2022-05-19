// TODO: add mod-log for timeouts

module.exports = {
  async execute(oldMember, newMember) {
    if (!oldMember || !newMember) return;
    require('./log').execute(oldMember, newMember);
    require('./separator').execute(oldMember, newMember);
    require('./nitro').execute(oldMember, newMember);
  },
};
