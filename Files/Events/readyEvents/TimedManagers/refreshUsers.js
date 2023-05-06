module.exports = async () => {
  const client = require('../../../BaseClient/DiscordClient');
  const res = await client.ch
    .query(`SELECT * FROM users WHERE lastfetch < $1;`, [Date.now() - 86400000])
    .then((r) => r.rows);

  if (!res.length) return;

  const promises = [];
  res.forEach((r) => {
    const user = client.users.cache.get(r.userid);
    if (!user) promises.push(client.users.fetch(r.userid));
  });
  await Promise.all(promises);

  const update = [];
  res.forEach((r) => {
    const user = client.users.cache.get(r.userid);
    if (user) {
      update.push(
        client.ch.query(
          `UPDATE users SET lastfetch = $1, username = $2, avatar = $3 WHERE userid = $4;`,
          [Date.now(), user.username, user.displayAvatarURL(), user.id],
        ),
      );
    }
  });
  await Promise.all(update);
};
