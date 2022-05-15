const Builders = require('@discordjs/builders');

module.exports = {
  async execute(guild) {
    const { client } = guild;
    const { ch } = client;
    const Constants = client.constants;
    const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
    if (res && res.rowCount > 0) {
      const channels = res.rows[0].guildevents
        ?.map((id) =>
          typeof client.channels.cache.get(id)?.send === 'function'
            ? client.channels.cache.get(id)
            : null,
        )
        .filter((c) => c !== null);
      if (channels && channels.length) {
        const language = await ch.languageSelector(guild);

        let entryCreate;
        let entryUpdate;
        let entryDelete;
        if (guild.members.me.permissions.has(128n)) {
          const auditsCreate = await guild.fetchAuditLogs({ limit: 3, type: 80 });
          const auditsUpdate = await guild.fetchAuditLogs({ limit: 3, type: 81 });
          const auditsDelete = await guild.fetchAuditLogs({ limit: 3, type: 82 });

          if (auditsCreate && auditsCreate.entries) {
            entryCreate = auditsCreate.entries.sort((a, b) => b.id - a.id);
          }
          if (auditsUpdate && auditsUpdate.entries) {
            entryUpdate = auditsUpdate.entries.sort((a, b) => b.id - a.id);
          }
          if (auditsDelete && auditsDelete.entries) {
            entryDelete = auditsDelete.entries.sort((a, b) => b.id - a.id);
          }
        }

        if (entryCreate && entryCreate.entries) entryCreate = entryCreate.first();
        if (entryUpdate && entryUpdate.entries) entryUpdate = entryUpdate.first();
        if (entryDelete && entryDelete.entries) entryDelete = entryDelete.first();
        if (entryCreate) entryCreate.timestamp = ch.getUnix(entryCreate.id);
        if (entryUpdate) entryUpdate.timestamp = ch.getUnix(entryUpdate.id);
        if (entryDelete) entryDelete.timestamp = ch.getUnix(entryDelete.id);
        let entry;
        let haveAmount = 0;
        if (entryCreate) haveAmount += 1;
        if (entryDelete) haveAmount += 1;
        if (entryUpdate) haveAmount += 1;
        if (haveAmount === 3) {
          if (entryCreate.timestamp > entryUpdate.timestamp) {
            entry = entryCreate;
          } else {
            entry = entryUpdate;
          }
          if (entryDelete.timestamp > entry) {
            entry = entryDelete;
          }
        } else if (haveAmount === 2) {
          if (entryCreate) {
            if (entryDelete) {
              if (entryCreate.timestamp > entryDelete.timestamp) entry = entryCreate;
              else entry = entryDelete;
            } else if (entryUpdate) {
              if (entryCreate.timestamp > entryUpdate.timestamp) entry = entryCreate;
              else entry = entryUpdate;
            }
          } else if (entryDelete) {
            if (entryUpdate) {
              if (entryDelete.timestamp > entryUpdate.timestamp) entry = entryDelete;
              else entry = entryUpdate;
            }
          }
        } else if (haveAmount === 1) {
          if (entryDelete) entry = entryDelete;
          if (entryCreate) entry = entryCreate;
          if (entryUpdate) entry = entryUpdate;
        }
        const embed = new Builders.UnsafeEmbedBuilder().setTimestamp();
        if (entry.actionType === 'DELETE') {
          let finalEntry;
          if (guild.members.me.permissions.has(128n)) {
            let botBan = await guild.fetchAuditLogs({ limit: 3, type: 20 });
            botBan = botBan.entries.filter(
              (e) => e.target.bot === true && e.executor === entry.executor,
            );
            let botKick = await guild.fetchAuditLogs({ limit: 3, type: 22 });
            botKick = botKick.entries.filter(
              (e) => e.target.bot === true && e.executor === entry.executor,
            );
            if (botBan.first()) botBan.first().timestamp = ch.getUnix(botBan.first().id);
            else botBan = undefined;

            if (botKick.first()) botKick.first().timestamp = ch.getUnix(botKick.first().id);
            else botKick = undefined;

            if (!botBan) botBan = undefined;
            else if (botBan.first().timestamp > +entry.timestamp - 1000) botBan = botBan.first();
            else botBan = undefined;

            if (!botKick) botKick = undefined;
            else if (botKick.first().timestamp > +entry.timestamp - 1000) botKick = botKick.first();
            else botKick = undefined;

            if (botBan && botKick) {
              if (botBan.timestamp > botKick.timestamp) {
                finalEntry = botBan;
              } else {
                finalEntry = botKick;
              }
            } else if (botBan || botKick) {
              if (botBan) finalEntry = botBan;
              if (botKick) finalEntry = botKick;
            } else {
              finalEntry = null;
            }
          }
          const con = Constants.guildIntegrationsRemove;
          const lan = language.guildIntegrationsRemove;
          if (finalEntry !== null) {
            embed.setDescription(
              ch.stp(lan.description.withAudit, {
                user: entry.executor,
                integration: entry.target,
                bot: finalEntry.target,
              }),
            );
          } else {
            embed.setDescription(
              ch.stp(lan.description.withoutAudit, {
                user: entry.executor,
                integration: entry.target,
              }),
            );
          }
          embed.setAuthor({
            name: lan.author.title,
            iconURL: con.author.image,
          });
          embed.setColor(con.color);
          if (entry.name) embed.addFields({ name: language.name, value: entry.name });
          if (entry.type) embed.addFields({ name: language.type, value: entry.type });
          if (entry.enabled !== undefined) {
            embed.addFields({ name: language.enabled, value: entry.enabled });
          }
          if (entry.syncing !== undefined) {
            embed.addFields({ name: language.syncing, value: entry.syncing });
          }
          if (entry.user) embed.addFields({ name: language.user, value: entry.user });
          if (entry.account) embed.addFields({ name: language.account, value: entry.account.name });
          if (entry.application) {
            embed.addFields({
              name: language.application,
              value: `**${entry.application.name}**\n${entry.application.description}`,
            });
          }
          if (entry.expireBehavior) {
            embed.addFields({
              name: language.expireBehavior.name,
              value:
                entry.expireBehavior === 0
                  ? ch.stp(language.expireBehavior.zero, { role: entry.role })
                  : language.expireBehavior.one,
              inline: entry.expireBehavior,
            });
          }
          if (entry.expireGracePeriod) {
            embed.addFields({ name: language.expireGracePeriod, value: entry.expireGracePeriod });
          }
          if (entry.subscriber_count) {
            embed.addFields({ name: language.subscribers, value: entry.subscriber_count });
          }
        }
        if (entry.actionType === 'CREATE') {
          const con = Constants.guildIntegrationsCreate;
          const lan = language.guildIntegrationsCreate;
          embed.setDescription(
            ch.stp(lan.description.withUser, { user: entry.executor, integration: entry.target }),
          );
          embed.setAuthor({
            name: lan.author.title,
            iconURL: con.author.image,
          });
          embed.setColor(con.color);
          if (entry.name) embed.addFields({ name: language.name, value: entry.name });
          if (entry.type) embed.addFields({ name: language.type, value: entry.type });
          if (entry.enabled !== undefined) {
            embed.addFields({ name: language.enabled, value: entry.enabled });
          }
          if (entry.syncing !== undefined) {
            embed.addFields({ name: language.syncing, value: entry.syncing });
          }
          if (entry.user) embed.addFields({ name: language.user, value: entry.user });
          if (entry.account) embed.addFields({ name: language.account, value: entry.account.name });
          if (entry.application) {
            embed.addFields({
              name: language.application,
              value: `**${entry.application.name}**\n${entry.application.description}`,
            });
          }
          if (entry.expireBehavior) {
            embed.addFields({
              name: language.expireBehavior.name,
              value:
                entry.expireBehavior === 0
                  ? ch.stp(language.expireBehavior.zero, { role: entry.role })
                  : language.expireBehavior.one,
              inline: entry.expireBehavior,
            });
          }
          if (entry.expireGracePeriod) {
            embed.addFields({
              name: language.expireGracePeriod,
              value: `${entry.expireGracePeriod} ${language.time.minutes}`,
            });
          }
          if (entry.subscriber_count) {
            embed.addFields({ name: language.subscribers, value: entry.subscriber_count });
          }
          ch.logger(`Integration Update Check console at ${new Date().toUTCString()}`);
        }
        if (entry.actionType === 'UPDATE') {
          const con = Constants.guildIntegrationsUpdate;
          const lan = language.guildIntegrationsUpdate;
          embed.setDescription(
            ch.stp(lan.description.withUser, { user: entry.executor, integration: entry.target }),
          );
          embed.setAuthor({
            name: lan.author.title,
            iconURL: con.author.image,
          });
          embed.setColor(con.color);
          entry.changes.forEach((change) => {
            if (change.key === 'type') {
              embed.addFields({
                name: language.type,
                value: `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`,
              });
            } else if (change.key === 'enabled') {
              embed.addFields({
                name: language.enabled,
                value: `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`,
              });
            } else if (change.key === 'syncing') {
              embed.addFields({
                name: language.syncing,
                value: `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`,
              });
            } else if (change.key === 'role_id') {
              embed.addFields({
                name: language.role,
                value: `**${language.before}:**\n${
                  guild.roles.cache.get(change.old) ? guild.roles.cache.get(change.old) : ''
                }\n\n**${language.after}:**\n${change.new} ${
                  guild.roles.cache.get(change.new) ? guild.roles.cache.get(change.new) : ''
                }`,
              });
            } else if (change.key === 'enable_emoticons') {
              embed.addFields({
                name: language.enlableEmotes,
                value: `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`,
              });
            } else if (change.key === 'user') {
              embed.addFields({
                name: language.user,
                value: `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`,
              });
            } else if (change.key === 'expire_behavior') {
              embed.addFields({
                name: language.expireBehavior,
                value: `**${language.before}:**\n${
                  change.old === 0
                    ? ch.stp(language.expireBehavior.zero, { role: entry.role })
                    : language.expireBehavior.one
                }\n\n**${language.after}:**\n${
                  change.new === 0
                    ? ch.stp(language.expireBehavior.zero, { role: entry.role })
                    : language.expireBehavior.one
                }`,
              });
            } else if (change.key === 'account') {
              embed.addFields({
                name: language.account,
                value: `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`,
              });
            } else if (change.key === 'synced_at') {
              embed.addFields({
                name: language.syncedAt,
                value: `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`,
              });
            } else if (change.key === 'subscriber_count') {
              embed.addFields({
                name: language.subscribers,
                value: `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`,
              });
            } else if (change.key === 'revoked') {
              embed.addFields({
                name: language.revoked,
                value: `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`,
              });
            } else if (change.key === 'application') {
              embed.addFields({
                name: language.application,
                value: `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`,
              });
            } else if (change.key === 'name') {
              embed.addFields({
                name: language.name,
                value: `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`,
              });
            } else {
              embed.addFields({
                name: language.unknown,
                value: `**${language.before}:**\n${change.old}\n\n**${language.after}:**\n${change.new}`,
              });
            }
          });
          ch.logger(`Integration Update Check console at ${new Date().toUTCString()}`);
        }
        ch.send(channels, { embeds: [embed] }, 5000);
      }
    }
  },
};
