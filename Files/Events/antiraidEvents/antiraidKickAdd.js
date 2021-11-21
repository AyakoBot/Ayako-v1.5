module.exports = {
	async execute(executor, target, reason, msg) {
		msg.client.emit('modKickAdd', executor, target, reason, msg);
	}
};