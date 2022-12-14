const client = require('../../BaseClient/DiscordClient');

module.exports = async () => {
  const w = await client.fetchWebhook(
    '1018292688333832312',
    'WVMQeaLM-PLWFqYxn1J2WK915vdq1TGDuy1qquI3XHtTgl8XCFp86cD_zLYr4FlmxdoL',
  );

  w.send({
    content:
      "If you see __any kind of rule-breaking behaviour__, do not hesitate to **mention @Ayako's Staff**.",
    allowedMentions: { roles: [] },
  });
};
