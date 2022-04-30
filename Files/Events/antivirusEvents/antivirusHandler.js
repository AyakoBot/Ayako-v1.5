module.exports = async (msg, rawLink, type) => {
  const link = new URL(rawLink);
  const { client } = msg;
  const user = client.users.cache.get(msg.author.id);
  const { guild } = msg;

  if (msg) msg.delete().catch(() => {});
  msg.source = 'antivirus';

  let amountOfTimes = 0;
  const res = await client.ch.query('SELECT * FROM antiviruslog WHERE userid = $1;', [user.id]);
  if (res && res.rowCount > 0) amountOfTimes = res.rowCount;
  client.ch.query(
    'INSERT INTO antiviruslog (guildid, userid, type, dateofwarn) VALUES ($1, $2, $3, $4);',
    [guild.id, user.id, type, Date.now()],
  );
  amountOfTimes += 1;

  const settingsRes = await client.ch.query(
    'SELECT * FROM antivirus WHERE guildid = $1 AND active = true;',
    [guild.id],
  );
  if (settingsRes && settingsRes.rowCount > 0) {
    const r = settingsRes.rows[0];
    msg.r = r;
    if (+amountOfTimes >= +r.banafterwarnsamount && r.bantof === true) {
      return client.emit('antivirusBanAdd', msg, link);
    }
    if (+amountOfTimes >= +r.kickafterwarnsamount && r.kicktof === true) {
      return client.emit('antivirusKickAdd', msg, link);
    }
    if (+amountOfTimes >= +r.muteafterwarnsamount && r.mutetof === true) {
      return client.emit('antivirusMuteAdd', msg, link);
    }
    if (+amountOfTimes >= +r.warnafterwarnsamount && r.warntof === true) {
      return client.emit('antivirusOfwarnAdd', msg, link);
    }
    if (+amountOfTimes >= 1 && r.verbaltof === true) {
      return client.emit('antivirusWarnAdd', msg, link);
    }
  }
  client.emit('modSourceHandler', msg);

  return null;
};
