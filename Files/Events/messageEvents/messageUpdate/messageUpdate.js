module.exports = {
	async execute(oldMsg, rawnewMsg) {
		const newMsg = await rawnewMsg.fetch().catch(() => {});
		require('./editCommand').execute(oldMsg, newMsg);
		if (oldMsg.channel.type == 'DM') return;
		require('./esnipe').execute(oldMsg, newMsg);
		require('./logPublish').execute(oldMsg, newMsg);
		require('./logUpdate').execute(oldMsg, newMsg);
	}
};