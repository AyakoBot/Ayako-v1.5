module.exports = {
  async execute(oldState, newState) {
    require('./log')(oldState, newState);
    require('./streamroles')(oldState, newState);
  },
};
