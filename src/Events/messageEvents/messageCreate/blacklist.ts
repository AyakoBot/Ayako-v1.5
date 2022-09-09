import type Eris from 'eris';
import type CT from '../../../typings/CustomTypings';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

let messageCache: string[] = [];

export default async (msg: CT.Message) => {
  if (!msg.guild) return;
  if (!msg.guildID) return;
  if (!msg.content?.length) return;

  const settings = await getSettings(msg);
  if (!settings) return;
  if (!settings.words?.length) return;

  if (
    !msg.member ||
    msg.member.permissions.has(8n) ||
    (settings.bpchannelid && settings.bpchannelid.includes(msg.channel.id)) ||
    (settings.bpuserid && settings.bpuserid.includes(msg.author.id)) ||
    (settings.bproleid && msg.member.roles.some((role) => settings.bproleid?.includes(role)))
  ) {
    return;
  }

  const saidWords = settings.words
    ?.map((word) => {
      if (msg.content.toLowerCase().includes(word.toLowerCase())) return word;
      return null;
    })
    .filter((w): w is string => !!w);

  if (!saidWords.length) return;

  msg.delete().catch(() => null);

  softWarn(msg, saidWords, settings);
  messageCache.push(msg.author.id);

  const amount = messageCache.filter((a) => a === msg.author.id).length;
  if (amount === 1) return;

  runPunishment(msg);
};

const runPunishment = async (msg: CT.Message) => {
  if (!msg.guild) return;

  const amountOfTimes = messageCache.filter((a) => a === msg.author.id).length;
  const punishment = await getPunishment(msg, amountOfTimes);

  const obj: CT.ModBaseEventOptions = {
    type: 'warnAdd',
    executor: client.user,
    target: msg.author,
    msg,
    reason: msg.language.autotypes.blacklist,
    guild: msg.guild,
    source: 'blacklist',
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

export const resetData = () => {
  messageCache = [];
};

const softWarn = async (msg: CT.Message, words: string[], settings: DBT.blacklist) => {
  const embed: Eris.Embed = {
    type: 'rich',
    color: client.constants.colors.warning,
    author: {
      icon_url: client.constants.standard.error,
      url: client.constants.standard.invite,
      name: msg.language.slashCommands.settings.settings.blacklist.authorName,
    },
    description: client.ch.stp(msg.language.slashCommands.settings.settings.blacklist.description, {
      words: settings.words?.map((w) => `\`${w}\``).join(' | '),
    }),
    fields: [
      {
        name: msg.language.slashCommands.settings.settings.blacklist.field,
        value: `${words.map((w) => `\`${w}\``).join(' | ')}`,
        inline: false,
      },
    ],
  };

  client.ch.send(await msg.author.getDMChannel(), { embeds: [embed] }, msg.language);
  client.ch.send(
    msg.channel,
    {
      content: `${msg.author.mention} ${msg.language.mod.warnAdd.blacklist}`,
      allowedMentions: {
        users: [msg.author.id],
      },
    },
    msg.language,
  );
};

const getSettings = async (msg: CT.Message) =>
  client.ch
    .query(`SELECT * FROM blacklist WHERE guildid = $1 AND active = true;`, [msg.guildID])
    .then((r: DBT.blacklist[] | null) => (r ? r[0] : null));

const getPunishment = async (msg: CT.Message, warns: number) =>
  client.ch
    .query(
      `SELECT * FROM blacklistpunishments WHERE guildid = $1 AND warnamount = $2 AND active = true;`,
      [msg.guildID, warns],
    )
    .then((r: DBT.BasicPunishmentsTable[] | null) => (r ? r[0] : null));
