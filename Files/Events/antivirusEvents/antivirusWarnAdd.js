module.exports = {
  async execute(msg) {
    const language = await msg.client.ch.languageSelector(msg.guild);
    msg.client.ch.send(msg.channel, `${msg.author} ${language.mod.warnAdd.antivirus.description}`, {
      allowedMentions: { repliedUser: true },
    });

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
