const ch = {
  send: (await import(`./ClientHelper/send`)).default,
  reply: (await import(`./ClientHelper/reply`)).default,
  query: (await import(`./ClientHelper/query`)).default,
  stp: (await import(`./ClientHelper/stp`)).default,
  regexes: (await import(`./ClientHelper/regexes`)).default,
  imageURL2Buffer: (await import(`./ClientHelper/imageURL2Buffer`)).default,
  memberBoostCalc: (await import(`./ClientHelper/memberBoostCalc`)).default,
  userFlagsCalc: (await import(`./ClientHelper/userFlagsCalc`)).default,
  channelRuleCalc: (await import(`./ClientHelper/channelRuleCalc`)).default,
  permCalc: (await import(`./ClientHelper/permCalc`)).default,
  getUnix: (await import(`./ClientHelper/getUnix`)).default,
  getDifference: (await import(`./ClientHelper/getDifference`)).default,
};

export default ch;
