const jobs = require('node-schedule');
const client = require('../../BaseClient/DiscordClient');

module.exports = async () => {
  const res = await client.ch.query(`SELECT * FROM giveaways WHERE ended = false;`);
  if (!res || !res.rowCount) return;

  res.rows.forEach((row) => {
    if (Number(row.endtime) > Date.now()) {
      const job = jobs.scheduleJob(new Date(Number(row.endtime)), () => {
        require('../../Interactions/SlashCommands/giveaway/end')(row);
      });

      client.giveaways.set(row.msgid, job);
    } else require('../../Interactions/SlashCommands/giveaway/end')(row);
  });
};
