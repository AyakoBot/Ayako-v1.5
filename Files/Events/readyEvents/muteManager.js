module.exports = {
  async execute() {
    // eslint-disable-next-line global-require
    const client = require('../../BaseClient/DiscordClient');
    const res = await client.ch.query('SELECT * FROM warns WHERE type = $1 AND closed = false;', [
      'Mute',
    ]);
    if (res && res.rowCount > 0) {
      res.rows.forEach(async (row) => {
        const guild = client.guilds.cache.get(row.guildid);
        if (!guild) return;
        let timeLeft = +row.duration - +Date.now();
        const language = await client.ch.languageSelector(guild);
        let msg = await client.channels.cache
          .get(row.warnedinchannelid)
          ?.messages.fetch(row.msgid)
          .catch(() => {});
        if (!msg) msg = { author: client.users.cache.get(row.warnedbyuserid), client };
        msg.language = language;
        msg.client = client;
        msg.guild = guild;
        msg.r = row;
        if (timeLeft <= 0) timeLeft = 100;
        client.mutes.set(
          `${row.guildid}-${row.userid}`,
          setTimeout(
            () =>
              client.emit(
                'modMuteRemove',
                client.user,
                client.users.cache.get(row.userid),
                language.ready.unmute.reason,
                msg,
              ),
            timeLeft,
          ),
        );
      });
    }
  },
};

/*
todo: switch to cron when lag starts

const cron = require('node-cron');
const task = cron.job('1-59 * * * * * *', () => {
	console.log('running a task every second');
	console.log(task);
	console.log(task.start());
	console.log(task.stop());
});
*/
