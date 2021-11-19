module.exports = {
	async execute(oldState, newState) {
		require('./log.js').execute(oldState, newState);
		require('./mute.js').execute(oldState, newState);
	}
};