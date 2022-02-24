const Discord = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  name: 'userinfo',
  perm: null,
  dm: true,
  takesFirstArg: false,
  aliases: ['whois'],
  type: 'info',
  async execute(msg) {
    const user = await msg.client.users
      .fetch(msg.args[0] ? msg.args[0].replace(/\D+/g, '') : msg.author.id, { force: true })
      .catch(() => {});

    if (!user) {
      msg.client.ch.error(msg, msg.language.errors.userNotFound);
      return;
    }

    const flags = await user.fetchFlags(true);
    if (user.bot && !flags.has(65536)) {
      flags.add(2048);
    }
    if (
      new URL(msg.client.ch.displayAvatarURL(user)).pathname.endsWith('.gif') ||
      msg.client.ch.displayBannerURL(user)
    ) {
      flags.add(4096);
    }

    getBoosting(flags, user);

    const userflags = msg.client.ch.userFlagCalc(msg.client, flags.bitfield, msg.language, true);
    const con = msg.client.constants.commands[this.name];

    const userEmbed = new Discord.MessageEmbed()
      .setAuthor({
        name: user.bot ? msg.lan.authorBot : msg.lan.authorUser,
        iconURL: con.authorImage,
        url: msg.client.constants.standard.invite,
      })
      .setThumbnail(msg.client.ch.displayAvatarURL(user))
      .setImage(msg.client.ch.displayBannerURL(user))
      .setColor(user.accentColor)
      .setDescription(
        msg.client.ch.stp(msg.lan.userInfo, {
          user,
          accentColor: user.accentColor ? user.accentColor : msg.language.default,
          hexAccentColor: user.hexAccentColor ? user.hexAccentColor : msg.language.default,
        }),
      );

    if (userflags.length) {
      userEmbed.addFields({
        name: msg.lan.flags,
        value: userflags.join('\n'),
        inline: false,
      });
    }

    userEmbed.addFields({
      name: `${msg.client.constants.emotes.plusBG} ${msg.lan.createdAt}`,
      value: `<t:${String(user.createdTimestamp).slice(0, -3)}:F> (<t:${String(
        user.createdTimestamp,
      ).slice(0, -3)}:R>)\n\`${moment
        .duration(Date.now() - user.createdTimestamp)
        .format(
          `y [${msg.language.time.years}], M [${msg.language.time.months}], d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`,
          { trim: 'all' },
        )}\``,
    });

    if (user.accentColor) userEmbed.setFooter({ text: msg.lan.footer });

    const embeds = [userEmbed];
    let components = [];
    const member = await msg.guild.members.fetch(user.id).catch(() => {});
    if (member) {
      const memberEmbed = new Discord.MessageEmbed()
        .setAuthor({
          name: user.bot ? msg.lan.memberAuthorBot : msg.lan.memberAuthorUser,
          iconURL: con.authorImage,
          url: msg.client.constants.standard.invite,
        })
        .addFields(
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
        );

      if (msg.client.ch.displayAvatarURL(member) !== msg.client.ch.displayAvatarURL(user)) {
        memberEmbed.setThumbnail(msg.client.ch.displayAvatarURL(member));
      }

      embeds.push(memberEmbed);
      components = getComponents(msg, member, 1);
    }

    const m = await msg.client.ch.reply(msg, {
      embeds,
      components: msg.client.ch.buttonRower(components),
    });

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
      default: {
        break;
      }
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
    }
  });
};

const getComponents = (msg, member, page) => {
  return [
    [
      new Discord.MessageButton()
        .setLabel(msg.lan.viewRoles)
        .setDisabled(member.roles.cache.size <= 1)
        .setStyle('SECONDARY')
        .setCustomId('roles'),
      new Discord.MessageButton()
        .setLabel(msg.lan.viewBasicPermissions)
        .setCustomId('basicPerms')
        .setStyle('SECONDARY'),
    ],
    [
      new Discord.MessageSelectMenu()
        .setPlaceholder(msg.lan.viewChannelPermissions)
        .setMaxValues(1)
        .setMinValues(1)
        .setCustomId('perms')
        .setOptions(getChannelOptions(msg).slice((page - 1) * 25, page * 25)),
    ],
    [
      new Discord.MessageButton()
        .setCustomId('back')
        .setEmoji(msg.client.constants.emotes.back)
        .setStyle('SECONDARY')
        .setDisabled(page === 1),
      new Discord.MessageButton()
        .setCustomId('next')
        .setEmoji(msg.client.constants.emotes.forth)
        .setStyle('SECONDARY')
        .setDisabled(page === Math.ceil(msg.guild.channels.cache.size / 25)),
    ],
  ];
};

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

  const options = sorted.map((c) => {
    return {
      label: c.name,
      value: c.id,
      emoji: msg.client.constants.emotes.channelTypes[c.type],
    };
  });

  return options;
};

const getBoostEmote = (member) => {
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

const getBoosting = (flags, user) => {
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

  const time = Math.abs(longestPrem - Date.now());
  const month = 2629743000;
  if (time < month * 2) flags.add(1048576);
  else if (time < month * 3) flags.add(2097152);
  else if (time < month * 6) flags.add(4194304);
  else if (time < month * 9) flags.add(8388608);
  else if (time < month * 12) flags.add(16777216);
  else if (time < month * 15) flags.add(33554432);
  else if (time < month * 18) flags.add(67108864);
  else if (time < month * 24) flags.add(134217728);
  else flags.add(268435456);
};

/*



        permissions
        */
const rolesHandler = async (interaction, msg, member) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM roleseparator WHERE guildid = $1 AND active = true;`,
    [msg.guild.id],
  );

  if (res && res.rowCount) {

    interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const embed = new Discord.MessageEmbed().setDescription(
    `**${msg.language.roles}**:\n${member.roles.cache
      .sort((a, b) => b.rawPosition - a.rawPosition)
      .map((r) => `${r}`)
      .join('\n')}`,
  );

  interaction.reply({ embeds: [embed], ephemeral: true });
};

const basicPermsHandler = (interaction, msg, member) => {};

const permsHandler = (interaction, msg, member) => {};
