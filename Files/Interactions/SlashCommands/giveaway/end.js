const Builders = require('@discordjs/builders');
const Discord = require('discord.js');
const client = require('../../../BaseClient/DiscordClient');

module.exports = {
  manualEnd: async (cmd) => {
    const options = cmd.options._hoistedOptions;
    const msgid = options.find((o) => o.name === 'giveaway').value;

    const res = await cmd.client.ch.query(`SELECT * FROM giveaways WHERE msgid = $1;`, [msgid]);
    if (!res || !res.rowCount) return;

    const row = res.rows[0];

    cmd.client.giveaways.get(msgid)?.cancel();
    cmd.client.giveaways.delete(msgid);

    const lan = cmd.language.slashCommands.giveaway.end;

    const embed = new Builders.UnsafeEmbedBuilder()
      .setColor(cmd.client.constants.colors.success)
      .setDescription(lan.manuallyEnded);

    cmd.client.ch.reply(cmd, {
      embeds: [embed],
      ephemeral: true,
      components: cmd.client.ch.buttonRower([
        [
          new Builders.UnsafeButtonBuilder()
            .setURL(
              cmd.client.ch.stp(cmd.client.constants.standard.discordUrlDB, {
                guildid: row.guildid,
                channelid: row.channelid,
                messageid: row.msgid,
              }),
            )
            .setLabel(lan.button)
            .setStyle(Discord.ButtonStyle.Link),
        ],
      ]),
    });

    module.exports.end(row);
  },
  end: async (row, isReroll) => {
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

    await editGiveaway(msg, giveaway, lan, winners, isReroll);

    await client.ch.query(`UPDATE giveaways SET ended = true WHERE msgid = $1 AND guildid = $2;`, [
      msg.id,
      guild.id,
    ]);
    if (!winners.length) return;

    const host = await client.users.fetch(giveaway.host).catch(() => {});

    await sendCongraz(msg, giveaway, lan, winners, host);
    await reward(msg, giveaway, lan, winners, host);
  },
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

const editGiveaway = async (msg, giveaway, lan, winners, isReroll) => {
  const embedData = msg.embeds[0].data;
  if (isReroll) embedData.fields.pop();

  const embed = new Builders.UnsafeEmbedBuilder(embedData).addFields({
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

  await msg.client.ch
    .edit(msg, {
      embeds: [embed],
      components: [],
    })
    .catch(() => {});
};

const getWinners = async (guild, giveaway) => {
  const requests = giveaway.participants
    ?.map((p) => guild.members.fetch(p).catch(() => {}))
    .filter((r) => !!r);

  await Promise.all(requests);

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
