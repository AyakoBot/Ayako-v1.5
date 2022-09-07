import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';
import type CT from '../../../typings/CustomTypings';

let messageCache: {
  content: string;
  author: string;
  time: number;
}[] = [];

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
  ).length;

  const normalMatches = messageCache.filter(
    (m) => m.time > Date.now() - Number(antispam.timeout) && m.author === msg.author.id,
  ).length;

  if (
    antispam.verbal &&
    (dupeMatches === Number(antispam.dupemsgthreshold) - 2 ||
      normalMatches === Number(antispam.msgthreshold) - 2)
  ) {
    softwarn(msg);
    return;
  }

  const matches = normalMatches > dupeMatches ? normalMatches : dupeMatches;
  deleteMessages(msg, matches, antispam);

  if (
    dupeMatches === Number(antispam.dupemsgthreshold) ||
    normalMatches === Number(antispam.msgthreshold)
  ) {
    runPunishment(msg);
  }
};

const runPunishment = async (msg: CT.Message) => {
  if (!msg.guild) return;

  const allPunishments = (await getAllPunishments(msg))?.flat(1) || [];
  const punishment = await getPunishment(msg, allPunishments.length);

  const obj: CT.ModBaseEventOptions = {
    type: 'warnAdd',
    executor: client.user,
    target: msg.author,
    msg,
    reason: msg.language.autotypes.antispam,
    guild: msg.guild,
    source: 'antispam',
  };

  if (!punishment) {
    client.emit('modBaseEvent', obj);
    return;
  }

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

  if (obj.type.includes('temp')) obj.duration = Number(punishment.duration);

  client.emit('modBaseEvent', obj);
};

const getAllPunishments = async (msg: CT.Message) =>
  client.ch
    .query(
      `SELECT * FROM punish_bans WHERE guildid = $1 AND userid = $2 AND active = true;
  SELECT * FROM punish_channelbans WHERE guildid = $1 AND userid = $2 AND active = true;
  SELECT * FROM punish_mutes WHERE guildid = $1 AND userid = $2 AND active = true;
  SELECT * FROM punish_kicks WHERE guildid = $1 AND userid = $2 AND active = true;
  SELECT * FROM punish_warns WHERE guildid = $1 AND userid = $2 AND active = true;`,
      [msg.guildID, msg.author.id],
    )
    .then(
      (
        r:
          | (
              | DBT.punish_bans[]
              | DBT.punish_channelbans[]
              | DBT.punish_kicks[]
              | DBT.punish_mutes[]
              | DBT.punish_warns[]
            )[]
          | null,
      ) => r,
    );

const getPunishment = async (msg: CT.Message, warns: number) =>
  client.ch
    .query(`SELECT * FROM antispampunishments WHERE guildid = $1 AND warnamount = $2;`, [
      msg.guildID,
      warns,
    ])
    .then((r: DBT.antispampunishments[] | null) => (r ? r[0] : null));

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

const getSettings = async (msg: CT.Message) =>
  client.ch
    .query(
      'SELECT * FROM antispam WHERE guildid = $1 AND active = true AND forcedisabled = false;',
      [msg.guildID],
    )
    .then((r: DBT.antispam[] | null) => (r ? r[0] : null));
