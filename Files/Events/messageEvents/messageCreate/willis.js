module.exports = {
  async execute(msg) {
    if (!msg.channel || msg.channel.type === 1) return;
    if (
      ![
        '1090288389296758954',
        '887353453666512997',
        '1007037376821985391',
        '803246561995522059',
      ].includes(msg.channel.id) ||
      !msg.author
    ) {
      return;
    }
    if (
      !msg.member.roles.cache.has('293928278845030410') &&
      !msg.member.roles.cache.has('278332463141355520') &&
      msg.attachments.size === 0
    ) {
      msg.delete();
    }
  },
};
