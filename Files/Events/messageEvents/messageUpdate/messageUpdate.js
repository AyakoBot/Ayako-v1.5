module.exports = {
  async execute(oldMsg, rawnewMsg) {
    const newMsg = await rawnewMsg.fetch().catch(() => {});

    editDelete(oldMsg, rawnewMsg);
    require('./editCommand').execute(oldMsg, newMsg);
    if (oldMsg.channel.type === 1) return;
    require('./logPublish').execute(oldMsg, newMsg);
    require('./logUpdate').execute(oldMsg, newMsg);
  },
};

const editDelete = (oldMsg, msg) => {
  if (oldMsg.content === msg.content) return;
  if (!msg.content.includes('https://') && !msg.content.includes('http://')) return;
  if (msg.guild.id !== '298954459172700181') return;

  msg.delete().catch(() => undefined);
};
