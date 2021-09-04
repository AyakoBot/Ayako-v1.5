module.exports = {
	name: 'restart',
	perm: 0,
	dm: true,
	takesFirstArg: false,
	aliases: null,
	async exe(msg) {
		await msg.client.ch.reply(msg, 'Restarting... '+msg.client.constants.emotes.loading);
		// eslint-disable-next-line no-undef
		process.exit();
	}
};