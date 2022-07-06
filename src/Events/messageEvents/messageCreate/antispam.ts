import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';
import type CT from '../../../typings/CustomTypings';

const antiSpamSettings = {
  warnThreshold: 7,
  ofwarnThreshold: 10,
  muteThreshold: 13,
  kickThreshold: 16,
  banThreshold: 18,
  maxInterval: 15000,
  maxDuplicatesInterval: 15000,
  maxDuplicatesWarning: 4,
  maxDuplicatesofWarning: 7,
  maxDuplicatesMute: 10,
  maxDuplicatesKick: 13,
  maxDuplicatesBan: 16,
};

let messageCache: {
  content: string;
  author: string;
  time: number;
}[] = [];

export default async (msg: CT.Message) => {
  if (!msg.channel) return;
  if (msg.channel.type === 1 || msg.author.id === client.user.id || msg.author.bot) return;
  let warnnr: number;

  const antispamsettingsRow = await client.ch
    .query(
      'SELECT * FROM antispamsettings WHERE guildid = $1 AND active = true AND forcedisabled = false;',
      [msg.guildID],
    )
    .then((r: DBT.antispamsettings[] | null) => (r ? r[0] : null));

  if (!antispamsettingsRow) return;

  const punishWarnsRows = await client.ch
    .query('SELECT * FROM punish_warns WHERE guildid = $1 AND userid = $2;', [
      msg.guildID,
      msg.author.id,
    ])
    .then((r: DBT.punish_warns[] | null) => r || null);

  if (punishWarnsRows) warnnr = punishWarnsRows.length;
  else warnnr = 1;

  if (
    !msg.member ||
    msg.member.permissions.has(8n) ||
    (antispamsettingsRow.bpchannelid && antispamsettingsRow.bpchannelid.includes(msg.channel.id)) ||
    (antispamsettingsRow.bpuserid && antispamsettingsRow.bpuserid.includes(msg.author.id)) ||
    (antispamsettingsRow.bproleid &&
      msg.member.roles.some((role) => antispamsettingsRow.bproleid?.includes(role)))
  ) {
    return;
  }

  const me = msg.guild?.members.get(client.user.id);
  if (!me) return;

  const banUser = async () => {
    messageCache = messageCache.filter((m) => m.author !== msg.author.id);
    if (!me.permissions.has(4n) && client.ch.isManageable(msg.member, me)) {
      return client.ch.send(
        msg.channel,
        {
          content: client.ch.stp(msg.language.commands.antispamHandler.banErrorMessage, {
            user: msg.author,
          }),
        },
        msg.language,
      );
    }
    return doPunish('banAdd', msg);
  };

  const kickUser = async () => {
    messageCache = messageCache.filter((m) => m.author !== msg.author.id);
    if (!me.permissions.has(2n) && client.ch.isManageable(msg.member, me)) {
      return client.ch.send(
        msg.channel,
        {
          content: client.ch.stp(msg.language.commands.antispamHandler.kickErrorMessage, {
            user: msg.author,
          }),
        },
        msg.language,
      );
    }
    return doPunish('kickAdd', msg);
  };

  const warnUser = async () => softwarn(msg);
  const muteUser = async () => doPunish('tempmuteAdd', msg);
  const ofwarnUser = async () => {
    if (antispamsettingsRow.readofwarnstof === true) {
      if (
        warnnr === Number(antispamsettingsRow.banafterwarnsamount) &&
        antispamsettingsRow.banenabledtof === true
      ) {
        await kickUser();
      } else if (
        warnnr === Number(antispamsettingsRow.kickafterwarnsamount) &&
        antispamsettingsRow.kickenabledtof === true
      ) {
        await banUser();
      } else if (
        warnnr === Number(antispamsettingsRow.muteafterwarnsamount) &&
        antispamsettingsRow.muteenabledtof === true
      ) {
        await muteUser();
      } else doPunish('warnAdd', msg);
    }
    if (antispamsettingsRow.readofwarnstof === false) doPunish('warnAdd', msg);
  };

  messageCache.push({
    content: msg.content,
    author: msg.author.id,
    time: Date.now(),
  });
  const messageMatches = messageCache.filter(
    (m) =>
      m.time > Date.now() - antiSpamSettings.maxDuplicatesInterval &&
      m.content === msg.content &&
      m.author === msg.author.id,
  ).length;
  const spamMatches = messageCache.filter(
    (m) => m.time > Date.now() - antiSpamSettings.maxInterval && m.author === msg.author.id,
  ).length;

  if (
    spamMatches === antiSpamSettings.warnThreshold ||
    messageMatches === antiSpamSettings.maxDuplicatesWarning
  ) {
    warnUser();
    return;
  }
  if (
    (spamMatches === antiSpamSettings.muteThreshold ||
      messageMatches === antiSpamSettings.maxDuplicatesMute) &&
    antispamsettingsRow.muteenabledtof === true
  ) {
    muteUser();
    return;
  }
  if (
    (spamMatches === antiSpamSettings.ofwarnThreshold ||
      messageMatches === antiSpamSettings.maxDuplicatesofWarning) &&
    antispamsettingsRow.giveofficialwarnstof === true
  ) {
    ofwarnUser();
    return;
  }
  if (
    (spamMatches === antiSpamSettings.kickThreshold ||
      messageMatches === antiSpamSettings.maxDuplicatesKick) &&
    antispamsettingsRow.kickenabledtof === true
  ) {
    kickUser();
    return;
  }
  if (
    spamMatches === antiSpamSettings.banThreshold ||
    (messageMatches === antiSpamSettings.maxDuplicatesBan &&
      antispamsettingsRow.banenabledtof === true)
  ) {
    banUser();
  }
};

export const resetData = () => {
  messageCache = [];
};

const doPunish = async (type: CT.ModBaseEventOptions['type'], msg: CT.Message) => {
  if (!msg.guild) return;

  const deleteMessages = async () => {
    const msgs = (await msg.channel.getMessages({ limit: 100 }).catch(() => null)) as
      | Eris.Message[]
      | null;
    if (!msgs) return;

    const delMsgs = msgs
      .filter((m) => m.author.id === msg.author.id)
      .slice(0, 18)
      .map((m) => m.id);

    if (!('deleteMessages' in msg.channel)) return;
    msg.channel.deleteMessages(delMsgs, msg.language.autotypes.antispam);
  };

  await deleteMessages();

  const modBaseEventOptions: CT.ModBaseEventOptions = {
    executor: client.user,
    target: msg.author,
    reason: msg.language.autotypes.antispam,
    msg,
    guild: msg.guild,
    type,
  };

  client.emit('modBaseEvent', modBaseEventOptions);
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
