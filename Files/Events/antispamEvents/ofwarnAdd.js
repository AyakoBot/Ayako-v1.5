module.exports = {
	async execute(msg) {
		const language = await msg.client.ch.languageSelector(msg.guild);
		msg.client.emit('warnAdd', msg.client.user, msg.author, language.spam);
	}
};
