export default {
  send: await import(`./ClientHelper/send`),
  reply: await import(`./ClientHelper/reply`),
  query: await import(`./ClientHelper/query`),
  stp: await import(`./ClientHelper/stp`),
  regexes: await import(`./ClientHelper/regexes`),
  imageURL2Buffer: await import(`./ClientHelper/imageURL2Buffer`),
  memberBoostCalc: await import(`./ClientHelper/memberBoostCalc`),
  userFlagsCalc: await import(`./ClientHelper/userFlagsCalc`),
  channelRuleCalc: await import(`./ClientHelper/channelRuleCalc`),
  permCalc: await import(`./ClientHelper/permCalc`),
  getUnix: await import(`./ClientHelper/getUnix`),
  getDifference: await import(`./ClientHelper/getDifference`),
};
