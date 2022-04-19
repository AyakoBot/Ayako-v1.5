module.exports = {
  async execute(msg) {
    const language = await msg.client.ch.languageSelector(msg.guild);

    msg.client.emit(
      'modBaseEvent',
      {
        executor: msg.client.user,
        target: msg.author,
        reason: language.autotypes.antivirus,
        msg,
        guild: msg.guild,
      },
      'warnAdd',
    );
  },
};
