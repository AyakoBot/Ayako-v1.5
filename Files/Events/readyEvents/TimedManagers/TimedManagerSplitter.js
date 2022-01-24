module.exports = {
  execute() {
    require('./verification').execute();
    require('./separatorControl').execute();
    require('./antivirusClear').execute();
    // require('./disboard').execute();
    // require('./voteReminder').execute();
    require('./mute').execute();
    // require('./stats').execute();
  },
};
