module.exports = {
  execute(invite) {
    require('./log').execute(invite);
    require('./collectionHandler').execute(invite);
  },
};
