const Builders = require('@discordjs/builders');
const client = require('../../../BaseClient/DiscordClient');

module.exports = async (row) => {
  const guild = client.guilds.cache.get(row.guildid);
  if (!guild) return;

  const channel = client.channels.cache.get(row.channelid);
  if (!channel) return;

  const giveaway = await getGiveaway(row);
  if (!giveaway) return;

  const msg = await channel.messages.fetch(giveaway.msgid).catch(() => {});
  if (!msg) return;

  const language = await client.ch.languageSelector(guild);
  msg.language = language;
  const lan = language.slashCommands.giveaway.end;
  const winners = await getWinners(guild, giveaway);

  await editGiveaway(msg, giveaway, lan, winners);

  await client.ch.query(`UPDATE giveaways SET ended = true WHERE msgid = $1 AND guildid = $2;`, [
    msg.id,
    guild.id,
  ]);
  if (!winners.length) return;

  const host = await client.users.fetch(giveaway.host).catch(() => {});

  await sendCongraz(msg, giveaway, lan, winners, host);
  await reward(msg, giveaway, lan, winners, host);
};

const sendCongraz = async (msg, giveaway, lan, winners, host) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setColor(client.constants.colors.success)
    .setAuthor({ name: lan.author, url: client.constants.standard.invite })
    .setTitle(lan.title)
    .setURL(msg.url)
    .addFields({
      name: giveaway.actualprize ? lan.checkDMs : lan.getPrize,
      value: `${host} / \`${host.tag}\` / \`${host.id}\``,
    });

  await client.ch.reply(msg, {
    embeds: [embed],
    content: winners.map((winner) => `${winner}`).join(', '),
  });
};

const reward = async (msg, giveaway, lan, winners, host) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setColor(client.constants.colors.success)
    .setAuthor({ name: lan.author, url: client.constants.standard.invite })
    .setTitle(lan.title)
    .setURL(msg.url);

  if (giveaway.actualprize) {
    embed.setDescription(giveaway.actualprize);
    if (host) {
      embed.addFields({ name: lan.trouble, value: `${host} / \`${host.tag}\` / \`${host.id}\`` });
    }
  } else {
    embed.addFields({ name: lan.getPrize, value: `${host} / \`${host.tag}\` / \`${host.id}\`` });
  }

  winners.forEach((winner) => {
    winner.send({ embeds: [embed] }).catch(() => {
      client.ch.error(msg, client.ch.stp(lan.couldntDM, { user: winner }), null, 5000);
    });
  });
};

const getGiveaway = async (row) => {
  const res = await client.ch.query('SELECT * FROM giveaways WHERE guildid = $1 AND msgid = $2;', [
    row.guildid,
    row.msgid,
  ]);
  if (!res || !res.rowCount) return null;
  return res.rows[0];
};

const editGiveaway = async (msg, giveaway, lan, winners) => {
  const embed = new Builders.UnsafeEmbedBuilder(msg.embeds[0].data).addFields({
    name: giveaway.winnercount === 1 ? lan.winner : lan.winners,
    value: `${
      winners.length
        ? winners
            .map((winner) => `${winner} / \`${winner.user.tag}\` / \`${winner.user.id}\``)
            .join('\n')
        : lan.noValidEntries
    }`,
    inline: false,
  });
  embed.data.author.name += ` | ${lan.ended}`;

  await msg.edit({ embeds: [embed], components: [] }).catch(() => {});
};

const getWinners = async (guild, giveaway) => {
  await guild.members.fetch().catch(() => {});

  const validEntries =
    giveaway.participants && giveaway.participants.length
      ? giveaway.participants.filter(
          (id) =>
            guild.members.cache.get(id) &&
            (!giveaway.reqrole || guild.members.cache.get(id).roles.cache.has(giveaway.reqrole)),
        )
      : [];
  const winners = [];

  for (let i = 0; i < giveaway.winnercount && validEntries.length; i += 1) {
    const random = Math.floor(Math.random() * validEntries.length);

    winners.push(guild.members.cache.get(validEntries[random]));
    validEntries.splice(random, 1);
  }

  return winners;
};
