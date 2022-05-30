const Builders = require('@discordjs/builders');
const jobs = require('node-schedule');

module.exports = {
  execute: async (msg) => {
    if (msg.author.id !== '302050872383242240') return;
    if (!msg.embeds[0]) return;
    if (!msg.embeds[0].data.color) return;
    if (!msg.embeds[0].data.image?.url?.includes('bot-command-image-bump.png')) return;

    const settings = await getSettings(msg);
    if (!settings) return;

    const channel = msg.client.channels.cache.get(settings.channelid) || msg.channel;

    msg.client.disboardBumpReminders.get(msg.guild.id)?.cancel();
    msg.client.disboardBumpReminders.delete(msg.guild.id);

    await msg.react(msg.client.objectEmotes.tick.id).catch(() => {});

    await msg.client.ch.query(
      `UPDATE disboard SET nextbump = $1, tempchannelid = $2 WHERE guildid = $3;`,
      [msg.createdTimestamp + 7200000, channel.id, msg.guild.id],
    );

    setReminder(msg, true, settings);
  },
};

const getSettings = async (msg) => {
  const res = await msg.client.ch.query(
    'SELECT * FROM disboard WHERE guildid = $1 AND active = true;',
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
    .setColor(msg.client.ch.colorSelector(msg.guild.members.me));

  const users = settings.users?.map((u) => `<@${u}>`).join(', ') || '';
  const roles = settings.roles?.map((r) => `<@&${r}>`).join(', ') || '';

  const m = await msg.client.ch.send(channel, { embeds: [embed], content: `${users}\n${roles}` });

  await msg.client.ch.query(`UPDATE disboard SET msgid = $1 WHERE guildid = $2;`, [
    m.id,
    msg.guild.id,
  ]);

  setReminder(msg, false, settings);
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
