const ch = {
  send: require(`./ClientHelper/send`),
  reply: require(`./ClientHelper/reply`),
  query: require(`./ClientHelper/query`),
  stp: require(`./ClientHelper/stp`),
  regexes: require(`./ClientHelper/regexes`),
  imageURL2Buffer: require(`./ClientHelper/imageURL2Buffer`),
  memberBoostCalc: require(`./ClientHelper/memberBoostCalc`),
  userFlagsCalc: require(`./ClientHelper/userFlagsCalc`),
  channelRuleCalc: require(`./ClientHelper/channelRuleCalc`),
  permCalc: require(`./ClientHelper/permCalc`),
  getUnix: require(`./ClientHelper/getUnix`),
  getDifference: require(`./ClientHelper/getDifference`),
};

export default ch;