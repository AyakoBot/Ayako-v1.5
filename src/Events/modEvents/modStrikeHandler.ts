import type * as Eris from 'eris';
import client from '../../BaseClient/ErisClient';
import type DBT from '../../typings/DataBaseTypings';
import type CT from '../../typings/CustomTypings';
import InteractionCollector from '../../BaseClient/Other/InteractionCollector';

export default async (
  executor: Eris.User,
  target: Eris.User,
  reason: string,
  msg: CT.Message,
  rows: DBT.autopunish[],
  command: CT.Command,
) => {
  const lan = msg.language.mod.strike;
  const con = client.constants.mod.strike;
  if (!rows || !rows.length) {
    const em: Eris.Embed = {
      type: 'rich',
      color: con.color,
      description: client.ch.stp(lan.notEnabled, { prefix: client.constants.standard.prefix }),
    };

    client.ch.reply(msg, { embeds: [em] }, msg.language, command);
    return;
  }

  const existingWarns = await getWarns(msg, target);
  let r = rows.find((re) => Number(re.warnamount) === existingWarns);
  if (!r) return;

  const doPunish = (type: CT.ModBaseEventOptions['type']) => {
    if (!r) return;
    punish(type, executor, target, reason, msg, r);
  };

  if (!r) {
    doPunish('warnAdd');
    return;
  }

  let punNumber = Number(r.punishment);
  if (punNumber < 7 && punNumber > 0) {
    const punishments: CT.ModBaseEventOptions['type'][] = [
      'tempchannelbanAdd',
      'warnAdd',
      'banAdd',
      'tempbanAdd',
      'kickAdd',
      'tempmuteAdd',
      'warnAdd',
    ];

    doPunish(punishments[punNumber]);
    return;
  }
  const higher = isHigher(
    existingWarns,
    rows.map((re) => Number(re.warnamount)),
  );

  if (!higher) {
    doPunish('warnAdd');
    return;
  }
  const neededPunishmentWarnNr = getClosest(
    existingWarns,
    rows.map((re) => Number(re.warnamount)),
  );
  r = rows.find((re) => Number(re.warnamount) === neededPunishmentWarnNr);

  if (!r) {
    doPunish('warnAdd');
    return;
  }

  punNumber = Number(r.punishment);
  if (punNumber < 7 && punNumber > 0) {
    const punishments: CT.ModBaseEventOptions['type'][] = [
      'tempchannelbanAdd',
      'warnAdd',
      'banAdd',
      'tempbanAdd',
      'kickAdd',
      'tempmuteAdd',
      'warnAdd',
    ];

    doPunish(punishments[punNumber]);
    return;
  }
  doPunish('warnAdd');
};

const doRoles = async (r: DBT.autopunish, msg: CT.Message, user: Eris.User) => {
  if (!r) return;
  if (!msg.guildID) return;
  if (!msg.guild) return;

  const member = await client.ch.getMember(user.id, msg.guildID);
  if (!member) return;
  if (r.addroles && r.addroles.length) {
    const roles = checkRoles(r.addroles, msg.guild);
    await client.ch.roleManager.add(member, roles, msg.language.autotypes.autopunish);
  }
  if (r.removeroles && r.removeroles.length) {
    const roles = checkRoles(r.removeroles, msg.guild);
    await client.ch.roleManager.remove(member, roles, msg.language.autotypes.autopunish);
  }
};

const punish = async (
  punishment: CT.ModBaseEventOptions['type'],
  executor: Eris.User,
  target: Eris.User,
  reason: string,
  msg: CT.Message,
  r: DBT.autopunish,
) => {
  const lan = msg.language.mod.strike;
  const con = client.constants.mod.strike;
  await doRoles(r, msg, target);
  if (punishment === 'warnAdd') {
    client.emit('modBaseEvent', { executor, target, reason, msg, guild: msg.guild }, 'warnAdd');
  } else {
    const agreed = await getConfirmation(msg, lan, target, con, r);
    if (!agreed) punishment = 'warnAdd';
    client.emit(
      'modBaseEvent',
      {
        executor,
        target,
        reason,
        msg,
        duration: r.duration ? r.duration : 60,
        guild: msg.guild,
        channel: msg.channel,
      },
      punishment,
    );
  }
};

const getClosest = (num: number, arr: number[]) => {
  arr = arr.reverse();
  let curr = arr[0];
  let diff = Math.abs(num - curr);
  for (let val = 0; val < arr.length; val += 1) {
    const newdiff = Math.abs(num - arr[val]);
    if (newdiff < diff) {
      diff = newdiff;
      curr = arr[val];
    }
  }
  return curr;
};

const isHigher = (num: number, arr: number[]) => {
  for (let i = 0; i < arr.length; i += 1) {
    if (num <= arr[i]) return false;
  }
  return true;
};

const checkRoles = (roles: string[], guild: Eris.Guild) => {
  roles.forEach((r, i) => {
    const role = guild.roles.get(r);
    if (!role || !role.id) roles.splice(i, 1);
  });
  return roles;
};

const getWarns = async (msg: CT.Message, target: Eris.User) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const results = await Promise.all(
    ['warns', 'kicks', 'mutes', 'bans', 'channelbans'].map((table) =>
      client.ch
        .query(`SELECT * FROM punish_${table} WHERE guildid = $1 AND userid = $2;`, [
          msg.guildID,
          target.id,
        ])
        .then((r) => r || null),
    ),
  );

  return results.map((r) => Number(r?.length)).reduce((partialSum, a) => partialSum + a, 0);
};

const getConfirmation = async (
  msg: CT.Message,
  lan: typeof import('../../Languages/lan-en.json')['mod']['strike'],
  target: Eris.User,
  con: typeof client.constants.mod.strike,
  r: DBT.autopunish,
) => {
  if (!r.confirmationreq) return true;

  const embed: Eris.Embed = {
    type: 'rich',
    author: {
      name: lan.confirmEmbed.author,
    },
    description: client.ch.stp(lan.confirmEmbed.description, {
      user: target,
      punishment: msg.language.autopunish[Number(r.punishment)],
    }),
    color: con.color,
  };

  const yes: Eris.Button = {
    type: 2,
    label: msg.language.Yes,
    style: 3,
    custom_id: 'yes',
  };

  const no: Eris.Button = {
    type: 2,
    label: msg.language.No,
    style: 4,
    custom_id: 'no',
  };

  if (!msg.command) return false;
  const m = await client.ch.reply(
    msg,
    {
      embeds: [embed],
      components: client.ch.buttonRower([[yes, no]]),
    },
    msg.language,
    await import('../../Commands/strike'),
  );
  if (!m) return false;

  const agreed = await new Promise((resolve) => {
    const buttonsCollector = new InteractionCollector(m, Number(r.punishmentawaittime) || 60000);

    buttonsCollector.on('collect', (button) => {
      if (button.user.id === msg.author.id) {
        if (button.customId === 'yes') {
          buttonsCollector.stop();
          button.client.ch.edit(button, { components: [] });
          resolve(true);
        } else if (button.customId === 'no') {
          buttonsCollector.stop();
          button.client.ch.edit(button, { components: [] });
          resolve(false);
        }
      } else client.ch.notYours(button, msg.language);
    });

    buttonsCollector.on('end', (endReason) => {
      if (endReason === 'time') resolve(true);
    });
  });

  return agreed;
};
