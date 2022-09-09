import type * as Eris from 'eris';
import client from '../../BaseClient/ErisClient';
import type CT from '../../typings/CustomTypings';
import type DBT from '../../typings/DataBaseTypings';

let messageCache: string[] = [];

export default async (msg: CT.Message, m: Eris.Message) => {
  if (msg) msg.delete().catch(() => null);

  const settingsRow = await getSettings(msg);
  if (!settingsRow) return;

  messageCache.push(msg.author.id);

  await runPunishment(msg, m);

  client.emit('modSourceHandler', m, 'antivirus', settingsRow);
};

export const resetData = () => {
  messageCache = [];
};

const getSettings = async (msg: CT.Message) =>
  client.ch
    .query('SELECT * FROM antivirus WHERE guildid = $1 AND active = true;', [msg.guildID])
    .then((r: DBT.antivirus[] | null) => (r ? r[0] : null));

const runPunishment = async (msg: CT.Message, m: Eris.Message) => {
  if (!msg.guild) return;

  const amountOfTimes = messageCache.filter((a) => a === msg.author.id).length;
  const punishment = await getPunishment(msg, amountOfTimes);

  const obj: CT.ModBaseEventOptions = {
    type: 'warnAdd',
    executor: client.user,
    target: msg.author,
    msg,
    reason: msg.language.autotypes.antivirus,
    guild: msg.guild,
    source: 'antivirus',
    forceFinish: true,
    m,
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
      `SELECT * FROM antiviruspunishments WHERE guildid = $1 AND warnamount = $2 AND active = true;`,
      [msg.guildID, warns],
    )
    .then((r: DBT.BasicPunishmentsTable[] | null) => (r ? r[0] : null));
