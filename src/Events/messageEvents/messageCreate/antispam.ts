import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';
import type CT from '../../../typings/CustomTypings';

let messageCache: {
  content: string;
  author: string;
  time: number;
}[] = [];

const getSettings = async (msg: CT.Message) =>
  client.ch
    .query(
      'SELECT * FROM antispam WHERE guildid = $1 AND active = true AND forcedisabled = false;',
      [msg.guildID],
    )
    .then((r: DBT.antispam[] | null) => (r ? r[0] : null));

export default async (msg: CT.Message) => {
  if (!msg.channel) return;
  if (!msg.guild) return;
  if (msg.channel.type === 1 || msg.author.id === client.user.id || msg.author.bot) return;

  const antispam = await getSettings(msg);
  if (!antispam) return;

  if (
    !msg.member ||
    msg.member.permissions.has(8n) ||
    (antispam.wlchannelid && antispam.wlchannelid.includes(msg.channel.id)) ||
    (antispam.wluserid && antispam.wluserid.includes(msg.author.id)) ||
    (antispam.wlroleid && msg.member.roles.some((role) => antispam.wlroleid?.includes(role)))
  ) {
    return;
  }

  const me = msg.guild?.members.get(client.user.id);
  if (!me) return;

  const warnUser = async () => softwarn(msg);

  messageCache.push({
    content: msg.content,
    author: msg.author.id,
    time: Date.now(),
  });

  const dupeMatches = messageCache.filter(
    (m) =>
      m.time > Date.now() - Number(antispam.timeout) &&
      m.content === msg.content &&
      m.author === msg.author.id,
  ).length;

  const normalMatches = messageCache.filter(
    (m) => m.time > Date.now() - Number(antispam.timeout) && m.author === msg.author.id,
  ).length;

  if (
    antispam.verbal &&
    (dupeMatches === antispam.dupemsgthreshold || normalMatches === antispam.msgthreshold)
  ) {
    warnUser();
    return;
  }

  const matches = normalMatches > dupeMatches ? normalMatches : dupeMatches;
  deleteMessages(msg, matches);

  (await import('../../modEvents/modStrikeHandler')).default(
    client.user,
    msg.author,
    msg.language.autotypes.antispam,
    msg,
  );
};

const deleteMessages = async (msg: CT.Message, matches: number) => {
  const msgs = (await msg.channel.getMessages({ limit: 100 }).catch(() => null)) as
    | Eris.Message[]
    | null;
  if (!msgs) return;

  const delMsgs = msgs
    .filter((m) => m.author.id === msg.author.id)
    .slice(0, matches)
    .map((m) => m.id);

  if (!('deleteMessages' in msg.channel)) return;
  msg.channel.deleteMessages(delMsgs, msg.language.autotypes.antispam);
};

export const resetData = () => {
  messageCache = [];
};

const softwarn = (msg: CT.Message) => {
  client.ch.send(
    msg.channel,
    {
      content: `${msg.author} ${msg.language.mod.warnAdd.antispam.description}`,
      allowedMentions: {
        users: [msg.author.id],
      },
    },
    msg.language,
  );
};
