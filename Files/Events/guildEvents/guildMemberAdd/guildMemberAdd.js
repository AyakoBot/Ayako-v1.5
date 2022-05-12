module.exports = async (member) => {
  require('./log')(member);
  require('./welcome')(member);
  require('./verification')(member);
  require('./antiraid')(member);
  require('./sticky')(member);
  require('./dmAd')(member);
};
