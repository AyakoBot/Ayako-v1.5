module.exports = {
	execute(msg) {
		require('./commandHandler').execute(msg);
	}
};