module.exports = async (msg) => {
  if (msg.channel.id === '757879586439823440' && msg.author.id === '646937666251915264') {
    if (msg.content.includes('since this server is currently active')) {
      msg.client.ch.reply(msg, {
        content: '<@&893986129773207582> Karuta has dropped Cards! Move or lose.',
      });
    }

    if (msg.content.includes('A card from your wishlist is dropping')) {
        msg.client.ch.reply(msg, {
        content: '<@&893986129773207582> a wished Card was dropped! Move or lose.',
      });
    }
  }

  if (
    msg.author.id === '868115102681956404' &&
    msg.channel.id === '757879586439823440' &&
    msg.content.includes('@Known-Scammers ping:')
  ) {
    const actualContent = msg.content.split(/`+/);
    const splitContent = actualContent.split(/:/);
    const isUnban = actualContent.includes('REMOVAL FROM LIST');
    const ids = [];
    const executor = await msg.client.users.fetch('646937666251915264').catch(() => {});

    splitContent.forEach((s, i) => {
      if (s.includes('ID')) {
        ids.push(splitContent[i + 1]);
      }
    });

    ids.forEach(async (id) => {
      const user = await msg.client.users.fetch(id).catch(() => {});
      if (!user) return msg.client.ch.error(msg, msg.language.errors.userNotFound);

      const reason = splitContent[splitContent.findIndex((c) => c.includes('Reason')) + 1];

      if (isUnban) {
        msg.client.emit(
          'modBaseEvent',
          {
            target: user,
            executor: executor || msg.client.user,
            reason,
            msg,
            guild: msg.guild,
          },
          'banRemove',
        );
      } else {
        msg.client.emit(
          'modBaseEvent',
          {
            target: user,
            executor: executor || msg.client.user,
            reason,
            msg,
            guild: msg.guild,
          },
          'banAdd',
        );
      }
      return null;
    });
  }
};
