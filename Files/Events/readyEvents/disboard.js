const Builders = require('@discordjs/builders');
const jobs = require('node-schedule');

module.exports = async () => {
  const client = require('../../BaseClient/DiscordClient');
  const res = await client.ch.query('SELECT * FROM disboard WHERE active = true;');

  if (!res || !res.rowCount) return;

  for (let i = 0; i < res.rows.length; i += 1) {
    const guild = client.guilds.cache.get(res.rows[i].guildid);
    if (!guild) return;

    const channel = client.channels.cache.get(res.rows[i].channelid);
    if (!channel) return;

    if (Number(res.rows[i].nextbump) <= Date.now()) endReminder({ client, guild });
    else {
      client.disboardBumpReminders.set(
        guild.id,
        jobs.scheduleJob(new Date(Number(res.rows[i].nextbump)), () => {
          endReminder({ client, guild });
        }),
      );
    }
  }
};

const endReminder = async (msg) => {
  const settings = await getSettings(msg);
  if (!settings) return;

  const channel =
    msg.client.channels.cache.get(settings.channelid) ||
    msg.client.channels.cache.get(settings.tempchannelid);

  if (!channel) return;

  const language = await msg.client.ch.languageSelector(msg.guild);
  const lan = language.ready.disboard;

  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: lan.title,
      iconURL:
        'https://cdn.discordapp.com/avatars/302050872383242240/67342a774a9f2d20d62bfc8553bb98e0.webp?size=4096',
      url: msg.client.constants.standard.invite,
    })
    .setDescription(lan.desc)
    .setColor(msg.client.ch.colorSelector(msg.guild.me));

  const users = settings.users?.map((u) => `<@${u}>`).join(', ') || '';
  const roles = settings.roles?.map((r) => `<@&${r}>`).join(', ') || '';

  const m = await msg.client.ch.send(channel, { embeds: [embed], content: `${users}\n${roles}` });

  await msg.client.ch.query(`UPDATE disboard SET msgid = $1 WHERE guildid = $2;`, [
    m.id,
    msg.guild.id,
  ]);

  setReminder(msg, false, settings);
};

const getSettings = async (msg) => {
  const res = await msg.client.ch.query(
    'SELECT * FROM disboard WHERE guildid = $1 AND active = true AND nextbump IS NOT NULL;',
    [msg.guild.id],
  );

  if (res && res.rowCount) return res.rows[0];
  return null;
};

const setReminder = async (msg, isBump, settings) => {
  if (!isBump && !Number(settings.repeatreminder)) {
    msg.client.ch.query(`UPDATE disboard SET nextbump = NULL WHERE guildid = $1;`, [msg.guild.id]);
    return;
  }

  await doDelete(msg, settings);

  msg.client.ch.query(`UPDATE disboard SET nextbump = $1 WHERE guildid = $2;`, [
    Date.now() + (isBump ? 7200000 : settings.repeatreminder * 60 * 1000),
    msg.guild.id,
  ]);

  msg.client.disboardBumpReminders.set(
    msg.guild.id,
    jobs.scheduleJob(
      new Date(Date.now() + (isBump ? 7200000 : settings.repeatreminder * 60 * 1000)),
      () => {
        endReminder(msg);
      },
    ),
  );
};

const doDelete = async (msg, settings) => {
  if (!settings.deletereply || !settings.msgid) return;

  msg.delete().catch(() => {});
  const channel = msg.client.channels.cache.get(settings.channelid) || msg.channel;
  if (!channel) return;
  const message = await channel.messages.fetch(settings.msgid).catch(() => {});
  if (!message) return;

  message.delete().catch(() => {});
};
