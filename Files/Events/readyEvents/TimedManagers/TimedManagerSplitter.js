module.exports = {
  execute() {
    require('./separatorControl').execute();
    require('./antivirusClear').execute();
    require('./mute').execute();
    require('./expiry').execute();
    // require('./stats').execute();
  },
};
