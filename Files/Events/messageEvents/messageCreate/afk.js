const moment = require('moment');
require('moment-duration-format');
const jobs = require('node-schedule');

module.exports = {
  async execute(msg) {
    if (!msg.author) return;
    if (msg.author.bot) return;
    if (!msg.guild) return;
    let checkedMsg = await require('./commandHandler').prefix(msg);
    if (checkedMsg) [checkedMsg] = checkedMsg;

    const res = await msg.client.ch.query('SELECT * FROM afk WHERE userid = $1 AND guildid = $2;', [
      msg.author.id,
      msg.guild.id,
    ]);
    const language = await msg.client.ch.languageSelector(msg.guild);

    if (res && res.rowCount > 0) {
      if (+res.rows[0].since + 60000 < Date.now()) {
        if (checkedMsg?.command.name === 'afk') return;
        const m = await msg.client.ch.reply(
          msg,
          msg.client.ch.stp(language.commands.afkHandler.deletedAfk, {
            time: moment
              .duration(Date.now() - +res.rows[0].since)
              .format(
                ` D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
              )
              .replace(/-/g, ''),
          }),
        );
        if (m) {
          jobs.scheduleJob(new Date(Date.now() + 10000), async () => {
            m.delete().catch(() => {});
          });
        }
        msg.client.ch.query('DELETE FROM afk WHERE userid = $1;', [msg.author.id]);
      }
    }
    let mentioned = msg.mentions.users;
    mentioned = mentioned.map((o) => o);
    mentioned.forEach(async (mention) => {
      const afkRes = await msg.client.ch.query(
        'SELECT * FROM afk WHERE userid = $1 AND guildid = $2;',
        [mention.id, msg.guild.id],
      );
      if (afkRes && afkRes.rowCount > 0) {
        msg.client.ch.reply(
          msg,
          `${
            afkRes.rows[0].text
              ? msg.client.ch.stp(language.commands.afk.afkText2, {
                  username: mention.username,
                  slice: afkRes.rows[0].text,
                })
              : msg.client.ch.stp(language.commands.afk.afkText, { username: mention.username })
          } ${moment
            .duration(+afkRes.rows[0].since - Date.now())
            .format(
              ` D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
            )
            .replace(/-/g, '')}`,
        );
      }
    });
  },
};
