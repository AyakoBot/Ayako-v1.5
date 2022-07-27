import type Eris from 'eris';
import moment from 'moment';
import Discord from 'discord.js';
import 'moment-duration-format';
import type DBT from '../../../typings/DataBaseTypings';
import client from '../../../BaseClient/ErisClient';

export default async (
  guild: Eris.Guild,
  oldGuild: Eris.OldGuild,
  language: typeof import('../../../Languages/lan-en.json'),
) => {
  const channels = (
    await client.ch
      .query('SELECT guildevents FROM logchannels WHERE guildid = $1;', [guild.id])
      .then((r: DBT.logchannels[] | null) => (r ? r[0].guildevents : null))
  )?.map((id: string) => guild?.channels.get(id));

  if (!channels) return;

  const lan = language.events.guildUpdate;
  const con = client.constants.events.guildUpdate;

  const getEmbed = (): Eris.Embed => ({
    type: 'rich',
    author: {
      name: lan.title,
      icon_url: con.image,
    },
    fields: [],
    color: con.color,
  });

  const changedKeys: string[] = [];
  const embed = getEmbed();
  const files: Eris.FileContent[] = [];

  const afkChannelID = () => {
    changedKeys.push('afkChannelID');
    embed.fields?.push({
      name: lan.afkChannelID,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.afkChannelID
          ? `<#&${oldGuild.afkChannelID}> / \`${
              guild.channels.get(oldGuild.afkChannelID)?.name
            }\` / \`${oldGuild.afkChannelID}\``
          : language.none,
        newValue: guild.afkChannelID
          ? `<#&${guild.afkChannelID}> / \`${guild.channels.get(guild.afkChannelID)?.name}\` / \`${
              guild.afkChannelID
            }\``
          : language.none,
      }),
      inline: false,
    });
  };

  const afkTimeout = () => {
    changedKeys.push('afkTimeout');
    embed.fields?.push({
      name: lan.afkTimeout,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.afkTimeout
          ? moment
              .duration(oldGuild.afkTimeout * 1000)
              .format(
                `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                { trim: 'all' },
              )
          : language.none,
        newValue: guild.afkTimeout
          ? moment
              .duration(guild.afkTimeout * 1000)
              .format(
                `Y [${language.time.years}], M [${language.time.months}], W [${language.time.weeks}], D [${language.time.days}], H [${language.time.hours}], m [${language.time.minutes}], s [${language.time.seconds}]`,
                { trim: 'all' },
              )
          : language.none,
      }),
      inline: false,
    });
  };

  const banner = async () => {
    changedKeys.push('banner');

    const newBanner = guild.banner
      ? client.ch.stp(client.constants.standard.guildIconURL, {
          guild,
          fileEnd: guild.banner.startsWith('a_') ? 'gif' : 'png',
        })
      : null;

    const [newBannerFile] = await client.ch.fileURL2Buffer([newBanner]);

    if (newBannerFile) {
      newBannerFile.name = `${guild.banner}.${guild.banner?.startsWith('a_') ? 'gif' : 'png'}`;
      embed.thumbnail = {
        url: `attachment://${guild.banner}.${guild.banner?.startsWith('a_') ? 'gif' : 'png'}`,
      };
      files.push(newBannerFile);
    }

    if (newBannerFile) {
      embed.fields?.push({
        name: lan.banner,
        value: lan.bannerAppear,
        inline: false,
      });
    }
  };

  const defaultNotifications = () => {
    changedKeys.push('defaultNotifications');
    embed.fields?.push({
      name: lan.defaultNotifications,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.defaultNotifications === 0 ? lan.all : lan.mentions,
        newValue: guild.defaultNotifications === 0 ? lan.all : lan.mentions,
      }),
      inline: false,
    });
  };

  const description = () => {
    changedKeys.push('description');
    embed.fields?.push({
      name: lan.desc,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.description || language.none,
        newValue: guild.description || language.none,
      }),
      inline: false,
    });
  };

  const explicitContentFilter = () => {
    changedKeys.push('explicitContentFilter');
    let before: string;
    let after: string;

    if (oldGuild.explicitContentFilter === 0) before = lan.disabled;
    else if (oldGuild.explicitContentFilter === 1) before = lan.noRoles;
    else before = lan.allScan;

    if (guild.explicitContentFilter === 0) after = lan.disabled;
    else if (guild.explicitContentFilter === 1) after = lan.noRoles;
    else after = lan.allScan;

    embed.fields?.push({
      name: lan.explicitContentFilter,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: before,
        newValue: after,
      }),
      inline: false,
    });
  };

  const features = () => {
    changedKeys.push('features');
    embed.fields?.push({
      name: lan.features,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.features.length
          ? oldGuild.features
              .map((f) => language.features[f as unknown as Eris.GuildFeatures])
              .join('\n')
          : language.none,
        newValue: guild.features.length
          ? guild.features
              .map((f) => language.features[f as unknown as Eris.GuildFeatures])
              .join('\n')
          : language.none,
      }),
      inline: false,
    });
  };

  const icon = async () => {
    changedKeys.push('icon');

    const newIcon = guild.icon
      ? client.ch.stp(client.constants.standard.guildIconURL, {
          guild,
          fileEnd: guild.icon.startsWith('a_') ? 'gif' : 'png',
        })
      : null;

    const [newIconFile] = await client.ch.fileURL2Buffer([newIcon]);

    if (newIconFile) {
      newIconFile.name = `${guild.icon}.${guild.icon?.startsWith('a_') ? 'gif' : 'png'}`;
      embed.thumbnail = {
        url: `attachment://${guild.icon}.${guild.icon?.startsWith('a_') ? 'gif' : 'png'}`,
      };
      files.push(newIconFile);
    }

    if (newIconFile) {
      embed.fields?.push({
        name: lan.icon,
        value: lan.iconAppear,
        inline: false,
      });
    }
  };

  const large = () => {
    changedKeys.push('large');
    embed.fields?.push({
      name: lan.large,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.large ? language.large : language.small,
        newValue: guild.large ? language.large : language.small,
      }),
      inline: false,
    });
  };

  const maxMembers = () => {
    changedKeys.push('maxMembers');
    embed.fields?.push({
      name: lan.maxMembers,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.maxMembers,
        newValue: guild.maxMembers,
      }),
      inline: false,
    });
  };

  const maxVideoChannelUsers = () => {
    changedKeys.push('maxVideoChannelUsers');
    embed.fields?.push({
      name: lan.maxVideoChannelUsers,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.maxVideoChannelUsers,
        newValue: guild.maxVideoChannelUsers,
      }),
      inline: false,
    });
  };

  const mfaLevel = () => {
    changedKeys.push('mfaLevel');
    embed.fields?.push({
      name: lan.mfaLevel,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.mfaLevel ? language.required : language.optional,
        newValue: guild.mfaLevel ? language.required : language.optional,
      }),
      inline: false,
    });
  };

  const nameChange = () => {
    changedKeys.push('nameChange');
    embed.fields?.push({
      name: language.name,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.name,
        newValue: guild.name,
      }),
      inline: false,
    });
  };

  const nsfwLevel = () => {
    changedKeys.push('nsfwLevel');
    embed.fields?.push({
      name: lan.nsfwLevel,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.nsfwLevel,
        newValue: guild.nsfwLevel,
      }),
      inline: false,
    });
  };

  const ownerID = async () => {
    changedKeys.push('ownerID');
    const oldOwner = await client.ch.getUser(oldGuild.ownerID);
    const newOwner = await client.ch.getUser(guild.ownerID);

    embed.fields?.push({
      name: lan.ownerID,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: `<@${oldGuild.ownerID}> / \`${oldOwner?.username}#${oldOwner?.discriminator}\` / \`${oldGuild.ownerID}\``,
        newValue: `<@${guild.ownerID}> / \`${newOwner?.username}#${newOwner?.discriminator}\` / \`${guild.ownerID}\``,
      }),
      inline: false,
    });
  };

  const preferredLocale = () => {
    changedKeys.push('preferredLocale');
    embed.fields?.push({
      name: lan.preferredLocale,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.preferredLocale,
        newValue: guild.preferredLocale,
      }),
      inline: false,
    });
  };

  const premiumSubscriptionCount = () => {
    changedKeys.push('premiumSubscriptionCount');
    embed.fields?.push({
      name: lan.premiumSubscriptionCount,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.premiumSubscriptionCount,
        newValue: guild.premiumSubscriptionCount,
      }),
      inline: false,
    });
  };

  const premiumTier = () => {
    changedKeys.push('premiumTier');
    embed.fields?.push({
      name: lan.premiumTier,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.premiumTier,
        newValue: guild.premiumTier,
      }),
      inline: false,
    });
  };

  const publicUpdatesChannelID = () => {
    changedKeys.push('publicUpdatesChannelID');
    embed.fields?.push({
      name: lan.publicUpdatesChannelID,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.publicUpdatesChannelID
          ? `<#&${oldGuild.publicUpdatesChannelID}> / \`${
              guild.channels.get(oldGuild.publicUpdatesChannelID)?.name
            }\` / \`${oldGuild.publicUpdatesChannelID}\``
          : language.none,
        newValue: guild.publicUpdatesChannelID
          ? `<#&${guild.publicUpdatesChannelID}> / \`${
              guild.channels.get(guild.publicUpdatesChannelID)?.name
            }\` / \`${guild.publicUpdatesChannelID}\``
          : language.none,
      }),
      inline: false,
    });
  };

  const rulesChannelID = () => {
    changedKeys.push('rulesChannelID');
    embed.fields?.push({
      name: lan.rulesChannelID,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.rulesChannelID
          ? `<#&${oldGuild.rulesChannelID}> / \`${
              guild.channels.get(oldGuild.rulesChannelID)?.name
            }\` / \`${oldGuild.rulesChannelID}\``
          : language.none,
        newValue: guild.rulesChannelID
          ? `<#&${guild.rulesChannelID}> / \`${
              guild.channels.get(guild.rulesChannelID)?.name
            }\` / \`${guild.rulesChannelID}\``
          : language.none,
      }),
      inline: false,
    });
  };

  const splash = async () => {
    changedKeys.push('splash');

    const newSplash = guild.banner
      ? client.ch.stp(client.constants.standard.guildIconURL, {
          guild,
          fileEnd: guild.banner.startsWith('a_') ? 'gif' : 'png',
        })
      : null;

    const [newSplashFile] = await client.ch.fileURL2Buffer([newSplash]);

    if (newSplashFile) {
      newSplashFile.name = `${guild.splash}.${guild.splash?.startsWith('a_') ? 'gif' : 'png'}`;
      embed.thumbnail = {
        url: `attachment://${guild.splash}.${guild.splash?.startsWith('a_') ? 'gif' : 'png'}`,
      };
      files.push(newSplashFile);
    }

    if (newSplashFile) {
      embed.fields?.push({
        name: lan.splash,
        value: lan.splashAppear,
        inline: false,
      });
    }
  };

  const systemChannelID = () => {
    changedKeys.push('systemChannelID');
    embed.fields?.push({
      name: lan.systemChannelID,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.systemChannelID
          ? `<#&${oldGuild.systemChannelID}> / \`${
              guild.channels.get(oldGuild.systemChannelID)?.name
            }\` / \`${oldGuild.systemChannelID}\``
          : language.none,
        newValue: guild.systemChannelID
          ? `<#&${guild.systemChannelID}> / \`${
              guild.channels.get(guild.systemChannelID)?.name
            }\` / \`${guild.systemChannelID}\``
          : language.none,
      }),
      inline: false,
    });
  };

  const vanityURL = () => {
    changedKeys.push('vanityURL');
    embed.fields?.push({
      name: lan.vanityURL,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: oldGuild.vanityURL || language.none,
        newValue: guild.vanityURL || language.none,
      }),
      inline: false,
    });
  };

  const verificationLevel = () => {
    changedKeys.push('verificationLevel');
    let before: string;
    let after: string;

    if (oldGuild.verificationLevel === 0) before = language.none;
    else if (oldGuild.verificationLevel === 1) before = lan.low;
    else if (oldGuild.verificationLevel === 2) before = lan.medium;
    else if (oldGuild.verificationLevel === 3) before = lan.high;
    else before = lan.veryHigh;

    if (guild.verificationLevel === 0) after = language.none;
    else if (guild.verificationLevel === 1) after = lan.low;
    else if (guild.verificationLevel === 2) after = lan.medium;
    else if (guild.verificationLevel === 3) after = lan.high;
    else after = lan.veryHigh;

    embed.fields?.push({
      name: lan.verificationLevel,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: before,
        newValue: after,
      }),
      inline: false,
    });
  };

  const systemChannelFlags = () => {
    changedKeys.push('systemChannelFlags');
    const before = new Discord.SystemChannelFlagsBitField(oldGuild.systemChannelFlags).toArray();
    const after = new Discord.SystemChannelFlagsBitField(guild.systemChannelFlags).toArray();

    embed.fields?.push({
      name: lan.features,
      value: client.ch.stp(language.defaultValuesLog, {
        oldValue: before.length
          ? before
              .map(
                (f) =>
                  language.systemChannelFlags[f as unknown as Discord.SystemChannelFlagsString],
              )
              .join('\n')
          : language.none,
        newValue: after.length
          ? after
              .map(
                (f) =>
                  language.systemChannelFlags[f as unknown as Discord.SystemChannelFlagsString],
              )
              .join('\n')
          : language.none,
      }),
      inline: false,
    });
  };

  switch (true) {
    case 'afkChannelID' in oldGuild && oldGuild.afkChannelID !== guild.afkChannelID: {
      afkChannelID();
      break;
    }
    case 'afkTimeout' in oldGuild && oldGuild.afkTimeout !== guild.afkTimeout: {
      afkTimeout();
      break;
    }
    case 'banner' in oldGuild && oldGuild.banner !== guild.banner: {
      await banner();
      break;
    }
    case 'defaultNotifications' in oldGuild &&
      oldGuild.defaultNotifications !== guild.defaultNotifications: {
      defaultNotifications();
      break;
    }
    case 'description' in oldGuild && oldGuild.description !== guild.description: {
      description();
      break;
    }
    case 'explicitContentFilter' in oldGuild &&
      oldGuild.explicitContentFilter !== guild.explicitContentFilter: {
      explicitContentFilter();
      break;
    }
    case 'features' in oldGuild && oldGuild.features.join(' ') !== guild.features.join(' '): {
      features();
      break;
    }
    case 'icon' in oldGuild && oldGuild.icon !== guild.icon: {
      await icon();
      break;
    }
    case 'large' in oldGuild && oldGuild.large !== guild.large: {
      large();
      break;
    }
    case 'maxMembers' in oldGuild && oldGuild.maxMembers !== guild.maxMembers: {
      maxMembers();
      break;
    }
    case 'maxVideoChannelUsers' in oldGuild &&
      oldGuild.maxVideoChannelUsers !== guild.maxVideoChannelUsers: {
      maxVideoChannelUsers();
      break;
    }
    case 'mfaLevel' in oldGuild && oldGuild.mfaLevel !== guild.mfaLevel: {
      mfaLevel();
      break;
    }
    case 'name' in oldGuild && oldGuild.name !== guild.name: {
      nameChange();
      break;
    }
    case 'nsfwLevel' in oldGuild && oldGuild.nsfwLevel !== guild.nsfwLevel: {
      nsfwLevel();
      break;
    }
    case 'ownerID' in oldGuild && oldGuild.ownerID !== guild.ownerID: {
      await ownerID();
      break;
    }
    case 'preferredLocale' in oldGuild && oldGuild.preferredLocale !== guild.preferredLocale: {
      preferredLocale();
      break;
    }
    case 'premiumSubscriptionCount' in oldGuild &&
      oldGuild.premiumSubscriptionCount !== guild.premiumSubscriptionCount: {
      premiumSubscriptionCount();
      break;
    }
    case 'premiumTier' in oldGuild && oldGuild.premiumTier !== guild.premiumTier: {
      premiumTier();
      break;
    }
    case 'publicUpdatesChannelID' in oldGuild &&
      oldGuild.publicUpdatesChannelID !== guild.publicUpdatesChannelID: {
      publicUpdatesChannelID();
      break;
    }
    case 'rulesChannelID' in oldGuild && oldGuild.rulesChannelID !== guild.rulesChannelID: {
      rulesChannelID();
      break;
    }
    case 'splash' in oldGuild && oldGuild.splash !== guild.splash: {
      await splash();
      break;
    }
    case 'systemChannelFlags' in oldGuild &&
      oldGuild.systemChannelFlags !== guild.systemChannelFlags: {
      systemChannelFlags();
      break;
    }
    case 'systemChannelID' in oldGuild && oldGuild.systemChannelID !== guild.systemChannelID: {
      systemChannelID();
      break;
    }
    case 'vanityURL' in oldGuild && oldGuild.vanityURL !== guild.vanityURL: {
      vanityURL();
      break;
    }
    case 'verificationLevel' in oldGuild &&
      oldGuild.verificationLevel !== guild.verificationLevel: {
      verificationLevel();
      break;
    }
    default: {
      break;
    }
  }

  if (!changedKeys.length) return;

  const audit = await client.ch.getAudit(guild, 1);
  if (audit) embed.description = client.ch.stp(lan.description, { user: audit.user });
  else embed.description = lan.descriptionNoAudit;

  client.ch.send(channels, { embeds: [embed], files }, language, null, 10000);
};
