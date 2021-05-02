module.exports = {
	async execute(reaction, user) {
		require('./Giveaway').execute(reaction, user);
		require('./Willis').execute(reaction, user);
		require('./ReactionRoles').execute(reaction, user);
	}
};