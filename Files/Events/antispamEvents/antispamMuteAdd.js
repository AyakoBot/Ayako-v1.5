module.exports = {
  async execute(msg) {
    let msgs = await msg.channel.messages
      .fetch({
        limit: 100,
      })
      .catch(() => {});

    msgs = msgs
      .filter((m) => m.author.id === msg.author.id)
      .array()
      .slice(0, 13);

    msg.channel.bulkDelete(msgs).catch(() => {});

    const language = await msg.client.ch.languageSelector(msg.guild);

    msg.client.emit(
      'modBaseEvent',
      {
        executor: msg.client.user,
        target: msg.author,
        reason: language.autotypes.antivirus,
        msg,
        guild: msg.guild,
        duration: 3600000,
      },
      'tempmuteAdd',
    );
  },
};
