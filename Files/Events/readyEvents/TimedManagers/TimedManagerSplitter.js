module.exports = {
	execute() {
		//require('./stats').execute();
		return
		require('./willis').execute();
		require('./disboard').execute();
		require('./voteReminder').execute();
		require('./reminder').execute();
		require('./mute').execute();
	}
};