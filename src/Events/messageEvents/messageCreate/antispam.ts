import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';
import type CT from '../../../typings/CustomTypings';

let messageCache: {
  content: string;
  author: string;
  time: number;
}[] = [];

let authorCache: string[] = [];

export default async (msg: CT.Message) => {
  if (!msg.channel) return;
  if (!msg.guild) return;
  if (msg.channel.type === 1 || msg.author.id === client.user.id || msg.author.bot) return;

  const antispam = await getSettings(msg);
  if (!antispam) return;
  if (antispam.forcedisabled) return;

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
  );

  const normalMatches = messageCache.filter(
    (m) => m.time > Date.now() - Number(antispam.timeout) && m.author === msg.author.id,
  );

  if (
    (dupeMatches.length === Number(antispam.dupemsgthreshold) - 3 ||
      normalMatches.length === Number(antispam.msgthreshold) - 3) &&
    !authorCache.includes(msg.author.id)
  ) {
    softwarn(msg);
    authorCache.push(msg.author.id);
    return;
  }

  if (
    dupeMatches.length < Number(antispam.dupemsgthreshold) &&
    normalMatches.length < Number(antispam.msgthreshold)
  ) {
    return;
  }

  authorCache.push(msg.author.id);

  if (
    (normalMatches.length - Number(antispam.msgthreshold)) % 3 === 0 ||
    (dupeMatches.length - Number(antispam.dupemsgthreshold)) % 3 === 0
  ) {
    deleteMessages(
      msg,
      normalMatches.length > dupeMatches.length ? normalMatches.length : dupeMatches.length,
      antispam,
    );
    runPunishment(msg);
  }
};

const runPunishment = async (msg: CT.Message) => {
  if (!msg.guild) return;

  const allPunishments = authorCache.filter((a) => a === msg.author.id).length;
  const punishment = await getPunishment(msg, allPunishments);

  const obj: CT.ModBaseEventOptions = {
    type: 'warnAdd',
    executor: client.user,
    target: msg.author,
    msg,
    reason: msg.language.autotypes.antispam,
    guild: msg.guild,
    source: 'antispam',
    forceFinish: true,
  };

  if (!punishment) {
    client.emit('modBaseEvent', obj);
    return;
  }

  obj.duration = Number(punishment.duration);

  switch (punishment.punishment) {
    case 'ban': {
      obj.type = 'banAdd';
      break;
    }
    case 'kick': {
      obj.type = 'kickAdd';
      break;
    }
    case 'tempban': {
      obj.type = 'tempbanAdd';
      break;
    }
    case 'channelban': {
      obj.type = 'channelbanAdd';
      break;
    }
    case 'tempchannelban': {
      obj.type = 'tempchannelbanAdd';
      break;
    }
    case 'tempmute': {
      obj.type = 'tempmuteAdd';
      break;
    }
    default: {
      break;
    }
  }

  client.emit('modBaseEvent', obj);
};

const getPunishment = async (msg: CT.Message, warns: number) =>
  client.ch
    .query(
      `SELECT * FROM antispampunishments WHERE guildid = $1 AND warnamount = $2 AND active = true;`,
      [msg.guildID, warns],
    )
    .then((r: DBT.BasicPunishmentsTable[] | null) => (r ? r[0] : null));

const deleteMessages = async (msg: CT.Message, matches: number, antispam: DBT.antispam) => {
  if (!antispam.deletespam) return;

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
  authorCache = [];
  messageCache = [];
};

const softwarn = (msg: CT.Message) => {
  client.ch.send(
    msg.channel,
    {
      content: `${msg.author.mention} ${msg.language.mod.warnAdd.antispam}`,
      allowedMentions: {
        users: [msg.author.id],
      },
    },
    msg.language,
  );
};

const getSettings = async (msg: CT.Message) =>
  client.ch
    .query(
      'SELECT * FROM antispam WHERE guildid = $1 AND active = true AND forcedisabled = false;',
      [msg.guildID],
    )
    .then((r: DBT.antispam[] | null) => (r ? r[0] : null));
