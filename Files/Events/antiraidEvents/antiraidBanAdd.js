module.exports = {
	async execute(executor, target, reason, msg) {
		msg.client.emit('modBanAdd', executor, target, reason, msg);
	}
};