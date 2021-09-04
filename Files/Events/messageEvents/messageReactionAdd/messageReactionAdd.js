module.exports = {
	async execute(reaction, user) {
		require('./giveaway').execute(reaction, user);
		require('./willis').execute(reaction, user);
		require('./reactionRoles').execute(reaction, user);
	}
};