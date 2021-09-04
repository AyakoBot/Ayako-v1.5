module.exports = {
	async execute(msg) {
		let msgs = await msg.channel.messages.fetch({
			limit: 100,
		}).catch(() => {});
		const filterBy = msg.author.id;
		msgs = msgs.filter(m => m.author.id === filterBy).array().slice(0, 18);
		msg.channel.bulkDelete(msgs).catch(() => {});
		const language = await msg.client.ch.languageSelector(msg.guild);
		msg.client.emit('modBanAdd', msg.client.user, msg.author, language.autotypes.antispam, msg);
	}
};