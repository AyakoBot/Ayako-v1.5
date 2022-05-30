const jobs = require('node-schedule');

module.exports = async () => {
  const client = require('../../BaseClient/DiscordClient');
  const res = await client.ch.query('SELECT * FROM punish_tempbans;');

  if (!res || !res.rowCount) return;

  res.rows.forEach(async (row) => {
    const guild = client.guilds.cache.get(row.guildid);
    if (!guild) return;

    let timeLeft = Number(row.duration);
    const language = await client.ch.languageSelector(guild);
    const msg = await client.channels.cache
      .get(row.channelid)
      ?.messages.fetch(row.msgid)
      .catch(() => {});

    if (timeLeft <= 0) timeLeft = 100;

    client.bans.set(
      `${row.guildid}-${row.userid}`,
      jobs.scheduleJob(`${row.guildid}-${row.userid}`, new Date(Date.now() + timeLeft), () =>
        client.emit(
          'modBaseEvent',
          {
            target: client.users.cache.get(row.userid),
            executor: client.user,
            reason: language.ready.unban.reason,
            guild,
            msg,
            forceFinish: true,
          },
          'banRemove',
        ),
      ),
    );
  });
};
