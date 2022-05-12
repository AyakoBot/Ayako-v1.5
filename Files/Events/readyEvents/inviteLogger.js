const jobs = require('node-schedule');

module.exports = () => {
  const client = require('../../BaseClient/DiscordClient');

  jobs.scheduleJob('0 0 0 */1 * *', async () => {
    const invites = await client.ch.getAllInvites(client.guilds.cache.get('298954459172700181'));

    const inviteTxt = client.ch.txtFileWriter(
      invites.map((i) => (i.uses > 9 ? `${i.code} ${i.uses}` : null)).filter((i) => !!i),
    );

    const logChannel = client.channels.cache.get('958483683856228382');
    logChannel.send({ files: [inviteTxt] });
  });
};
