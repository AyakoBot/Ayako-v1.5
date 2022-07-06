import Jobs from 'node-schedule';
import client from '../../../BaseClient/ErisClient';

export default async () => {
  Jobs.scheduleJob('0 0 0 */1 * *', async () => {
    const guild = client.guilds.get('298954459172700181');
    if (!guild) return;

    const invites = await client.ch.getAllInvites(guild);
    if (!invites) return;

    const inviteTxt = client.ch.txtFileWriter(
      invites
        .map((i) => (i.uses > 9 ? `${i.code} ${i.uses}` : null))
        .filter((i): i is string => !!i),
    );
    if (!inviteTxt) return;

    const logChannel = guild.channels.get('958483683856228382');
    const language = await client.ch.languageSelector(guild.id);
    client.ch.send(logChannel, { files: [inviteTxt] }, language);
  });
};
