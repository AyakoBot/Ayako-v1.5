import type * as Eris from 'eris';
import ms from 'ms';
import jobs from 'node-schedule';
import type CT from '../../../typings/CustomTypings';
import client from '../../../BaseClient/ErisClient';

export default async (
  cmd: CT.CommandInteraction,
  {
    language,
    lan: lang,
  }: {
    language: typeof import('../../../Languages/en.json');
    lan: typeof import('../../../Languages/en.json')['slashCommands']['giveaway'];
  },
) => {
  if (!cmd.guild) return;
  if (!cmd.data.options?.[0]) return;
  if (!('options' in cmd.data.options[0])) return;
  const { options } = cmd.data.options[0];
  if (!options) return;

  const channel = cmd.guild.channels.get(
    client.ch.util.checkVal(options.find((o) => o.name === 'channel')) as string,
  ) as Eris.GuildTextableChannel;
  if (!channel) return;

  const description = client.ch.util.checkVal(
    options.find((o) => o.name === 'prize-description'),
  ) as string;

  const winnerCount = client.ch.util.checkVal(options.find((o) => o.name === 'winners')) as number;
  const rawTime = client.ch.util.checkVal(options.find((o) => o.name === 'time')) as string;
  const collectTimeRaw = client.ch.util.checkVal(
    options.find((o) => o.name === 'collect-prize-time'),
  ) as string;

  const roleID = client.ch.util.checkVal(options.find((o) => o.name === 'role')) as string | null;
  const role = roleID ? cmd.guild.roles.get(roleID) : null;

  const actualPrize = client.ch.util.checkVal(options.find((o) => o.name === 'actual-prize')) as
    | string
    | undefined;

  const hostArg = client.ch.util.checkVal(options.find((o) => o.name === 'host')) as string | null;
  const host = hostArg ? client.users.get(hostArg) || cmd.user : cmd.user;

  const perms = channel?.permissionsOf(client.user.id);
  const lan = lang.create;

  if (!perms?.has(3072n)) {
    client.ch.error(cmd, lan.missingPermissions, language);
    return;
  }

  const endtime = getEndTime(rawTime, true);
  if (!endtime) {
    client.ch.error(cmd, lan.invalidTime, language);
    return;
  }

  const collectTime = getEndTime(collectTimeRaw) || undefined;

  const m = await createGiveaway(
    cmd,
    lan,
    language,
    description,
    role,
    endtime,
    winnerCount,
    host,
    channel,
  );

  if (!m) {
    client.ch.error(cmd, lan.error, language);
    return;
  }

  const embed: Eris.Embed = {
    type: 'rich',
    color: client.constants.colors.success,
    description: client.ch.stp(lan.sent, { channel }),
  };

  client.ch.reply(cmd, { embeds: [embed], ephemeral: true });

  client.giveaways.set(
    `${m.id}-${m.guildID}`,
    jobs.scheduleJob(new Date(Number(endtime)), async () => {
      if (!cmd.guildID) return;

      (await import('./end')).end(
        {
          guildid: cmd.guildID,
          channelid: channel.id,
          msgid: m.id,
          description,
          winnercount: String(winnerCount),
          endtime: String(endtime),
          reqrole: role?.id,
          actualprize: actualPrize,
          host: host.id,
          ended: false,
          collecttime: collectTime,
        },
        lang.end,
        language,
      );
    }),
  );

  await client.ch.query(
    `INSERT INTO giveaways
  (guildid, msgid, description, winnercount, endtime, reqrole, actualprize, host, ended, channelid, collecttime) VALUES 
  ($1, $2, $3, $4, $5, $6, $7, $8, false, $9, $10);`,
    [
      cmd.guild.id,
      m.id,
      description,
      winnerCount,
      endtime,
      role?.id,
      actualPrize,
      host.id,
      channel.id,
      collectTime,
    ],
  );
};

const createGiveaway = (
  cmd: CT.CommandInteraction,
  lan: typeof import('../../../Languages/en.json')['slashCommands']['giveaway']['create'],
  language: typeof import('../../../Languages/en.json'),
  description: string,
  role: Eris.Role | null | undefined,
  endtime: number,
  winnerCount: number,
  host: Eris.User,
  channel: Eris.GuildTextableChannel,
) => {
  const embed: Eris.Embed = {
    type: 'rich',
    author: {
      name: lan.author,
      icon_url: client.objectEmotes.gift.link,
      url: client.constants.standard.invite,
    },
    color: client.ch.colorSelector(cmd.guild?.members.get(client.user.id)),
    description,
    title: `0 ${lan.participants}`,
    fields: [
      {
        name: `${lan.winners} ${winnerCount}`,
        value: `${lan.end} <t:${String(endtime).slice(0, -3)}:R> (<t:${String(endtime).slice(
          0,
          -3,
        )}>)`,
      },
    ],
    footer: {
      text: `${lan.host}: ${host.username}#${host.discriminator}`,
      icon_url: host.avatarURL,
    },
  };

  if (role) {
    embed.fields?.push({
      name: lan.roleRequire,
      value: `<@&${role.id}>`,
      inline: true,
    });
  }

  const participateButton: Eris.Button = {
    type: 2,
    custom_id: 'giveawayParticipate',
    label: lan.participate,
    style: 2,
    emoji: client.objectEmotes.gift,
  };

  return client.ch.send(
    channel,
    {
      embeds: [embed],
      components: client.ch.buttonRower([[participateButton]]),
    },
    language,
  );
};

const getEndTime = (value: string, addDateNow?: boolean) => {
  const args = value
    .split(/ +/)
    .map((a) => (ms(a.replace(/,/g, '.')) ? ms(a.replace(/,/g, '.')) : a));

  let skip: number;
  const timeArgs = args.map((a, i) => {
    if (i === skip) return null;
    if (ms(`${a} ${args[i + 1]}`)) {
      skip = i + 1;
      return ms(`${a} ${args[i + 1]}`);
    }
    return ms(`${a}`);
  });

  const endTime = timeArgs
    .filter((a) => !!a)
    .reduce((a, b) => Number(a) + Number(b), addDateNow ? Date.now() : 0);
  return endTime;
};
