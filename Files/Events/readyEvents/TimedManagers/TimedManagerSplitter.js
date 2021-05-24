module.exports = {
	execute() {
		require('./disboard').execute();
		require('./mute').execute();
		require('./reminder').execute();
		//require('./stats').execute();
		require('./voteReminder').execute();
		require('./willis').execute();
	}
};