import type * as Eris from 'eris';
import ms from 'ms';
import jobs from 'node-schedule';
import type CT from '../../../typings/CustomTypings';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

export default async (
  cmd: CT.CommandInteraction,
  {
    lan: lang,
    language,
  }: {
    language: typeof import('../../../Languages/lan-en.json');
    lan: typeof import('../../../Languages/lan-en.json')['slashCommands']['giveaway'];
  },
) => {
  if (!cmd.guild) return;
  if (!cmd.data.options?.[0]) return;
  if (!('options' in cmd.data.options[0])) return;
  const { options } = cmd.data.options[0];
  if (!options) return;

  const lan = lang.edit;

  if (options.length === 1) {
    client.ch.error(cmd, lan.noOptionsProvided, language);
    return;
  }

  const description = client.ch.util.checkVal(
    options.find((o) => o.name === 'prize-description'),
  ) as string;

  const winnerCount = client.ch.util.checkVal(options.find((o) => o.name === 'winners')) as
    | number
    | null;
  const rawTime = client.ch.util.checkVal(options.find((o) => o.name === 'time')) as string | null;

  const roleID = client.ch.util.checkVal(options.find((o) => o.name === 'role')) as string | null;
  const role = roleID ? cmd.guild.roles.get(roleID) : null;

  const actualPrize = client.ch.util.checkVal(options.find((o) => o.name === 'actual-prize')) as
    | string
    | undefined;

  const hostArg = client.ch.util.checkVal(options.find((o) => o.name === 'host')) as string | null;
  const host = hostArg ? client.users.get(hostArg) || cmd.user : cmd.user;

  const msgid = client.ch.util.checkVal(options.find((o) => o.name === 'giveaway')) as string;

  const insert = {
    endtime: rawTime ? handleEndTime(cmd, rawTime, { lan, language }) : undefined,
    description: description || undefined,
    winnercount: winnerCount || undefined,
    reqrole: role?.id || undefined,
    actualprize: actualPrize || undefined,
    host: host.id || undefined,
  };

  if (!insert.endtime) delete insert.endtime;
  if (!insert.description) delete insert.description;
  if (!insert.winnercount) delete insert.winnercount;
  if (!insert.reqrole) delete insert.reqrole;
  if (!insert.actualprize) delete insert.actualprize;
  if (!insert.host) delete insert.host;

  if (!Object.keys(insert).length) {
    client.ch.error(cmd, lan.noChanges, language);
    return;
  }

  let updateQuery = 'UPDATE giveaways SET '; // `
  const args: string[] = [];

  Object.entries(insert).forEach(([key, val], i) => {
    updateQuery += `${key} = $${i + 2}`;
    args.push(val as string);
    if (i < Object.keys(insert).length - 1) updateQuery += ', ';
  });

  await client.ch.query(`${updateQuery} WHERE msgid = $1;`, [msgid, ...args]);
  const updatedGiveaway = await client.ch
    .query(`SELECT * FROM giveaways WHERE msgid = $1;`, [msgid])
    .then((r: DBT.giveaways[] | null) => (r ? r[0] : null));
  if (!updatedGiveaway) return;

  if (insert.endtime) rescheduleGiveaway(updatedGiveaway, msgid, language, lang);

  if (description || winnerCount || role || rawTime || host) {
    updateEmbed(cmd, updatedGiveaway);
  }

  const getToGiveawayButton: Eris.Button = {
    type: 2,
    url: client.ch.stp(client.constants.standard.discordUrlDB, {
      guildid: updatedGiveaway.guildid,
      channelid: updatedGiveaway.channelid,
      messageid: updatedGiveaway.msgid,
    }),
    label: lan.button,
    style: 5,
  };

  client.ch.reply(
    cmd,
    {
      content: lan.success,
      ephemeral: true,
      components: client.ch.buttonRower([[getToGiveawayButton]]),
    },
    language,
  );
};

const rescheduleGiveaway = (
  giveaway: DBT.giveaways,
  msgid: string,
  language: typeof import('../../../Languages/lan-en.json'),
  lan: typeof import('../../../Languages/lan-en.json')['slashCommands']['giveaway'],
) => {
  client.giveaways.get(msgid)?.cancel();

  client.giveaways.set(
    msgid,
    jobs.scheduleJob(new Date(Number(giveaway.endtime)), async () => {
      (await import('./end')).end(giveaway, lan.end, language);
    }),
  );
};

const handleEndTime = (
  cmd: CT.CommandInteraction,
  rawTime: string,
  {
    lan,
    language,
  }: {
    language: typeof import('../../../Languages/lan-en.json');
    lan: typeof import('../../../Languages/lan-en.json')['slashCommands']['giveaway']['edit'];
  },
) => {
  const endtime = getEndTime(rawTime);
  if (!endtime) {
    client.ch.error(cmd, lan.invalidTime, language);
    return null;
  }
  return endtime;
};

const getEndTime = (value: string) => {
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

  const endTime = timeArgs.filter((a) => !!a).reduce((a, b) => Number(a) + Number(b), Date.now());
  return endTime;
};

const updateEmbed = async (cmd: CT.CommandInteraction, giveaway: DBT.giveaways) => {
  if (!cmd.guild) return;

  const lan = cmd.language.slashCommands.giveaway.create;
  const host = (await client.ch.getUser(giveaway.host).catch(() => null)) || cmd.user;

  const channel = cmd.guild.channels.get(giveaway.channelid) as Eris.GuildTextableChannel;
  if (!channel) return;

  const message = await channel.getMessage(giveaway.msgid);
  if (!message) return;

  const embed: Eris.Embed = {
    type: 'rich',
    author: {
      name: lan.author,
      icon_url: client.objectEmotes.gift.link,
      url: client.constants.standard.invite,
    },
    color: client.ch.colorSelector(cmd.guild.members.get(client.user.id)),
    description: giveaway.description,
    title: `${Number(giveaway.participants?.length || 0)} ${lan.participants}`,
    fields: [
      {
        name: `${lan.winners} ${giveaway.winnercount}`,
        value: `${lan.end} <t:${String(giveaway.endtime).slice(0, -3)}:R> (<t:${String(
          giveaway.endtime,
        ).slice(0, -3)}>)`,
      },
    ],
    footer: {
      text: `${lan.host}: ${host.username}#${host.discriminator}`,
      icon_url: host.avatarURL,
    },
  };

  if (giveaway.reqrole) {
    embed.fields?.push({
      name: lan.roleRequire,
      value: `<@&${giveaway.reqrole}>`,
      inline: true,
    });
  }

  const participateButton: Eris.Button = {
    type: 2,
    style: 2,
    label: lan.participate,
    custom_id: 'giveawayParticipate',
    emoji: client.objectEmotes.gift,
  };

  client.ch.edit(message, {
    embeds: [embed],
    components: client.ch.buttonRower([[participateButton]]),
  });
};
