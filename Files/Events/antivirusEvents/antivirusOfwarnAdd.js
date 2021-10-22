module.exports = {
	async execute(msg) {
		const language = await msg.client.ch.languageSelector(msg.guild);
		msg.client.emit('modWarnAdd', msg.client.user, msg.author, language.autotypes.antivirus+' | ' + language.maliciousLink, msg);
	}
};