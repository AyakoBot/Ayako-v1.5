
module.exports = {
  async execute(oldMsg, rawnewMsg) {
    const newMsg = await rawnewMsg.fetch().catch(() => {});
    require('./editCommand').execute(oldMsg, newMsg);
    if (oldMsg.channel.type === 1) return;
    require('./logPublish').execute(oldMsg, newMsg);
    require('./logUpdate').execute(oldMsg, newMsg);
  },
};
