import type * as Eris from 'eris';
import Jobs from 'node-schedule';
import type CT from '../../../typings/CustomTypings';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

export const manualEnd = async (
  cmd: CT.CommandInteraction,
  {
    lan: lang,
    language,
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

  const msgid = client.ch.util.checkVal(options.find((o) => o.name === 'giveaway'));

  const giveawaysRow = await client.ch
    .query(`SELECT * FROM giveaways WHERE msgid = $1;`, [msgid])
    .then((r: DBT.giveaways[] | null) => (r ? r[0] : null));
  if (!giveawaysRow) return;

  client.giveaways.get(`${giveawaysRow.msgid}-${giveawaysRow.guildid}`)?.cancel();
  client.giveaways.delete(`${giveawaysRow.msgid}-${giveawaysRow.guildid}`);

  const lan = lang.end;

  const embed: Eris.Embed = {
    type: 'rich',
    color: client.constants.colors.success,
    description: lan.manuallyEnded,
  };

  const getToGiveawayButton: Eris.Button = {
    type: 2,
    url: client.ch.stp(client.constants.standard.discordUrlDB, {
      guildid: giveawaysRow.guildid,
      channelid: giveawaysRow.channelid,
      messageid: giveawaysRow.msgid,
    }),
    label: lan.button,
    style: 5,
  };

  client.ch.reply(cmd, {
    embeds: [embed],
    ephemeral: true,
    components: client.ch.buttonRower([[getToGiveawayButton]]),
  });

  end(giveawaysRow, lan, language);
};

export const end = async (
  row: DBT.giveaways,
  lan: typeof import('../../../Languages/en.json')['slashCommands']['giveaway']['end'],
  language: typeof import('../../../Languages/en.json'),
  isReroll?: boolean,
) => {
  const guild = client.guilds.get(row.guildid);
  if (!guild) return;

  const channel = guild.channels.get(row.channelid) as Eris.GuildTextableChannel;
  if (!channel) return;

  const msg = await channel.getMessage(row.msgid).catch(() => null);
  if (!msg) return;

  const winners = await getWinners(guild, row);

  const host = await client.ch.getUser(row.host).catch(() => null);
  if (!host) return;

  await editGiveaway(msg, row, lan, winners, isReroll);

  await client.ch.query(`UPDATE giveaways SET ended = true WHERE msgid = $1 AND guildid = $2;`, [
    msg.id,
    guild.id,
  ]);
  if (!winners.length) return;

  const claimEnd = Number(row.endtime) + Number(row.collecttime);

  await sendCongraz(msg, row, lan, winners, host);
  const sentMessages = await reward(msg, row, lan, language, winners, host, claimEnd);
  if (row.collecttime) applyCollectTimeout(winners, row, claimEnd, sentMessages);
};

const sendCongraz = async (
  msg: Eris.Message<Eris.TextChannel> | Eris.Message<Eris.TextVoiceChannel>,
  giveaway: DBT.giveaways,
  lan: typeof import('../../../Languages/en.json')['slashCommands']['giveaway']['end'],
  winners: Eris.Member[],
  host: Eris.User,
) => {
  const embed: Eris.Embed = {
    type: 'rich',
    color: client.constants.colors.success,
    author: {
      name: lan.author,
      url: client.constants.standard.invite,
    },
    title: lan.title,
    url: msg.jumpLink,
    fields: [
      {
        name: giveaway.actualprize ? lan.checkDMs : lan.getPrize,
        value: `${host} / \`${host.username}#${host.discriminator}\` / \`${host.id}\``,
      },
    ],
  };

  await client.ch.reply(msg, {
    embeds: [embed],
    content: winners.map((winner) => `${winner}`).join(', '),
  });
};

const reward = async (
  msg: Eris.Message<Eris.TextChannel> | Eris.Message<Eris.TextVoiceChannel>,
  giveaway: DBT.giveaways,
  lan: typeof import('../../../Languages/en.json')['slashCommands']['giveaway']['end'],
  language: typeof import('../../../Languages/en.json'),
  winners: Eris.Member[],
  host: Eris.User,
  claimEnd: number,
) => {
  const embed: Eris.Embed = {
    type: 'rich',
    color: client.constants.colors.success,
    author: { name: lan.author, url: client.constants.standard.invite },
    title: lan.title,
    url: msg.jumpLink,
    fields: [],
  };

  if (giveaway.actualprize) {
    embed.description = `${lan.clickButton}${
      giveaway.collecttime
        ? `\n${client.ch.stp(lan.limitedTime, {
            inTime: `<t:${String(claimEnd).slice(0, -3)}R>`,
            time: `<t:${String(claimEnd).slice(0, -3)}F>`,
          })}`
        : ''
    }`;
    if (host) {
      embed.fields?.push({
        name: lan.trouble,
        value: `${host} / \`${host.username}#${host.discriminator}\` / \`${host.id}\``,
      });
    }
  } else {
    embed.fields?.push({
      name: lan.getPrize,
      value: `${host} / \`${host.username}#${host.discriminator}\` / \`${host.id}\``,
    });
  }

  const sentMessages: Map<string, string> = new Map();

  await new Promise((res) => {
    winners.forEach(async (winner, i) => {
      const error = () =>
        client.ch.error(msg, client.ch.stp(lan.couldntDM, { user: winner }), language);

      const dm = await winner.user.getDMChannel().catch(() => null);
      if (dm) {
        const m = await client.ch.send(dm, { embeds: [embed] }, language).catch(() => {
          error();
          return null;
        });

        if (m) sentMessages.set(winner.user.id, m.id);
      } else error();
      if (i === winners.length) res(true);
    });
  });

  return sentMessages;
};

const editGiveaway = async (
  msg: Eris.Message<Eris.TextChannel> | Eris.Message<Eris.TextVoiceChannel>,
  giveaway: DBT.giveaways,
  lan: typeof import('../../../Languages/en.json')['slashCommands']['giveaway']['end'],
  winners: Eris.Member[],
  isReroll?: boolean,
) => {
  const embed = msg.embeds[0];
  if (isReroll) embed.fields?.pop();

  if (!embed.fields) embed.fields = [];

  embed.fields.push({
    name: Number(giveaway.winnercount) === 1 ? lan.winner : lan.winners,
    value: `${
      winners.length
        ? winners
            .map(
              (winner) =>
                `${winner} / \`${winner.user.username}#${winner.user.discriminator}\` / \`${winner.user.id}\``,
            )
            .join('\n')
        : lan.noValidEntries
    }`,
    inline: false,
  });
  if (embed.author) embed.author.name += ` | ${lan.ended}`;

  await msg
    .edit({
      embeds: [embed],
      components: [],
    })
    .catch(() => null);
};

const getWinners = async (guild: Eris.Guild, giveaway: DBT.giveaways) => {
  const requests = giveaway.participants?.map((p) => client.ch.getMember(p, guild.id));
  if (requests && requests.length) await Promise.all(requests);

  const validEntries =
    giveaway.participants && giveaway.participants.length
      ? giveaway.participants.filter(
          (id) =>
            guild.members.get(id) &&
            (!giveaway.reqrole || guild.members.get(id)?.roles.includes(giveaway.reqrole)),
        )
      : [];
  const winners = [];

  for (
    let i = 0;
    i < Number(giveaway.winnercount) && validEntries.length !== Number(giveaway.winnercount);
    i += 1
  ) {
    const random = Math.floor(Math.random() * validEntries.length);

    const member = guild.members.get(validEntries[random]);
    if (member) {
      winners.push(member);
      validEntries.splice(random, 1);
    }
  }

  return winners;
};

const applyCollectTimeout = (
  winners: Eris.Member[],
  row: DBT.giveaways,
  claimEnd: number,
  sentMessages: Map<string, string>,
) => {
  winners.forEach((winner) => {
    const sentMessage = sentMessages.get(winner.user.id);
    if (!sentMessage) return;

    client.ch.query(
      `INSERT INTO giveawaycollecttime (userid, giveaway, endtime, msgid) VALUES ($1, $2, $3, $4);`,
      [winner.user.id, row.msgid, claimEnd, sentMessage],
    );

    client.giveawayClaimTimeout.set(
      `${row.msgid}-${winner.user.id}`,
      Jobs.scheduleJob(new Date(claimEnd), async () => {
        runTimeEnded(row, winner.user, sentMessage, claimEnd);
      }),
    );
  });
};

export const runTimeEnded = async (
  row: DBT.giveaways,
  user: Eris.User,
  msgID: string,
  claimEnd: number,
) => {
  client.giveawayClaimTimeout.delete(`${row.msgid}-${user.id}`);
  client.ch.query(
    `DELETE FROM giveawaycollecttime WHERE userid = $1 AND endtime = $2 AND msgid = $3 AND giveaway = $4;`,
    [user.id, claimEnd, msgID, row.msgid],
  );

  const dm = await user.getDMChannel().catch(() => null);
  if (!dm) return;

  const m = await dm.getMessage(msgID).catch(() => null);
  if (!m) return;

  const guild = client.guilds.get(row.guildid);
  if (!guild) return;

  const giveawayChannel = guild.channels.get(row.channelid) as Eris.GuildTextableChannel;
  if (!giveawayChannel) return;

  const giveawayMsg = await giveawayChannel.getMessage(row.msgid).catch(() => null);
  if (!giveawayMsg) return;

  const language = await client.ch.languageSelector(null);
  const lan = language.slashCommands.giveaway.end;

  const embed: Eris.Embed = {
    type: 'rich',
    color: client.constants.colors.warning,
    description: lan.timeRanOut,
    url: giveawayMsg.jumpLink,
    fields: [],
  };

  m.edit({ embeds: [embed], components: [] }).catch(() => null);
};
