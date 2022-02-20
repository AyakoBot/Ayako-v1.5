module.exports = {
  execute() {
    require('./separatorControl').execute();
    require('./antivirusClear').execute();
    // require('./voteReminder').execute();
    require('./mute').execute();
    // require('./stats').execute();
  },
};
