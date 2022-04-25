module.exports = {
  async execute(oldPresence, newPresence) {
    require('./game').execute(oldPresence, newPresence);
    require('./status').execute(oldPresence, newPresence);
  },
};
