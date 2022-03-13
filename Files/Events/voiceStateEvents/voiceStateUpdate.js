module.exports = {
  async execute(oldState, newState) {
    require('./log')(oldState, newState);
  },
};
