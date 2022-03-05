const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');
const axios = require('axios');
const auth = require('../BaseClient/auth.json');

module.exports = {
  name: 'userinfo',
  perm: null,
  dm: true,
  takesFirstArg: false,
  aliases: ['whois'],
  type: 'info',
  async execute(msg) {
    let user = await msg.client.users
      .fetch(msg.args[0] ? msg.args[0].replace(/\D+/g, '') : msg.author.id, { force: true })
      .catch(() => {});

    let m;
    let answer;

    if (!user) {
      m = await msg.client.ch.reply(msg, {
        embeds: [await msg.client.ch.loadingEmbed({ author: msg.lan.authorUser }, msg.guild)],
      });

      const users = [
        ...new Set([
          ...msg.client.users.cache
            .filter(
              (u) =>
                u.username.toLowerCase() === msg.args.slice(0).join(' ').toLowerCase() ||
                u.tag.toLowerCase() === msg.args.slice(0).join(' ').toLowerCase(),
            )
            .map((u) => u.id),
          ...msg.guild.members.cache
            .filter(
              (member) =>
                member.displayName.toLowerCase() === msg.args.slice(0).join(' ').toLowerCase(),
            )
            .map((member) => member.user.id),
          ...(
            await msg.guild.members.search({
              query: msg.args.slice(0).join(' ').toLowerCase(),
              limit: 30,
            })
          ).map((member) => member.user.id),
        ]),
      ].map((id) => msg.client.users.cache.get(id));

      if (users.length === 1) {
        user = await msg.client.users.fetch(users[0].id, { force: true });
      } else if (users.length) {
        const res = await decideUser(msg, users, m);

        if (res) {
          user = await msg.client.users.fetch(res.user, { force: true });
          ({ answer } = res);
        }
      }

      if (!user) {
        msg.client.ch.error(
          msg,
          msg.args.slice(0).join(' ').replace(/\D+/g, '').length ===
            msg.args.slice(0).join(' ').length
            ? msg.language.errors.userNotExist
            : msg.language.errors.userNotFound,
          m,
        );
        return;
      }
    }

    const flags = await user.fetchFlags(true);
    if (user.bot && !flags.has(65536)) {
      flags.add(2048);
    }

    let botInfo;
    if (user.bot) {
      botInfo = await getBotInfo(msg, user);
    }

    if (new URL(user.displayAvatarURL()).pathname.endsWith('.gif') || user.bannerURL()) {
      flags.add(4096);
    }

    const userflags = msg.client.ch.userFlagCalc(msg.client, flags.bitfield, msg.language, true);
    getBoosting(userflags, user, msg);
    const con = msg.client.constants.commands[this.name];

    const userEmbed = new Discord.UnsafeEmbed()
      .setAuthor({
        name: user.bot ? msg.lan.authorBot : msg.lan.authorUser,
        iconURL: con.authorImage,
        url: msg.client.constants.standard.invite,
      })
      .setThumbnail(user.displayAvatarURL())
      .setImage(user.bannerURL() || botInfo?.bannerURL)
      .setColor(user.accentColor)
      .setDescription(
        `${msg.client.ch.stp(msg.lan.userInfo, {
          user,
          accentColor: user.accentColor ? user.accentColor : msg.language.default,
          hexAccentColor: user.hexAccentColor ? user.hexAccentColor : msg.language.default,
        })}${botInfo ? `\n${botInfo.info}` : ''}`,
      );

    if (botInfo) {
      userEmbed.addFields({ name: msg.language.description, value: botInfo.description });
    }
    if (userflags.length) {
      userEmbed.addFields([
        {
          name: msg.lan.flags,
          value: userflags.join('\n'),
          inline: false,
        },
      ]);
    }

    userEmbed.addFields([
      {
        name: `${msg.client.constants.emotes.plusBG} ${msg.lan.createdAt}`,
        value: `<t:${String(user.createdTimestamp).slice(0, -3)}:F> (<t:${String(
          user.createdTimestamp,
        ).slice(0, -3)}:R>)\n\`${moment
          .duration(Date.now() - user.createdTimestamp)
          .format(
            `y [${msg.language.time.years}], M [${msg.language.time.months}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
            { trim: 'all' },
          )}\``,
      },
    ]);

    if (user.accentColor) userEmbed.setFooter({ text: msg.lan.footer });

    const embeds = [userEmbed];
    let components = [];
    const member = await msg.guild.members.fetch(user.id).catch(() => {});
    if (member) {
      const memberEmbed = new Discord.UnsafeEmbed()
        .setAuthor({
          name: user.bot ? msg.lan.memberAuthorBot : msg.lan.memberAuthorUser,
          iconURL: con.authorImage,
          url: msg.client.constants.standard.invite,
        })
        .addFields([
          {
            name: msg.lan.nickname,
            value: msg.client.ch.makeInlineCode(member.displayName),
            inline: false,
          },
          {
            name: msg.lan.timeout,
            value: `${
              member.communicationDisabledUntil
                ? `${msg.client.constants.emotes.tickBG} ${msg.language.Yes}\n${
                    msg.lan.communicationDisabledUntil
                  } <t:${String(member.communicationDisabledUntilTimestamp).slice(
                    0,
                    -3,
                  )}:F> (<t:${String(member.communicationDisabledUntilTimestamp).slice(0, -3)}:R>)`
                : `${msg.client.constants.emotes.crossBG} ${msg.language.No}`
            }`,
            inline: false,
          },
          {
            name: `${msg.client.constants.emotes.plusBG} ${msg.lan.joinedAt}`,
            value: `<t:${String(member.joinedTimestamp).slice(0, -3)}:F> (<t:${String(
              member.joinedTimestamp,
            ).slice(0, -3)}:R>)`,
          },
          {
            name: `${getBoostEmote(member)} ${msg.lan.boosting}`,
            value: `${
              member.premiumSinceTimestamp
                ? `${msg.client.constants.emotes.tickBG} ${msg.language.Yes}\n${
                    msg.lan.boostingSince
                  } <t:${String(member.premiumSinceTimestamp).slice(0, -3)}:F> (<t:${String(
                    member.premiumSinceTimestamp,
                  ).slice(0, -3)}:R>)`
                : `${msg.client.constants.emotes.crossBG} ${msg.language.No}`
            }`,
          },
        ]);

      if (member.displayAvatarURL() !== user.displayAvatarURL()) {
        memberEmbed.setThumbnail(member.displayAvatarURL());
      }

      embeds.push(memberEmbed);
      components = getComponents(msg, member, 1);
    }

    if (answer) {
      answer
        .update({
          embeds,
          components: msg.client.ch.buttonRower(components),
        })
        .catch(() => {});
    } else if (m) {
      m.edit({
        embeds,
        components: msg.client.ch.buttonRower(components),
      }).catch(() => {});
    } else {
      m = await msg.client.ch.reply(msg, {
        embeds,
        components: msg.client.ch.buttonRower(components),
      });
    }

    if (components) {
      interactionHandler(msg, m, embeds, member);
    }
  },
};

const interactionHandler = (msg, m, embeds, member) => {
  let page = 1;
  const collector = m.createMessageComponentCollector({ time: 60000 });
  collector.on('collect', (interaction) => {
    switch (interaction.customId) {
      case 'roles': {
        rolesHandler(interaction, msg, member);
        break;
      }
      case 'basicPerms': {
        basicPermsHandler(interaction, msg, member);
        break;
      }
      case 'perms': {
        permsHandler(interaction, msg, member);
        break;
      }
      case 'back': {
        page -= 1;
        interaction
          .update({
            embeds,
            components: msg.client.ch.buttonRower(getComponents(msg, member, page)),
          })
          .catch(() => {});
        break;
      }
      case 'next': {
        page += 1;
        interaction
          .update({
            embeds,
            components: msg.client.ch.buttonRower(getComponents(msg, member, page)),
          })
          .catch(() => {});
        break;
      }
      default: {
        break;
      }
    }
  });

  collector.on('end', (collected, reason) => {
    if (reason === 'time') {
      disableComponents(m, embeds);
    }
  });
};

const getComponents = (msg, member, page) => [
  [
    new Discord.ButtonComponent()
      .setLabel(msg.lan.viewRoles)
      .setDisabled(member.roles.cache.size <= 1)
      .setStyle(Discord.ButtonStyle.Secondary)
      .setCustomId('roles'),
    new Discord.ButtonComponent()
      .setLabel(msg.lan.viewBasicPermissions)
      .setCustomId('basicPerms')
      .setStyle(Discord.ButtonStyle.Secondary),
  ],
  [
    new Discord.SelectMenuComponent()
      .setPlaceholder(msg.lan.viewChannelPermissions)
      .setMaxValues(1)
      .setMinValues(1)
      .setCustomId('perms')
      .setOptions(getChannelOptions(msg).slice((page - 1) * 25, page * 25)),
  ],
  [
    new Discord.ButtonComponent()
      .setCustomId('back')
      .setEmoji(msg.client.constants.emotes.back)
      .setStyle(Discord.ButtonStyle.Secondary)
      .setDisabled(page === 1),
    new Discord.ButtonComponent()
      .setCustomId('next')
      .setEmoji(msg.client.constants.emotes.forth)
      .setStyle(Discord.ButtonStyle.Secondary)
      .setDisabled(page === Math.ceil(msg.guild.channels.cache.size / 25)),
  ],
];

const getChannelOptions = (msg) => {
  const channelsWithoutCategory = msg.guild.channels.cache.filter(
    (c) => !c.parent && c.type !== 'GUILD_CATEGORY',
  );
  const categories = msg.guild.channels.cache.filter((c) => c.type === 'GUILD_CATEGORY');
  const channels = msg.guild.channels.cache.filter((c) => c.type !== 'GUILD_CATEGORY' && c.parent);

  channelsWithoutCategory.sort((a, b) => a.rawPosition - b.rawPosition);
  categories.sort((a, b) => a.rawPosition - b.rawPosition);
  channels.sort((a, b) => a.rawPosition - b.rawPosition);

  const sorted = [...channelsWithoutCategory, ...categories].map((a) => a[1]);

  channels.forEach((channel) => {
    const index = sorted.findIndex((c) => c.id === channel.parent.id);
    sorted.splice(index + 1, 0, channel);
  });

  const options = sorted.map((c) => ({
    label: c.name,
    value: c.id,
    emoji: msg.client.constants.emotes.channelTypes[c.type],
  }));

  return options;
};

const getBoostEmote = (member) => {
  if (!member.premiumSinceTimestamp) return '';
  const time = Math.abs(member.premiumSinceTimestamp - Date.now());
  const month = 2629743000;

  if (time < month * 2) return member.client.constants.emotes.userFlags.BOOST1;
  if (time < month * 3) return member.client.constants.emotes.userFlags.BOOST2;
  if (time < month * 6) return member.client.constants.emotes.userFlags.BOOST3;
  if (time < month * 9) return member.client.constants.emotes.userFlags.BOOST6;
  if (time < month * 12) return member.client.constants.emotes.userFlags.BOOST9;
  if (time < month * 15) return member.client.constants.emotes.userFlags.BOOST12;
  if (time < month * 18) return member.client.constants.emotes.userFlags.BOOST15;
  if (time < month * 24) return member.client.constants.emotes.userFlags.BOOST18;
  return member.client.constants.emotes.userFlags.BOOST24;
};

const getBoosting = (flags, user, msg) => {
  const guilds = user.client.guilds.cache.filter((g) => g.members.cache.has(user.id));

  const premiums = guilds
    .map((guild) => {
      const member = guild.members.cache.get(user.id);

      if (member.premiumSinceTimestamp) {
        return member.premiumSinceTimestamp;
      }
      return null;
    })
    .filter((r) => !!r);

  if (!premiums.length) return;

  const longestPrem = Math.min(...premiums);
  const boostFlags = new Discord.BitField();
  const time = Math.abs(longestPrem - Date.now());
  const month = 2629743000;

  if (time < month * 2) boostFlags.add(1);
  else if (time < month * 3) boostFlags.add(2);
  else if (time < month * 6) boostFlags.add(4);
  else if (time < month * 9) boostFlags.add(8);
  else if (time < month * 12) boostFlags.add(16);
  else if (time < month * 15) boostFlags.add(32);
  else if (time < month * 18) boostFlags.add(64);
  else if (time < month * 24) boostFlags.add(128);
  else boostFlags.add(256);

  const translatedBoostFlags = msg.client.ch.memberBoostCalc(
    user.client,
    boostFlags,
    msg.language,
    true,
  );
  flags.push(...translatedBoostFlags);
};

const rolesHandler = async (interaction, msg, member) => {
  const res = await msg.client.ch.query(
    'SELECT * FROM roleseparator WHERE guildid = $1 AND active = true;',
    [msg.guild.id],
  );

  if (res && res.rowCount) {
    const separators = new Discord.Collection();
    const { rows } = res;

    member.roles.cache.forEach((role) => {
      const isSeparator = rows.findIndex((row) => row.separator === role.id);
      const separator = isSeparator !== -1 ? role : null;

      if (separator) {
        separator.stopRole = msg.guild.roles.cache.get(rows[isSeparator].stoprole);
        separators.set(role.id, separator);
      }
    });

    separators.forEach((sep) => {
      const row = rows.find((r) => r.separator === sep.id);

      if (!row.isvarying) {
        const roles = row.roles.map((r) => member.roles.cache.get(r.id)).filter((r) => !!r);
        sep.roles = roles;
      } else {
        const roles = member.roles.cache.filter((r) => {
          if (sep.stopRole) {
            if (sep.rawPosition > sep.stopRole.rawPosition) {
              return r.rawPosition < sep.rawPosition && r.rawPosition > sep.stopRole.rawPosition;
            }
            return r.rawPosition > sep.rawPosition && r.rawPosition < sep.stopRole.rawPosition;
          }
          return r.rawPosition > sep.rawPosition;
        });

        sep.roles = roles;
      }
    });

    separators.sort((a, b) => b.rawPosition - a.rawPosition);
    const rolesWithSep = [].concat(...separators.map((s) => s.roles.map((r) => r.id)));
    const rolesWithoutSep = member.roles.cache.filter((role) => !rolesWithSep.includes(role.id));
    rolesWithoutSep.sort((a, b) => b.rawPosition - a.rawPosition);

    const embed = new Discord.UnsafeEmbed();
    separators.forEach((sep, key) => {
      if (!sep.stopRole) {
        embed.addFields({
          name: '\u200b',
          value: sep.roles.map((r) => r).join('\n'),
          inline: false,
        });

        const index = separators.map((s) => s).findIndex((s) => s.id === key);
        const nextSep = separators.map((s) => s)[index + 1];

        if (!nextSep || (nextSep.stopRole && nextSep.rawPosition > nextSep.stopRole.rawPosition)) {
          embed.addFields({ name: sep.name, value: '\u200b', inline: false });
        }
      } else if (sep.rawPosition > sep.stopRole.rawPosition) {
        embed.addFields({
          name: sep.name,
          value: sep.roles.map((r) => r).join('\n'),
          inline: false,
        });
      } else if (sep.rawPosition < sep.stopRole.rawPosition) {
        const index = separators.map((s) => s).findIndex((s) => s.id === key);
        const lastSep = separators.map((s) => s)[index - 1];

        embed.addFields({
          name: `${lastSep ? lastSep.name : '\u200b'}`,
          value: sep.roles.map((r) => r).join('\n'),
          inline: false,
        });

        if (key === separators.lastKey()) {
          embed.addFields({ name: sep.name, value: '\u200b', inline: false });
        }
      }
    });

    if (rolesWithoutSep.size) {
      embed.addFields({
        name: msg.lan.rolesWithoutSep,
        value: rolesWithoutSep.map((r) => r).join('\n'),
        inline: false,
      });
    }

    interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const embed = new Discord.UnsafeEmbed().setDescription(
    `**${msg.language.roles}**:\n${member.roles.cache
      .sort((a, b) => b.rawPosition - a.rawPosition)
      .map((r) => `${r}`)
      .join('\n')}`,
  );

  interaction.reply({ embeds: [embed], ephemeral: true });
};

const basicPermsHandler = (interaction, msg, member) => {
  const allPerms = new Discord.PermissionsBitField(Discord.Permissions.ALL).toArray();
  const allowedBits = [];
  const deniedBits = [];

  allPerms.forEach((perm, i) => {
    const p = Object.entries(member.permissions.serialize())[i];
    if (p[1]) {
      allowedBits.push(new Discord.PermissionsBitField(p[0]).bitfield);
    }
    if (!p[1]) {
      deniedBits.push(new Discord.PermissionsBitField(p[0]).bitfield);
    }
  });

  const categories = new Discord.Collection();
  const categoryBits = [
    [1879573680n, msg.language.permissions.categories.GENERAL],
    [1099712954375n, msg.language.permissions.categories.MEMBER],
    [534723950656n, msg.language.permissions.categories.TEXT],
    [554116842240n, msg.language.permissions.categories.VOICE],
    [4294967296n, msg.language.permissions.categories.STAGE],
    [8589934592n, msg.language.permissions.categories.EVENTS],
    [8n, msg.language.permissions.categories.ADVANCED],
  ];

  categoryBits.forEach(([bit, name]) => {
    categories.set(name, [
      ...new Set([
        ...allowedBits
          .map((perm) =>
            new Discord.PermissionsBitField(bit).has(perm, false)
              ? `${msg.client.constants.emotes.enabled} ${msg.client.ch.permCalc(
                  perm,
                  msg.language,
                )}`
              : null,
          )
          .filter((r) => !!r),
        ...deniedBits
          .map((perm) =>
            new Discord.PermissionsBitField(bit).has(perm, false)
              ? `${msg.client.constants.emotes.disabled} ${msg.client.ch.permCalc(
                  perm,
                  msg.language,
                )}`
              : null,
          )
          .filter((r) => !!r),
      ]),
    ]);
  });

  const embed = new Discord.UnsafeEmbed();
  categories.forEach((perms, name) => {
    embed.addFields({ name: `${name}`, value: ` ${perms.join('\n')}\u200b`, inline: false });
  });

  interaction.reply({ embeds: [embed], ephemeral: true });
};

const disableComponents = async (m, embeds) => {
  m.components.forEach((componentRow, i) => {
    componentRow.components.forEach((component, j) => {
      m.components[i].components[j].disabled = true;
    });
  });

  await m.edit({ embeds, components: m.components });
};

const permsHandler = (interaction, msg, member) => {
  const channel = msg.guild.channels.cache.get(interaction.values[0]);
  const permissions = channel.permissionsFor(member);
  let categoryBits = [
    [1879573680n, msg.language.permissions.categories.GENERAL],
    [1099712954375n, msg.language.permissions.categories.MEMBER],
    [534723950656n, msg.language.permissions.categories.TEXT],
    [549821874944n, msg.language.permissions.categories.VOICE],
    [4294967296n, msg.language.permissions.categories.STAGE],
    [8589934592n, msg.language.permissions.categories.EVENTS],
    [8n, msg.language.permissions.categories.ADVANCED],
  ];

  let usedPermissions = Discord.Permissions.ALL;
  switch (channel.type) {
    case 0 || 11 || 12: {
      usedPermissions = new Discord.PermissionsBitField(535529258065n);
      categoryBits = [categoryBits[0], categoryBits[1], categoryBits[2]];
      break;
    }
    case 5 || 10: {
      usedPermissions = new Discord.PermissionsBitField(466809781329n);
      categoryBits = [categoryBits[0], categoryBits[1], categoryBits[2]];
      break;
    }
    case 2: {
      usedPermissions = new Discord.PermissionsBitField(558680246033n);
      categoryBits = [categoryBits[0], categoryBits[1], categoryBits[3]];
      break;
    }
    case 4: {
      usedPermissions = new Discord.PermissionsBitField(1098236034897n);
      categoryBits = [
        categoryBits[0],
        categoryBits[1],
        categoryBits[2],
        categoryBits[3],
        categoryBits[4],
      ];
      break;
    }
    case 13: {
      usedPermissions = new Discord.PermissionsBitField(13175358481n);
      categoryBits = [
        categoryBits[0],
        categoryBits[1],
        categoryBits[3],
        categoryBits[4],
        categoryBits[5],
      ];
      break;
    }
    default: {
      usedPermissions = Discord.Permissions.ALL;
      break;
    }
  }

  const categories = new Discord.Collection();
  const allowedBits = [];
  const deniedBits = [];

  Object.entries(permissions.serialize()).forEach(([name, has]) => {
    if (!usedPermissions.has(name, false)) return;
    if (has) {
      allowedBits.push(new Discord.PermissionsBitField(name).bitfield);
    }
    if (!has) {
      deniedBits.push(new Discord.PermissionsBitField(name).bitfield);
    }
  });

  categoryBits.forEach(([bit, name]) => {
    categories.set(name, [
      ...new Set([
        ...allowedBits
          .map((perm) =>
            new Discord.PermissionsBitField(bit).has(perm, false)
              ? `${msg.client.constants.emotes.enabled} ${msg.client.ch.permCalc(
                  perm,
                  msg.language,
                )}`
              : null,
          )
          .filter((r) => !!r),
        ...deniedBits
          .map((perm) =>
            new Discord.PermissionsBitField(bit).has(perm, false)
              ? `${msg.client.constants.emotes.disabled} ${msg.client.ch.permCalc(
                  perm,
                  msg.language,
                )}`
              : null,
          )
          .filter((r) => !!r),
      ]),
    ]);
  });

  const embed = new Discord.UnsafeEmbed();
  categories.forEach((perms, name) => {
    embed.addFields({ name: `${name}`, value: ` ${perms.join('\n')}\u200b`, inline: false });
  });

  interaction.reply({ embeds: [embed], ephemeral: true });
};

const getBotInfo = async (msg, bot) => {
  const res = await axios
    .get(`https://top.gg/api/bots/${bot.id}`, { headers: { Authorization: auth.topGGtoken } })
    .catch(() => {});

  if (!res || !res.data) return null;

  const botInfo = msg.client.ch.stp(msg.lan.botInfo, {
    res: res.data,
    website: res.data.website ? res.data.website : msg.language.none,
    support: res.data.support ? `https://discord.gg/${res.data.support}` : msg.language.none,
    invite: res.data.invite,
    github: res.data.github ? res.data.github : msg.language.none,
  });

  return { bannerURL: res.data.bannerURL, info: botInfo, description: res.data.shortdesc };
};

const decideUser = async (msg, users, m) => {
  await m.edit({
    content: '\u200b',
    embeds: [],
    components: msg.client.ch.buttonRower(getUserComponents(msg, 1, users)),
  });

  let page = 1;
  const buttonsCollector = m.createMessageComponentCollector({ time: 60000 });
  return new Promise((resolve) => {
    buttonsCollector.on('collect', async (interaction) => {
      if (interaction.user.id !== msg.author.id) {
        msg.client.ch.notYours(interaction);
        return;
      }

      buttonsCollector.resetTimer();

      switch (interaction.customId) {
        case 'back': {
          page -= 1;

          await interaction.update({
            content: '\u200b',
            components: msg.client.ch.buttonRower(getUserComponents(msg, page, users)),
          });
          break;
        }
        case 'next': {
          page += 1;

          await interaction.update({
            content: '\u200b',
            components: msg.client.ch.buttonRower(getUserComponents(msg, page, users)),
          });
          break;
        }
        default: {
          const user = interaction.values[0];
          buttonsCollector.stop();
          resolve({ user, answer: interaction });
          break;
        }
      }
    });

    buttonsCollector.on('end', (collected, reason) => {
      if (reason === 'time') {
        msg.client.ch.collectorEnd(msg, m);
        resolve(null);
      }
    });
  });
};

const getUserComponents = (msg, page, users) => {
  const menu = [
    new Discord.SelectMenuComponent()
      .setPlaceholder(msg.lan.selectUser)
      .setMaxValues(1)
      .setMinValues(1)
      .setCustomId('userSelection')
      .setOptions(
        users
          .map((user) => ({
            label: `${user.tag}`,
            description: `${user.id}`,
            value: `${user.id}`,
          }))
          .slice((page - 1) * 25, page * 25),
      ),
  ];

  if (users.length > 25) {
    const back = new Discord.ButtonComponent()
      .setEmoji(msg.client.constants.emotes.back)
      .setDisabled(page === 1)
      .setCustomId('back')
      .setStyle(Discord.ButtonStyle.Secondary);

    const next = new Discord.ButtonComponent()
      .setEmoji(msg.client.constants.emotes.forth)
      .setCustomId('next')
      .setDisabled(page === Math.ceil(users.length / 25))
      .setStyle(Discord.ButtonStyle.Secondary);

    return [menu, [back, next]];
  }

  return [menu];
};
