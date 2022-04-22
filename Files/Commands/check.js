const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  name: 'check',
  perm: null,
  dm: false,
  takesFirstArg: false,
  aliases: ['warnlog', 'warnings'],
  type: 'mod',
  execute: async (msg) => {
    const user = msg.args[0]
      ? await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {})
      : msg.author;

    if (!user) {
      msg.client.ch.error(msg, msg.language.errors.userNotFound);
      return;
    }

    const member = await msg.guild.members.fetch(user.id).catch(() => {});
    const allPunishments = await getAllPunishments(msg, user);
    const { m, embed } = await baseMessage(msg, allPunishments, user);

    const punishmentStatus = await getCurrentPunishments(msg, user, member, allPunishments);

    const currentStatusField = getCurrentStatusField(msg, embed, user, punishmentStatus);
    embed.data.fields = [];
    embed.setFields(currentStatusField);

    const page = 1;
    const baseButtons = getBaseButtons(msg, null, allPunishments, page);

    await m.edit({ embeds: [embed], components: msg.client.ch.buttonRower(baseButtons) });

    const buttonsCollector = m.createMessageComponentCollector({ time: 60000 });

    let selected;
    handleEnd(buttonsCollector, msg, m);
    handleInteractions(buttonsCollector, msg, allPunishments, selected, page, embed);
  },
};

const baseMessage = async (msg, allPunishments, user) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setDescription(
      msg.client.ch.stp(msg.lan.text, {
        warns: String(
          Number(allPunishments.length ? allPunishments.filter((p) => p.type === 0).length : 0),
        ),
        mutes: String(
          Number(allPunishments.length ? allPunishments.filter((p) => p.type === 1).length : 0),
        ),
        kicks: String(
          Number(allPunishments.length ? allPunishments.filter((p) => p.type === 2).length : 0),
        ),
        channelbans: String(
          Number(allPunishments.length ? allPunishments.filter((p) => p.type === 3).length : 0),
        ),
        bans: String(
          Number(allPunishments.length ? allPunishments.filter((p) => p.type === 4).length : 0),
        ),
      }),
    )
    .addFields({
      name: '\u200b',
      value: `${msg.client.textEmotes.timedoutUpdated} ${msg.lan.muteLoad} ${msg.client.textEmotes.loading}\n${msg.client.textEmotes.banUpdated} ${msg.lan.banLoad} ${msg.client.textEmotes.loading}\n${msg.client.textEmotes.mutedUpdated} ${msg.lan.channelbanLoad} ${msg.client.textEmotes.loading}`,
      inline: false,
    })
    .setAuthor({
      name: msg.client.ch.stp(msg.lan.author, { target: user }),
      iconURL: msg.client.objectEmotes.warning.link,
      url: msg.client.constants.standard.invite,
    })
    .setColor(msg.client.ch.colorSelector(msg.guild.me));

  return { m: await msg.client.ch.reply(msg, { embeds: [embed] }), embed };
};

const getAllPunishments = async (msg, target) => {
  const res = await Promise.all(
    ['warns', 'mutes', 'kicks', 'channelbans', 'bans'].map((table) =>
      msg.client.ch.query(`SELECT * FROM punish_${table} WHERE guildid = $1 AND userid = $2;`, [
        msg.guild.id,
        target.id,
      ]),
    ),
  );

  res.forEach((r, i) =>
    r.rows?.forEach((row) => {
      row.type = i;
    }),
  );

  const [warnRes, kickRes, muteRes, banRes, channelbanRes] = res;

  let allWarns = [];
  if (warnRes && warnRes.rowCount) allWarns = allWarns.concat(warnRes.rows);
  if (kickRes && kickRes.rowCount) allWarns = allWarns.concat(kickRes.rows);
  if (muteRes && muteRes.rowCount) allWarns = allWarns.concat(muteRes.rows);
  if (banRes && banRes.rowCount) allWarns = allWarns.concat(banRes.rows);
  if (channelbanRes && channelbanRes.rowCount) allWarns = allWarns.concat(channelbanRes.rows);

  return allWarns;
};

const getCurrentPunishments = async (msg, user, member, allPunishments) => {
  const getChannelBans = async () => {
    const getPendingTempChannelbans = async () => {
      const getTempRes = async () => {
        const res = await msg.client.ch.query(
          `SELECT * FROM punish_tempchannelbans WHERE guildid = $1 AND userid = $2;`,
          [msg.guild.id, user.id],
        );
        if (res && res.rowCount) return res.rows;
        return [];
      };

      const dbEntries = await getTempRes();

      const tempBans = dbEntries
        .map((dbEntry) => {
          const channel = msg.client.channels.cache.get(dbEntry.banchannelid);

          if (
            channel.permissionOverwrites.cache.get(user.id)?.deny.has(2048n) ||
            channel.permissionOverwrites.cache.get(user.id)?.deny.has(1048576n)
          ) {
            return true;
          }
          return false;
        })
        .filter((b) => !!b);

      return tempBans.length;
    };

    const getPendingChannelbans = () => {
      const channelbans = allPunishments.filter((p) => p.type === 3);

      const bans = channelbans
        .map((ban) => {
          const channel = msg.client.channels.cache.get(ban.banchannelid);

          if (channel.permissionOverwrites.cache.get(user.id)?.deny.has(1050624n)) {
            return true;
          }
          return false;
        })
        .filter((b) => !!b);

      return bans.length;
    };

    const currentTempBans = await getPendingTempChannelbans();
    const currentBans = getPendingChannelbans();

    return currentTempBans + currentBans;
  };

  let banError;
  const isBanned = await msg.guild.bans.fetch(user.id).catch((e) => {
    banError = String(e).includes('50013') ? true : null;
  });

  const isMuted = member?.isCommunicationDisabled();

  const isChannelBanned = await getChannelBans();

  return [[isBanned, banError], [isMuted, !member], isChannelBanned];
};

const getCurrentStatusField = (
  msg,
  embed,
  user,
  [[isBanned, banError], [isMuted, muteError], isChannelbanned],
) => {
  let fieldValue = '';
  embed.data.fields = [];

  if (isBanned) {
    fieldValue += `${msg.client.textEmotes.banTick} ${msg.client.ch.stp(msg.lan.banned, {
      target: user,
    })}\n`;
  } else if (banError) {
    fieldValue += `${msg.client.textEmotes.banError} ${msg.client.ch.stp(msg.lan.banError, {
      target: user,
    })}\n`;
  } else {
    fieldValue += `${msg.client.textEmotes.banCross} ${msg.client.ch.stp(msg.lan.notbanned, {
      target: user,
    })}\n`;
  }

  if (isMuted) {
    fieldValue += `${msg.client.textEmotes.timedoutTick} ${msg.client.ch.stp(msg.lan.muted, {
      target: user,
    })}\n`;
  } else if (muteError) {
    fieldValue += `${msg.client.textEmotes.timedoutError} ${msg.client.ch.stp(msg.lan.muteError, {
      target: user,
    })}\n`;
  } else {
    fieldValue += `${msg.client.textEmotes.timedoutCross} ${msg.client.ch.stp(msg.lan.notmuted, {
      target: user,
    })}\n`;
  }

  if (isChannelbanned) {
    fieldValue += `${msg.client.textEmotes.mutedTick} ${msg.client.ch.stp(msg.lan.channelbanned, {
      target: user,
      amount: isChannelbanned,
    })}\n`;
  } else {
    fieldValue += `${msg.client.textEmotes.mutedCross} ${msg.client.ch.stp(
      msg.lan.notchannelbanned,
      {
        target: user,
      },
    )}\n`;
  }

  return { name: '\u200b', value: fieldValue, inline: false };
};

const getBaseButtons = (msg, selected, allPunishments, page) => {
  const getAllOptions = () => {
    if (!selected) {
      return [
        new Builders.UnsafeSelectMenuOptionBuilder()
          .setDefault(false)
          .setLabel('placeholder')
          .setValue('placeholder'),
      ];
    }

    if (allPunishments.length) {
      return allPunishments
        .filter((p) => {
          if (selected === 'warns') return p.type === 0;
          if (selected === 'mutes') return p.type === 1;
          if (selected === 'kicks') return p.type === 2;
          if (selected === 'channelbans') return p.type === 3;
          if (selected === 'bans') return p.type === 4;
          return null;
        })
        .map((p) =>
          new Builders.UnsafeSelectMenuOptionBuilder()
            .setDefault(false)
            .setDescription(p.reason.slice(0, 100))
            .setLabel(
              `ID: ${Number(p.uniquetimestamp).toString(32)} | ${msg.lan.executor}: ${
                p.executorname
              }`,
            )
            .setValue(String(p.uniquetimestamp)),
        );
    }

    return [
      new Builders.UnsafeSelectMenuOptionBuilder()
        .setDefault(true)
        .setLabel(msg.lan.noPunishments)
        .setValue('placeholder'),
    ];
  };

  const allOptions = getAllOptions();
  const cloneArr = allOptions.slice();
  const takeOptions = cloneArr.splice(page - 1 * 25, 25);

  const buttons = [
    ['warns', 'mutes', 'kicks', 'channelbans', 'bans'].map((name, i) =>
      new Builders.UnsafeButtonBuilder()
        .setLabel(msg.lan[name])
        .setCustomId(name)
        .setStyle(selected === name ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Primary)
        .setDisabled(selected === name || !allPunishments.find((p) => p.type === i)),
    ),
    [
      new Builders.UnsafeSelectMenuBuilder()
        .setCustomId(`menu_${selected}`)
        .setDisabled(!selected)
        .setMaxValues(takeOptions.length < 9 ? takeOptions.length : 9)
        .setMinValues(1)
        .setPlaceholder(
          msg.client.ch.stp(msg.lan.placeholder, {
            currentPage: String(page),
            maxPages: String(Math.ceil(allOptions.length / 25)),
          }),
        )
        .setOptions(...takeOptions),
    ],
    [
      new Builders.UnsafeButtonBuilder()
        .setLabel('\u200b')
        .setCustomId('left')
        .setStyle(Discord.ButtonStyle.Secondary)
        .setEmoji(msg.client.objectEmotes.back)
        .setDisabled(page === 1),
      new Builders.UnsafeButtonBuilder()
        .setLabel('\u200b')
        .setCustomId('right')
        .setStyle(Discord.ButtonStyle.Secondary)
        .setEmoji(msg.client.objectEmotes.forth)
        .setDisabled(Math.ceil(allOptions.length / 25) <= page),
    ],
  ];

  return buttons;
};

const handleEnd = (buttonsCollector, msg, m) => {
  buttonsCollector.on('end', (collected, reason) => {
    if (reason === 'time') {
      msg.client.ch.disableComponents(m, m.embeds);
    }
  });
};

const handleInteractions = (buttonsCollector, msg, allPunishments, selected, page, embed) => {
  buttonsCollector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) {
      msg.client.ch.notYours(interaction);
      return;
    }

    buttonsCollector.resetTimer();

    switch (interaction.customId) {
      case 'left': {
        page -= 1;
        const baseButtons = getBaseButtons(msg, selected, allPunishments, page);
        await interaction
          .update({ components: msg.client.ch.buttonRower(baseButtons) })
          .catch(() => {});
        break;
      }
      case 'right': {
        page += 1;
        const baseButtons = getBaseButtons(msg, selected, allPunishments, page);
        await interaction
          .update({ components: msg.client.ch.buttonRower(baseButtons) })
          .catch(() => {});
        break;
      }
      default: {
        if (interaction.customId.startsWith('menu')) {
          const name = interaction.customId.split('_')[1];
          const punishmentsToDisplay = allPunishments.filter((p) =>
            interaction.values.includes(p.uniquetimestamp),
          );

          const embeds = getPunishmentEmbeds(punishmentsToDisplay, msg, name);
          interaction.update({ embeds: [embed, ...embeds] });
        } else {
          selected = interaction.customId;
          const baseButtons = getBaseButtons(msg, selected, allPunishments, page);
          await interaction
            .update({ components: msg.client.ch.buttonRower(baseButtons) })
            .catch(() => {});
        }
        break;
      }
    }
  });
};

const getPunishmentEmbeds = (punishments, msg, name) =>
  punishments.map((p) =>
    new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: msg.lan[name],
        iconUrl: msg.client.objectEmotes.warning.link,
        url: msg.client.ch.stp(msg.client.constants.standard.discordUrlDB, {
          guildid: msg.guild.id,
          channelid: p.channelid,
          msgid: p.msgid,
        }),
      })
      .setDescription(`**__${msg.language.reason}__**:\n${p.reason}`)
      .addFields(
        {
          name: msg.lan.date,
          value: `<t:${p.uniquetimestamp.slice(0, -3)}> (<t:${p.uniquetimestamp.slice(0, -3)}:R>)`,
          inline: true,
        },
        {
          name: msg.lan.executor2,
          value: `<@${p.executorid}> / \`${p.executorname}\` / \`${p.executorid}\``,
          inline: true,
        },
        {
          name: msg.lan.channel,
          value: `<#${p.channelid}> / \`${p.channelname}\` / \`${p.channelid}\``,
          inline: true,
        },
        {
          name: msg.lan.punishmentID,
          value: `\`${Number(p.uniquetimestamp).toString(32)}\``,
          inline: true,
        },
        {
          name: msg.lan.duration,
          value: `${
            p.duration
              ? moment
                  .duration(p.duration)
                  .format(
                    `y [${msg.language.time.years}], M [${msg.language.time.months}], d [pa${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
                    { trim: 'all' },
                  )
              : msg.lan.permanent
          }`,
          inline: true,
        },
        {
          name: msg.lan.end,
          value: p.duration
            ? `<t:${
                Number(p.uniquetimestamp.slice(0, -3)) + Number(p.duration.slice(0, -3))
              }> (<t:${
                Number(p.uniquetimestamp.slice(0, -3)) + Number(p.duration.slice(0, -3))
              }:R>)`
            : msg.lan.permanent,
          inline: true,
        },
        {
          name: msg.lan.executorMessage,
          value: msg.client.ch.stp(msg.client.constants.standard.discordUrlDB, {
            guildid: msg.guild.id,
            channelid: p.channelid,
            msgid: p.msgid,
          }),
          inline: false,
        },
      ),
  );
