module.exports = {
  async execute(msg) {
    const language = await msg.client.ch.languageSelector(msg.guild);
    msg.client.emit('modBanAdd', msg.client.user, msg.author, language.autotypes.antivirus, msg);
  },
};
