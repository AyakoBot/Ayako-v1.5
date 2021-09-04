module.exports = {
	async execute(guild) {
		require('./log.js').execute(guild);
		require('./nitro.js').execute(guild);
		require('./role.js').execute(guild);
		require('./welcome.js').execute(guild);
	}
};