/* eslint-disable global-require */
module.exports = {
  async execute(member) {
    const user = await member.guild.members.fetch(member.id);
    require('./giveaway').execute(member, user);
    require('./log').execute(member, user);
    require('./mute').execute(member, user);
    require('./welcome').execute(member, user);
    require('./verification').execute(member, user);
    require('./antiraid').execute(member, user);
  },
};
