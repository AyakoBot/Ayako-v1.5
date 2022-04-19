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
      .slice(0, 18);

    msg.channel.bulkDelete(msgs).catch(() => {});

    msg.language = await msg.client.ch.languageSelector(msg.guild);

    msg.client.emit(
      'modBaseEvent',
      {
        executor: msg.client.user,
        target: msg.author,
        reason: msg.language.autotypes.antispam,
        msg,
        guild: msg.guild,
      },
      'warnAdd',
    );
  },
};
