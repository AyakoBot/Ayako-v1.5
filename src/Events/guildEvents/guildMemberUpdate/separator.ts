// eslint-disable-next-line no-shadow
import { Worker } from 'worker_threads';
import jobs from 'node-schedule';
import type Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

const UpdateWorker = new Worker('./dist/Events/guildEvents/guildMemberUpdate/separatorUpdater.js');
export const separatorAssigner: Map<string, jobs.Job[]> = new Map();

UpdateWorker.on(
  'message',
  async ([text, userData, roleData]: [
    text: string,
    userDate: { userid: string; guildid: string } | null,
    roleData: string[],
  ]) => {
    switch (text) {
      case 'NO_SEP': {
        client.ch.query('UPDATE roleseparator SET active = false WHERE separator = $1;', [
          roleData[0],
        ]);
        break;
      }
      case 'TAKE': {
        if (!userData) return;
        const guild = client.guilds.get(userData.guildid);
        if (!guild) return;
        const member = guild.members.get(userData.userid);
        if (!member) return;
        const language = await client.ch.languageSelector(guild.id);

        client.ch.roleManager.remove(member, roleData, language.autotypes.separators);
        break;
      }
      case 'GIVE': {
        if (!userData) return;
        const guild = client.guilds.get(userData.guildid);
        if (!guild) return;
        const member = guild.members.get(userData.userid);
        if (!member) return;
        const language = await client.ch.languageSelector(guild.id);

        client.ch.roleManager.add(member, roleData, language.autotypes.separators);
        break;
      }
      default: {
        break;
      }
    }
  },
);
UpdateWorker.on('error', (error) => {
  throw error;
});

const isWaiting = new Set();

export default (
  guild: Eris.Guild,
  rawMember: Eris.Member,
  oldMember: Eris.OldMember | { user: Eris.User; id: string },
  language: typeof import('../../../Languages/lan-en.json'),
) => {
  if (
    'roles' in oldMember &&
    oldMember.roles
      .sort((a, b) => Number(guild.roles.get(a)?.position) - Number(guild.roles.get(b)?.position))
      .join(' ') ===
      rawMember.roles
        .sort((a, b) => Number(guild.roles.get(a)?.position) - Number(guild.roles.get(b)?.position))
        .join(' ')
  ) {
    return;
  }

  if (isWaiting.has(`${rawMember.user.id}-${guild.id}`)) return;
  isWaiting.add(`${rawMember.user.id}-${guild.id}`);

  jobs.scheduleJob(new Date(Date.now() + 2000), async () => {
    isWaiting.delete(`${rawMember.user.id}-${guild.id}`);

    const member = await client.ch.getMember(rawMember.user.id, guild.id);
    if (!member) return;

    const stillrunning = await client.ch
      .query('SELECT stillrunning FROM roleseparatorsettings WHERE guildid = $1;', [guild.id])
      .then((r: DBT.roleseparatorsettings[] | null) => (r ? r[0].stillrunning : null));
    if (stillrunning) return;

    const roleseparatorRows = await client.ch
      .query('SELECT * FROM roleseparator WHERE active = true AND guildid = $1;', [guild.id])
      .then((r: DBT.roleseparator[] | null) => r || null);
    if (!roleseparatorRows) return;

    const map = new Map();
    guild.roles.map((r) => r).forEach((r) => map.set(r.id, r));

    UpdateWorker.postMessage({
      roles: member.roles,
      guildid: guild.id,
      userid: member.user.id,
      guildroles: map,
      highest: guild.roles.map((r) => r).sort((a, b) => b.position - a.position)[0],
      res: roleseparatorRows,
      language,
    });
  });
};

export const oneTimeRunner = async (
  msg: { guildID: string; author: Eris.User; channel: Eris.AnyGuildChannel },
  m: Eris.Message,
  embed: Eris.Embed,
  clickButton?: Eris.ComponentInteraction | null,
  lastTime?: boolean,
) => {
  if (!msg.guildID) return;
  const guild = client.guilds.get(msg.guildID);
  if (!guild) return;
  const language = await client.ch.languageSelector(guild.id);

  const roleseparatorRows = await client.ch
    .query('SELECT * FROM roleseparator WHERE active = true AND guildid = $1;', [msg.guildID])
    .then((r: DBT.roleseparator[] | null) => r || null);
  if (!roleseparatorRows) return;

  let membersWithRoles:
    | boolean
    | {
        id: string;
        roles: { id: string; position: number }[];
        giveTheseRoles: string[];
        takeTheseRoles: string[];
      }[]
    | null;

  if (
    (await client.ch
      .query('SELECT stillrunning FROM roleseparatorsettings WHERE guildid = $1;', [msg.guildID])
      .then((r: DBT.roleseparatorsettings[] | null) => (r ? r[0].stillrunning : null))) &&
    msg.author.id !== client.user.id
  ) {
    membersWithRoles = true;
  } else {
    client.ch.query('UPDATE roleseparatorsettings SET stillrunning = $2 WHERE guildid = $1;', [
      msg.guildID,
      true,
    ]);
    membersWithRoles = await getMembers(guild, roleseparatorRows);
  }

  embed.author = {
    name: client.ch.stp(language.slashCommands.settings.author, {
      type: language.slashCommands.settings.separators.type,
    }),
    icon_url: client.objectEmotes.settings.link,
    url: client.constants.standard.invite,
  };

  if (clickButton) await clickButton.deleteOriginalMessage().catch(() => null);

  if (!Array.isArray(membersWithRoles)) {
    if (!membersWithRoles) {
      embed.description = language.slashCommands.settings.separators.edit.oneTimeRunner.finished;

      client.ch.edit(m, { embeds: [embed], components: [] });
    } else {
      embed.description =
        language.slashCommands.settings.separators.edit.oneTimeRunner.stillrunning;

      client.ch.edit(m, { embeds: [embed], components: [] });
    }
  } else {
    membersWithRoles.forEach((mem) => {
      const fakeMember = mem;
      const realMember = guild.members.get(m.id);

      if (realMember) {
        if (fakeMember.giveTheseRoles) {
          fakeMember.giveTheseRoles.forEach((roleID, rindex) => {
            if (realMember.roles.includes(roleID)) {
              mem.giveTheseRoles.splice(rindex, 1);
            }
          });
        }
        if (fakeMember.takeTheseRoles) {
          fakeMember.takeTheseRoles.forEach((roleID, rindex) => {
            if (!realMember.roles.includes(roleID)) {
              mem.takeTheseRoles.splice(rindex, 1);
            }
          });
        }
      }
    });
    const finishTime = Math.floor(
      Date.now() / 1000 +
        (membersWithRoles ? membersWithRoles.length * 4 : 0) +
        ((membersWithRoles ? membersWithRoles.length : 0) / 3600) * 400,
    );

    embed.author = {
      name: client.ch.stp(language.slashCommands.settings.author, {
        type: language.slashCommands.settings.separators.type,
      }),
      icon_url: client.objectEmotes.settings.link,
      url: client.constants.standard.invite,
    };
    embed.description = client.ch.stp(
      language.slashCommands.settings.separators.edit.oneTimeRunner.stats,
      {
        members: membersWithRoles && membersWithRoles.length ? membersWithRoles.length : '0',
        roles: membersWithRoles && membersWithRoles.length ? membersWithRoles.length * 4 : '0',
        finishTime: `<t:${finishTime}:F> (<t:${finishTime}:R>)`,
      },
    );

    client.ch.edit(m, { embeds: [embed], components: [] });
    client.ch.query(
      'UPDATE roleseparatorsettings SET stillrunning = $1, duration = $3, startat = $4, channelid = $5, messageid = $6 WHERE guildid = $2;',
      [
        true,
        msg.guildID,
        Math.floor(Date.now() / 1000) + membersWithRoles.length * 4,
        Date.now(),
        msg.channel.id,
        m.id,
      ],
    );
    assinger(msg, m, membersWithRoles, embed, language, lastTime);
  }
};

type PassObject = {
  members: { id: string; roles: { id: string; position: number }[] }[];
  separators: {
    separator: { id: string; position: number };
    stoprole?: { id: string; position: number };
  }[];
  rowroles: {
    id: string;
    position: number;
  }[];
  roles: { id: string; position: number }[];
  highestRole: { id: string; position: number };
  clientHighestRole: { id: string; position: number };
};

const getMembers = async (
  guild: Eris.Guild,
  roleseparatorRows: DBT.roleseparator[],
): Promise<
  | {
      id: string;
      roles: {
        id: string;
        position: number;
      }[];
      giveTheseRoles: string[];
      takeTheseRoles: string[];
    }[]
  | null
> => {
  await guild.getRESTMembers().catch(() => null);

  const highestRole = guild.roles.map((o) => o).sort((a, b) => b.position - a.position)[0];
  const clientHighestRoleID = guild.members
    .get(client.user.id)
    ?.roles.sort(
      (a, b) => Number(guild.roles.get(b)?.position) - Number(guild.roles.get(a)?.position),
    )[0];
  if (!clientHighestRoleID) return null;

  const clientHighestRole = guild.roles.get(clientHighestRoleID);
  if (!clientHighestRole) return null;

  const obj: PassObject = {
    members: [],
    separators: [],
    rowroles: [],
    roles: [],
    highestRole: {
      id: highestRole.id,
      position: highestRole.position,
    },
    clientHighestRole: {
      id: clientHighestRole.id,
      position: clientHighestRole.position,
    },
  };

  guild.members.forEach((member) => {
    const roles: { id: string; position: number }[] = [];

    member.roles.forEach((rID) => {
      const role = guild.roles.get(rID);
      if (!role) return;

      roles.push({ id: role.id, position: role.position });
    });

    obj.members.push({ id: member.user.id, roles });
  });

  guild.roles.forEach((role) => {
    obj.roles.push({ id: role.id, position: role.position });
  });

  roleseparatorRows.forEach((r) => {
    const separator = guild.roles.get(r.separator);
    if (!separator) return;

    if (r.stoprole) {
      const stoprole = guild.roles.get(r.stoprole);
      if (!stoprole) return;

      obj.separators.push({
        separator: {
          id: r.separator,
          position: separator.position,
        },
        stoprole: { id: r.stoprole, position: stoprole.position },
      });
    } else {
      obj.separators.push({
        separator: {
          id: r.separator,
          position: separator.position,
        },
      });
    }

    if (r.roles && r.roles.length) {
      obj.roles.forEach((objRole) => {
        const role = guild.roles.get(objRole.id);
        if (!role) return;

        obj.rowroles.push({ id: role.id, position: role.position });
      });
    }
  });

  const worker = new Worker('./dist/Events/guildEvents/guildMemberUpdate/separatorWorker.js', {
    workerData: { res: roleseparatorRows, obj },
  });

  return new Promise((resolve, reject) => {
    worker.once('message', (result) => {
      resolve(result);
      worker.terminate();
    });
    worker.once('error', (error) => {
      reject();
      throw error;
    });
  });
};

const assinger = async (
  msg: { guildID: string; author: Eris.User; channel: Eris.AnyGuildChannel },
  m: Eris.Message,
  membersWithRoles: {
    id: string;
    roles: {
      id: string;
      position: number;
    }[];
    giveTheseRoles: string[];
    takeTheseRoles: string[];
  }[],
  embed: Eris.Embed,
  language: typeof import('../../../Languages/lan-en.json'),
  lastTime?: boolean,
) => {
  if (!msg.guildID) return;
  const guild = client.guilds.get(msg.guildID);
  if (!guild) return;

  if (!membersWithRoles?.length) {
    embed.author = {
      name: client.ch.stp(language.slashCommands.settings.author, {
        type: language.slashCommands.settings.separators.type,
      }),
      icon_url: client.objectEmotes.settings.link,
      url: client.constants.standard.invite,
    };

    embed.description = language.slashCommands.settings.separators.edit.oneTimeRunner.finished;
    client.ch.edit(m, { embeds: [embed], components: [] });
    client.ch.query(
      'UPDATE roleseparatorsettings SET stillrunning = $1, duration = $3, startat = $4 WHERE guildid = $2;',
      [false, msg.guildID, null, null],
    );

    return;
  }

  if (!separatorAssigner.get(msg.guildID)) separatorAssigner.set(msg.guildID, []);
  const thisMap = separatorAssigner.get(msg.guildID);
  if (!thisMap) return;

  membersWithRoles.forEach((raw, index) => {
    thisMap.push(
      jobs.scheduleJob(new Date(Date.now() + index * 3000), async () => {
        const member = guild.members.get(raw.id);

        if (member) {
          client.ch.roleManager.add(member, raw.giveTheseRoles, language.autotypes.separators, 2);
          client.ch.roleManager.remove(
            member,
            raw.takeTheseRoles,
            language.autotypes.separators,
            2,
          );
        }

        if (index === membersWithRoles.length - 1 && lastTime) {
          embed.author = {
            name: client.ch.stp(language.slashCommands.settings.author, {
              type: language.slashCommands.settings.separators.type,
            }),
            icon_url: client.objectEmotes.settings.link,
            url: client.constants.standard.invite,
          };
          embed.description =
            language.slashCommands.settings.separators.edit.oneTimeRunner.finished;

          client.ch.edit(m, { embeds: [embed], components: [] });
          client.ch.query(
            'UPDATE roleseparatorsettings SET stillrunning = $1, duration = $3, startat = $4 WHERE guildid = $2;',
            [false, msg.guildID, null, null],
          );

          return;
        }

        if (index === membersWithRoles.length - 1) {
          oneTimeRunner(msg, m, embed, null, true);
          return;
        }

        client.ch.query(
          'UPDATE roleseparatorsettings SET index = $1, length = $3 WHERE guildid = $2;',
          [index, msg.guildID, membersWithRoles.length - 1],
        );
      }),
    );
  });
};
