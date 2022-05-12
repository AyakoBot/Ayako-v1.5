module.exports = {
  async execute(member) {
    require('./giveaway').execute(member, member.user);
    require('./log').execute(member, member.user);
    require('./welcome')(member, member.user);
    require('./verification').execute(member, member.user);
    require('./antiraid').execute(member, member.user);
    require('./sticky').execute(member, member.user);
    // require('./dmAd').execute(member, member.user);
  },
};
