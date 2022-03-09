module.exports = {
  async execute(msg) {
    const language = await msg.client.ch.languageSelector(msg.guild);
    msg.client.ch.send(msg.channel, `${msg.author} ${language.mod.warnAdd.antivirus.description}`, {
      allowedMentions: { repliedUser: true },
    });

    msg.client.emit('modWarnAdd', msg.client.user, msg.author, language.autotypes.antivirus, msg);
  },
};
