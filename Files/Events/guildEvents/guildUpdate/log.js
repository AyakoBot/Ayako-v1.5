const Builders = require('@discordjs/builders');

module.exports = async (oldGuild, newGuild) => {
  const client = oldGuild ? oldGuild.client : newGuild.client;
  const { ch } = client;
  const Constants = client.constants;
  const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [newGuild.id]);
  if (res && res.rowCount > 0) {
    const channels = res.rows[0].guildevents
      ?.map((id) =>
        typeof client.channels.cache.get(id)?.send === 'function'
          ? client.channels.cache.get(id)
          : null,
      )
      .filter((c) => c !== null);
    if (channels && channels.length) {
      const language = await ch.languageSelector(newGuild);
      const lan = language.guildUpdate;
      const con = Constants.guildUpdate;
      const embed = new Builders.UnsafeEmbedBuilder()
        .setAuthor({
          name: lan.author.name,
          iconURL: con.author.image,
        })
        .setTimestamp()
        .setColor(con.color);
      let entry;
      oldGuild.change = [];
      if (oldGuild.available === false && newGuild.available === true) {
        oldGuild.change.push('available');
        ch.query(
          `UPDATE antispamsettings SET forcedisabled = false WHERE guildid = '${newGuild.id}';`,
        );
        embed.setDescription(lan.antispam);
      } else if (oldGuild.available === true && newGuild.available === false) {
        return ch.query(
          `UPDATE antispamsettings SET forcedisabled = true WHERE guildid = '${newGuild.id}';`,
        );
      }
      if (oldGuild.name !== newGuild.name) {
        oldGuild.change.push('name');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.name,
          value: `${language.before}: \`${oldGuild.name}\`\n${language.after}: \`${newGuild.name}\``,
        });
      }
      let files;
      if (oldGuild.icon !== newGuild.icon) {
        oldGuild.change.push('icon');
        entry = await getAudits(newGuild);
        const buffers = await ch.convertImageURLtoBuffer([oldGuild.splashURL()]);
        if (buffers.length) {
          files = buffers;
          embed.setImage(`attachment://${buffers[0].name}`);
          embed.addFields({ name: '\u200b', value: lan.IconOld });
        }
      }
      if (oldGuild.splash !== newGuild.splash) {
        oldGuild.change.push('splash');
        entry = await getAudits(newGuild);
        const buffers = await ch.convertImageURLtoBuffer([oldGuild.splashURL()]);
        if (buffers.length) {
          files = buffers;
          embed.setImage(`attachment://${buffers[0].name}`);
          embed.addFields({ name: '\u200b', value: lan.splashOld });
        }
      }
      if (oldGuild.discoverySplash !== newGuild.discoverySplash) {
        oldGuild.change.push('discoverySplash');
        entry = await getAudits(newGuild);
        const buffers = await ch.convertImageURLtoBuffer([oldGuild.splashURL()]);
        if (buffers.length) {
          files = buffers;
          embed.setImage(`attachment://${buffers[0].name}`);
          embed.addFields({ name: '\u200b', value: lan.discoverySplashOld });
        }
      }
      if (oldGuild.banner !== newGuild.banner) {
        oldGuild.change.push('banner');
        entry = await getAudits(newGuild);
        const buffers = await ch.convertImageURLtoBuffer([oldGuild.splashURL()]);
        if (buffers.length) {
          files = buffers;
          embed.setImage(`attachment://${buffers[0].name}`);
          embed.addFields({ name: '\u200b', value: lan.bannerOld });
        }
      }
      if (oldGuild.region !== newGuild.region) {
        oldGuild.change.push('region');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.rtc_region,
          value: `${language.before}: \`${oldGuild.region}\`\n${language.after}: \`${newGuild.region}\``,
        });
      }
      if (oldGuild.features !== newGuild.features) {
        entry = await getAudits(newGuild);
        const uniques = ch.getDifference(oldGuild.features, newGuild.features);
        if (uniques.length) {
          embed.addFields({
            name: language.enabled,
            value: `${uniques.map((f) => `${language.features[f]}\n`)}`,
          });
          oldGuild.change.push('featuresName');
        }
      }
      if (oldGuild.afkTimeout !== newGuild.afkTimeout) {
        oldGuild.change.push('afkTimeout');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.afkTimeout,
          value: `${language.before}: \`${oldGuild.afkTimeout / 60} ${language.time.minutes}\`\n${
            language.after
          }: \`${newGuild.afkTimeout / 60} ${language.time.minutes}\``,
        });
      }
      if (oldGuild.afkChannelID !== newGuild.afkChannelID) {
        oldGuild.change.push('afkChannelID');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.afkChannelID,
          value: `${language.before}: ${
            oldGuild.afkChannelID ? `<#${oldGuild.afkChannelID}>` : language.none
          }\n${language.after}: ${
            newGuild.afkChannelID ? `<#${newGuild.afkChannelID}>` : language.none
          }`,
        });
      }
      if (oldGuild.systemChannelID !== newGuild.systemChannelID) {
        oldGuild.change.push('systemChannelID');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.systemChannelID,
          value: `${language.before}: ${
            oldGuild.systemChannelID ? `<#${oldGuild.systemChannelID}>` : language.none
          }\n${language.after}: ${
            newGuild.systemChannelID ? `<#${newGuild.systemChannelID}>` : language.none
          }`,
        });
      }
      if (
        (oldGuild.embedEnabled === true && newGuild.embedEnabled === false) ||
        (oldGuild.embedEnabled === false && newGuild.embedEnabled === true)
      ) {
        oldGuild.change.push('embedEnabled');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.embedEnabled,
          value: `${language.before}: \`${
            oldGuild.embedEnabled ? language.enabled : language.disabled
          }\`\n${language.after}: \`${
            newGuild.embedEnabled ? language.enabled : language.disabled
          }\``,
        });
      }
      if (oldGuild.premiumSubscriptionCount !== newGuild.premiumSubscriptionCount) {
        oldGuild.change.push('premiumSubscriptionCount');
        if (oldGuild.premiumTier > newGuild.premiumTier) {
          embed.setDescription(
            ch.stp(lan.BoostRemove, {
              boosters: newGuild.premiumSubscriptionCount,
              tier: newGuild.premiumTier,
            }),
          );
        } else {
          embed.setDescription(
            ch.stp(lan.BoostAdd, {
              boosters: newGuild.premiumSubscriptionCount,
              tier: newGuild.premiumTier,
            }),
          );
        }
      }
      if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
        oldGuild.change.push('verificationLevelName');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.verificationLevel.verificationLevel,
          value: `${language.before}: ${language.verificationLevel[oldGuild.verificationLevel]}\n${
            language.after
          }: ${language.verificationLevel[newGuild.verificationLevel]}`,
        });
      }
      if (oldGuild.explicitContentFilter !== newGuild.explicitContentFilter) {
        oldGuild.change.push('explicitContentFilterName');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.explicitContentFilter.explicitContentFilter,
          value: `${language.before}: ${
            language.explicitContentFilter[oldGuild.explicitContentFilter]
          }\n${language.after}: ${language.explicitContentFilter[newGuild.explicitContentFilter]}`,
        });
      }
      if (oldGuild.mfaLevel !== newGuild.mfaLevel) {
        oldGuild.change.push('mfaLevelName');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.mfaLevel.mfaLevel,
          value: `${language.before}: ${language.mfaLevel[oldGuild.mfaLevel]}\n${language.after}: ${
            language.mfaLevel[newGuild.mfaLevel]
          }`,
        });
      }
      if (oldGuild.defaultMessageNotifications !== newGuild.defaultMessageNotifications) {
        oldGuild.change.push('defaultMessageNotificationsName');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.defaultMessageNotificationsName,
          value: `${language.before}: ${
            language.defaultMessageNotifications[oldGuild.defaultMessageNotifications]
          }\n${language.after}: ${
            language.defaultMessageNotifications[newGuild.defaultMessageNotifications]
          }`,
        });
      }
      if (oldGuild.vanityURLCode !== newGuild.vanityURLCode) {
        oldGuild.change.push('vanityURLCode');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.vanityURLCode,
          value: `${language.before}: \`${
            oldGuild.vanityURLCode ? oldGuild.vanityURLCode : language.none
          }\`\n${language.after}: \`${
            newGuild.vanityURLCode ? newGuild.vanityURLCode : language.none
          }\``,
        });
      }
      if (oldGuild.description !== newGuild.description) {
        oldGuild.change.push('description');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.description,
          value: `${language.before}: \`${
            oldGuild.description ? oldGuild.description : language.none
          }\`\n${language.after}: \`${
            newGuild.description ? newGuild.description : language.none
          }\``,
        });
      }
      if (oldGuild.rulesChannelID !== newGuild.rulesChannelID) {
        oldGuild.change.push('rulesChannelID');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.rulesChannelID,
          value: `${language.before}: ${
            oldGuild.rulesChannelID ? `<#${oldGuild.rulesChannelID}>` : language.none
          }\n${language.after}: ${
            newGuild.rulesChannelID ? `<#${newGuild.rulesChannelID}>` : language.none
          }`,
        });
      }
      if (oldGuild.publicUpdatesChannelID !== newGuild.publicUpdatesChannelID) {
        oldGuild.change.push('publicUpdatesChannelID');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.publicUpdatesChannelID,
          value: `${language.before}: ${
            oldGuild.publicUpdatesChannelID
              ? `<#${oldGuild.publicUpdatesChannelID}>`
              : language.none
          }\n${language.after}: ${
            newGuild.publicUpdatesChannelID
              ? `<#${newGuild.publicUpdatesChannelID}>`
              : language.none
          }`,
        });
      }
      if (oldGuild.preferredLocale !== newGuild.preferredLocale) {
        oldGuild.change.push('preferredLocale');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.preferredLocale,
          value: `${language.before}: \`${oldGuild.preferredLocale}\`\n${language.after}: \`${newGuild.preferredLocale}\``,
        });
      }
      if (oldGuild.nsfw !== newGuild.nsfw) {
        oldGuild.change.push('nsfw');
        entry = await getAudits(newGuild);
        embed.addFields({
          name: language.nsfw,
          value: `${language.before}: \`${oldGuild.nsfw}\`\n${language.after}: \`${newGuild.nsfw}\``,
        });
      }
      if (oldGuild.ownerID !== newGuild.ownerID) {
        embed.setDescription(
          ch.stp(lan.ownerSwitch, {
            user: await client.users.fetch(oldGuild.ownerID),
            target: await client.users.fetch(newGuild.ownerID),
          }),
        );
      }
      if (oldGuild.change) {
        if (!embed.description) {
          if (entry) {
            embed.setDescription(
              ch.stp(lan.standardWithAudit, { user: entry.executor }) +
                oldGuild.change.map((change) => ` \`${language[change]}\``),
            );
          } else {
            embed.setDescription(
              ch.stp(lan.standardWithoutAudit, {
                change: oldGuild.change.map((change) => ` \`${language[change]}\``),
              }),
            );
          }
        }
      }
      if (embed.description) {
        ch.send(channels, { embeds: [embed], files }, 5000);
      }
    }
  }
  return null;
};

const getAudits = async (guild) => {
  let entry;
  if (guild.me.permissions.has(128n)) {
    const audits = await guild.fetchAuditLogs({ limit: 5, type: 1 }).catch(() => {});
    if (audits && audits.entries) {
      entry = audits.entries.sort((a, b) => b.id - a.id);
      entry = entry.first();
    }
  }
  if (entry && entry.id) return entry;
  return null;
};
