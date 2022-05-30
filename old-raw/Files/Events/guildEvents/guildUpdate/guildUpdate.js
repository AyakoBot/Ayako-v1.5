module.exports = async (oldGuild, newGuild) => {
  require('./log')(oldGuild, newGuild);
  require('./vanity')(oldGuild, newGuild);
};
