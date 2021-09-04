module.exports = {
	async execute(msg) {
		if (msg.channel.type == 'DM') return;
		require('./giveaway.js').execute(msg);
		if (!msg.author) return;
		require('./log.js').execute(msg);
		if (msg.author.bot) return;
		require('./snipe.js').execute(msg);
	}
};