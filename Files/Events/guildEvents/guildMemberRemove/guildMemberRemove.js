module.exports = {
  execute: (member) => {
    require('./log').execute(member);
    require('./sticky').execute(member);
  },
};
