module.exports = {
  async execute(msg) {
    if (!msg.channel || msg.channel.type === 1 || !msg.author || !msg.guild) return;

    const pin = () => {
      if (msg.channel.id !== '1060213963205394552') return;
      setTimeout(() => {
        if (!msg.pinned) msg.delete().catch(() => null);
      }, 5000);
    };
    pin();
  },
};
