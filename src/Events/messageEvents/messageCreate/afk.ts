import type Eris from 'eris';
import moment from 'moment';
import 'moment-duration-format';
import * as jobs from 'node-schedule';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';
import type CT from '../../../typings/CustomTypings';
import ReactionCollector from '../../../BaseClient/Other/ReactionCollector';

export default async (msg: CT.Message) => {
  if (!msg.author) return;
  if (msg.author.bot) return;
  if (!msg.guild) return;

  const prefix = await (await import('./commandHandler')).getPrefix(msg as Eris.Message);
  if (prefix) {
    const usedCommand: { file: CT.Command | null; triedCMD: undefined } = await (
      await import('./commandHandler')
    ).getCommand(msg.content.replace(/\\n/g, ' ').slice(prefix.length).split(/ +/));
    if (usedCommand.file?.name === 'afk') return;
  }

  doSelfAFKCheck(msg);
  doMentionAFKcheck(msg);
};

const doSelfAFKCheck = async (msg: CT.Message) => {
  const afkRow = await getAfkRow(msg);
  if (!afkRow) return;
  const isOldEnoug = Number(afkRow.since) + 60000 < Date.now();

  if (!isOldEnoug) return;

  const embed = getAFKdeletedEmbed(msg, afkRow);
  const m = await client.ch.reply(msg as Eris.Message, { embeds: [embed] }, msg.language);
  jobs.scheduleJob(new Date(Date.now() + 30000), async () => {
    m?.delete().catch(() => null);
  });

  handleReactions(msg, m as Eris.Message);
  deleteM(m as Eris.Message);
  deleteAfk(msg);
  deleteNickname(msg);
};

const doMentionAFKcheck = (msg: CT.Message) => {
  msg.mentions.forEach(async (mention) => {
    const afkRow = await getAfkRow(msg, mention);
    if (!afkRow) return;

    const embed = getIsAFKEmbed(msg, mention, afkRow);
    const m = await client.ch.reply(msg as Eris.Message, { embeds: [embed] }, msg.language);
    jobs.scheduleJob(new Date(Date.now() + 10000), async () => {
      m?.delete().catch(() => null);
    });
  });
};

const getIsAFKEmbed = (msg: CT.Message, mention: Eris.User, afkRow: DBT.afk) => {
  const embed: Eris.Embed = {
    type: 'rich',
    color: client.ch.colorSelector(msg.guild?.members.get(client.user.id)),
    footer: {
      text: client.ch.stp(msg.language.commands.afk.footer, {
        user: mention,
        time: getTime(afkRow, msg.language),
      }),
    },
  };

  if (afkRow.text) embed.description = afkRow.text;

  return embed;
};

const getAfkRow = (msg: CT.Message, mention?: Eris.User) =>
  client.ch
    .query('SELECT * FROM afk WHERE userid = $1 AND guildid = $2;', [
      mention ? mention.id : msg.author.id,
      msg.guildID,
    ])
    .then((r: DBT.afk[] | null) => (r ? r[0] : null));

const getTime = (afkRow: DBT.afk, language: typeof import('../../../Languages/lan-en.json')) =>
  moment
    .duration(Number(afkRow.since) - Date.now())
    .format(
      ` D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
      { trim: 'all' },
    )
    .replace(/-/g, '');

const deleteNickname = (msg: CT.Message) => {
  if (!msg.member) return;
  const displayname = msg.member.nick || msg.member.username;

  if (!msg.member.nick || !msg.member.nick.endsWith(' [AFK]')) return;
  const newNickname = displayname.slice(0, displayname.length - 6);

  if (!client.ch.isManageable(msg.member, msg.guild?.members.get(client.user.id))) {
    return;
  }

  msg.member
    ?.edit({ nick: newNickname }, msg.language.commands.afkHandler.delAfk)
    .catch(() => null);
};

const deleteAfk = (msg: CT.Message) =>
  client.ch.query('DELETE FROM afk WHERE userid = $1 AND guildid = $2;', [
    msg.author.id,
    msg.guildID,
  ]);

const deleteM = (m: Eris.Message | null) => {
  if (m && m.embeds.length > 1) {
    jobs.scheduleJob(new Date(Date.now() + 10000), async () => {
      m.delete().catch(() => null);
    });
  }
};

const getAFKdeletedEmbed = (msg: CT.Message, afkRow: DBT.afk) => ({
  type: 'rich',
  color: client.ch.colorSelector(msg.guild?.members.get(client.user.id)),
  footer: {
    text: client.ch.stp(msg.language.commands.afkHandler.footer, {
      time: getTime(afkRow, msg.language),
    }),
  },
});

const handleReactions = async (msg: CT.Message, m: Eris.Message | null) => {
  if (!m) return;
  const emote = `${client.objectEmotes.cross.name}:${client.objectEmotes.cross.id}`;

  const reaction = await m.addReaction(emote).catch(() => null);
  if (!reaction) return;

  const reactionsCollector = new ReactionCollector(m, 20000);

  reactionsCollector.on('end', (reason) => {
    if (reason === 'time') m.removeReaction(emote, client.user.id).catch(() => null);
  });

  reactionsCollector.on('collect', (_r, user) => {
    if (user.id !== msg.author.id) return;

    m.delete().catch(() => null);
  });
};
