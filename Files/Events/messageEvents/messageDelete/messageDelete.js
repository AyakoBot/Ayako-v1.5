
module.exports = {
  async execute(msg) {
    if (msg.channel.type === 1) return;
    require('./giveaway').execute(msg);
    if (!msg.author) return;
    require('./log').execute(msg);
  },
};
