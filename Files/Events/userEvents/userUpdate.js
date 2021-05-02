module.exports = {
	execute(oldUser, newUser) {
		require('./log.js').execute(oldUser, newUser);
		require('./usernameLog.js').execute(oldUser, newUser);
	}
};