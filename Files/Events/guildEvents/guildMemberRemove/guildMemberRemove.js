module.exports = {
  execute: (member) => {
    require('./log').execute(member);
    require('./stickyroles').execute(member);
  },
};
