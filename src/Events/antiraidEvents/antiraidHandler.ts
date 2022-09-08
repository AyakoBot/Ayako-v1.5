import * as confusables from 'confusables';
import type * as Eris from 'eris';
import type DBT from '../../typings/DataBaseTypings';
import client from '../../BaseClient/ErisClient';

type Language = typeof import('../../Languages/lan-en.json');

export default async (
  data: { time: number; joins: number },
  guild: Eris.antiraid,
  r: DBT.antiraid,
  language: Language,
) => {
  if (data.joins) checkAll(guild, language, r, data);
};

const checkAll = async (
  guild: Eris.Guild,
  language: Language,
  r: DBT.antiraid,
  { time }: { time: number },
) => {
  const memberIDs = await getMemberIDs(guild, time, Number(r.time));

  const buffers = await Promise.all(
    memberIDs.map(async (id) =>
      client.ch.fileURL2Buffer([client.users.get(id)?.avatarURL || null]),
    ),
  );

  const newIDs = memberIDs
    .map((id, index) => {
      const isSamePFP = checkPFP(memberIDs, buffers, index);
      const isSameNick = checkNick(id, memberIDs);
      const isSimilarID = checkID(id, memberIDs);

      if (isSamePFP || isSameNick || isSimilarID) {
        return id;
      }
      return null;
    })
    .filter((u): u is string => !!u);

  const similarUsers = getSimilarUsers(newIDs, guild);

  run(guild, language, r, [...new Set([...newIDs, ...similarUsers])]);
};

const run = (guild: Eris.Guild, language: Language, r: DBT.antiraid, members: string[]) => {
  if (r.posttof) sendMessage(guild, language, r, members);
  if (r.punishmenttof) {
    if (r.punishment) {
      doPunish('banAdd', members, language.autotypes.antiraid, guild, language);
    }
    if (!r.punishment) {
      doPunish('kickAdd', members, language.autotypes.antiraid, guild, language);
    }
  }
};

const sendMessage = (
  guild: Eris.Guild,
  language: Language,
  r: DBT.antiraid,
  members: string[],
) => {
  if (!r.postchannel) return;
  const lan = language.commands.antiraidHandler;

  const con = client.constants.antiraidMessage;
  const embed: Eris.Embed = {
    type: 'rich',
    author: {
      name: lan.debugMessage.author,
      icon_url: con.image,
    },
    color: con.color,
    description: `${lan.debugMessage.description}\n${lan.debugMessage.file}`,
  };

  const channel = guild.channels.get(r.postchannel);
  if (channel) {
    const pingRoles = r.pingroles?.map((role) => `<@&${role}>`);
    const pingUsers = r.pingusers?.map((user) => `<@${user}>`);
    const files = [
      client.ch.txtFileWriter(
        members.map((u) => `${u}`),
        'antiraid',
      ),
    ].filter((f) => !!f) as Eris.FileContent[];

    const printIDs: Eris.Button = {
      type: 2,
      label: lan.debugMessage.printIDs,
      custom_id: 'antiraid_print_ids',
      style: 2,
      disabled: !files.length,
    };

    const massban: Eris.Button = {
      type: 2,
      label: lan.debugMessage.massban,
      custom_id: 'antiraid_massban',
      style: 3,
    };

    client.ch.send(
      channel,
      {
        embeds: [embed],
        content: `${pingRoles || ''}\n${pingUsers || ''}`,
        files,
        components: client.ch.buttonRower([[printIDs, massban]]),
      },
      language,
    );
  }
};

const checkNick = (id: string, ids: string[]) => {
  const returns = ids
    .map((checkedWithID) => {
      const checkedWithUser = client.users.get(checkedWithID);
      if (!checkedWithUser) return false;
      const user = client.users.get(id);
      if (!user) return false;

      if (confusables.remove(checkedWithUser.username) === confusables.remove(user.username)) {
        return true;
      }
      return false;
    })
    .filter((r) => !!r);

  return returns.length >= 3;
};

const checkID = (id: string, ids: string[]) => {
  const returns = ids
    .map((checkedWithID) => {
      if (checkedWithID.slice(0, 2) === id.slice(0, 2)) {
        return true;
      }
      return false;
    })
    .filter((r) => !!r);

  return returns.length >= 3;
};

const checkPFP = (
  ids: string[],
  buffers: ({
    file: Buffer;
    name: string;
  } | null)[][],
  currentIndex: number,
) => {
  const returns = ids
    .map((_, i) => {
      const thisIDbuffer = buffers[currentIndex][0]?.file;
      if (!thisIDbuffer) return false;
      const checkedIDbuffer = buffers[i][0]?.file;
      if (!checkedIDbuffer) return false;

      if (thisIDbuffer.equals(checkedIDbuffer)) return true;
      return false;
    })
    .filter((r) => !!r);

  return returns.length >= 3;
};

const getSimilarUsers = (ids: string[], guild: Eris.Guild) => {
  let otherUsers: string[] = [];

  ids.forEach((id) => {
    const user = guild.members.get(id)?.user;
    if (!user) return;
    const otherUsersFilter = guild.members.filter((m) => m.user.username === user.username);

    otherUsers = [...otherUsers, ...otherUsersFilter.map((m) => m.user.id)];
  });

  return otherUsers;
};

const getMemberIDs = async (guild: Eris.Guild, timestamp: number, time: number) => {
  const memberIDs = guild.members
    .map((member) => {
      if (Number(member.joinedAt) > timestamp - time) {
        return member.user.id;
      }
      return null;
    })
    .filter((m): m is string => !!m);

  return memberIDs;
};

const doPunish = async (
  type: 'banAdd' | 'kickAdd',
  targets: string[],
  reason: string,
  guild: Eris.Guild,
  language: typeof import('../../Languages/lan-en.json'),
) => {
  let punishments;
  if (type === 'banAdd') {
    const banPromises = targets.map((target) =>
      guild.banMember(target, 7, reason).catch((e) => `${target} | ${e}`),
    );
    punishments = await Promise.all(banPromises);
  } else {
    const kickPromises = targets.map((target) =>
      guild.kickMember(target, reason).catch((e) => `${target} | ${e}`),
    );
    punishments = await Promise.all(kickPromises);
  }

  if (!punishments) return;

  const files = client.ch.txtFileWriter(
    punishments.map((punishment, i) =>
      typeof punishment !== 'string'
        ? `User ID ${targets[i]} | User Tag: ${client.users.get(targets[i])?.username || 'unknown'}`
        : punishment,
    ),
  );

  const logchannelsRow = (
    await client.ch
      .query('SELECT modlogs FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].modlogs : null))
  )?.map((id) => guild.channels.get(id));
  if (!logchannelsRow) return;

  const con = client.constants.mod[type];
  const lan = language.antiraid[type];

  const embed: Eris.Embed = {
    type: 'rich',
    color: con.color,
    author: {
      name: client.ch.stp(lan.author, {
        amount: punishments.filter((b) => typeof b === 'string').length,
        url: client.constants.standard.invite,
      }),
    },
    fields: [{ name: language.reason, value: `${reason}` }],
  };

  client.ch.send(
    logchannelsRow,
    files ? { embeds: [embed], files: [files] } : { embeds: [embed] },
    language,
    null,
    10000,
  );
};
