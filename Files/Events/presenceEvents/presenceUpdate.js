module.exports = {
	async execute(oldPresence, newPresence) {
		require('./game.js').execute(oldPresence, newPresence);
		require('./status.js').execute(oldPresence, newPresence);
	}
};