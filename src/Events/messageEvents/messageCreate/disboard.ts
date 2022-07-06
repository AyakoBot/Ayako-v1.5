import jobs from 'node-schedule';
import type Eris from 'eris';
import type CT from '../../../typings/CustomTypings';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

export default async (msg: CT.Message) => {
  if (!msg.guild) return;

  if (msg.author.id !== '302050872383242240') return;
  if (!msg.embeds[0]) return;
  if (!msg.embeds[0].color) return;
  if (!msg.embeds[0].image?.url?.includes('bot-command-image-bump.png')) return;

  const settings = await getSettings(msg.guild);
  if (!settings) return;

  const channel = settings.channelid ? msg.guild.channels.get(settings.channelid) : msg.channel;
  if (!channel) return;

  client.disboardBumpReminders.get(msg.guild.id)?.cancel();
  client.disboardBumpReminders.delete(msg.guild.id);

  await msg.addReaction(client.reactionEmotes.tick).catch(() => null);

  await client.ch.query(
    `UPDATE disboard SET nextbump = $1, tempchannelid = $2 WHERE guildid = $3;`,
    [msg.createdAt + 7200000, channel.id, msg.guild.id],
  );

  if (settings.deletereply) msg.delete().catch(() => null);

  setReminder(msg.guild, true, settings, msg.language);
};

const getSettings = async (guild: Eris.Guild) =>
  client.ch
    .query('SELECT * FROM disboard WHERE guildid = $1 AND active = true;', [guild.id])
    .then((r: DBT.disboard[] | null) => (r ? r[0] : null));

const setReminder = async (
  guild: Eris.Guild,
  isBump: boolean,
  settings: DBT.disboard,
  language: typeof import('../../../Languages/lan-en.json'),
) => {
  if (!isBump && !Number(settings.repeatreminder)) {
    client.ch.query(`UPDATE disboard SET nextbump = NULL WHERE guildid = $1;`, [guild.id]);
    return;
  }

  await doDelete(guild, settings);

  client.ch.query(`UPDATE disboard SET nextbump = $1 WHERE guildid = $2;`, [
    Date.now() + (isBump ? 7200000 : Number(settings.repeatreminder) * 60 * 1000),
    guild.id,
  ]);

  client.disboardBumpReminders.set(
    guild.id,
    jobs.scheduleJob(
      new Date(Date.now() + (isBump ? 7200000 : Number(settings.repeatreminder) * 60 * 1000)),
      () => {
        endReminder(guild, language);
      },
    ),
  );
};

export const endReminder = async (
  guild: Eris.Guild,
  language: typeof import('../../../Languages/lan-en.json'),
) => {
  const settings = await getSettings(guild);
  if (!settings) return;

  let channel: Eris.TextChannel;
  if (settings.channelid) {
    channel = guild.channels.get(settings.channelid) as Eris.TextChannel;
  } else if (settings.tempchannelid) {
    channel = guild.channels.get(settings.tempchannelid) as Eris.TextChannel;
  } else return;

  const lan = language.events.ready.disboard;

  const embed: Eris.Embed = {
    type: 'rich',
    author: {
      name: lan.title,
      icon_url:
        'https://cdn.discordapp.com/avatars/302050872383242240/67342a774a9f2d20d62bfc8553bb98e0.png?size=4096',
      url: client.constants.standard.invite,
    },
    description: lan.desc,
    color: client.ch.colorSelector(guild.members.get(client.user.id)),
  };

  const users = settings.users?.map((u) => `<@${u}>`).join(', ') || '';
  const roles = settings.roles?.map((r) => `<@&${r}>`).join(', ') || '';

  const m = await client.ch.send(
    channel,
    { embeds: [embed], content: `${users}\n${roles}` },
    language,
  );
  if (!m || Array.isArray(m)) return;

  await client.ch.query(`UPDATE disboard SET msgid = $1 WHERE guildid = $2;`, [m.id, guild.id]);

  setReminder(guild, false, settings, language);
};

const doDelete = async (guild: Eris.Guild, settings: DBT.disboard) => {
  if (!settings.deletereply) return;
  if (!settings.msgid) return;
  if (!settings.tempchannelid) return;

  const channel = (
    settings.channelid
      ? guild.channels.get(settings.channelid)
      : guild.channels.get(settings.tempchannelid)
  ) as Eris.TextChannel;

  if (!channel) return;

  const message = await channel.getMessage(settings.msgid).catch(() => null);
  if (!message) return;

  message.delete().catch(() => null);
};
