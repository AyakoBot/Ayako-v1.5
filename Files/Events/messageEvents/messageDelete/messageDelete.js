/* eslint-disable global-require */
module.exports = {
  async execute(msg) {
    if (msg.channel.type === 'DM') return;
    require('./giveaway').execute(msg);
    if (!msg.author) return;
    require('./log').execute(msg);
    if (msg.author.bot) return;
    require('./snipe').execute(msg);
  },
};
