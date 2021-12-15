
module.exports = {
  async execute(oldState, newState) {
    require('./log').execute(oldState, newState);
    require('./mute').execute(oldState, newState);
  },
};
