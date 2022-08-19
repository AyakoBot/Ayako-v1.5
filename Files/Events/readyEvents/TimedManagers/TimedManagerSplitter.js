module.exports = async () => {
  require('./separatorControl')();
  require('./willis')();
  require('./antivirusClear')();
  require('./expiry')();
  require('./logchannelCacher')();
  require('./stats')();
};
