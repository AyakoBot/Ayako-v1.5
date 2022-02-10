module.exports = {
  async execute(msg) {
    const language = await msg.client.ch.languageSelector(msg.guild);
    msg.client.ch.send(msg.channel, `${msg.author} ${language.mod.warnAdd.antivirus.description}`, {
      allowedMentions: { repliedUser: true },
    });

    if (msg.source) {
      msg.client.emit('modSourceHandler', msg);
    }
  },
};
