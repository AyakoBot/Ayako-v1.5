const Discord = require('discord.js');

module.exports = {
  async execute(oldState, newState) {
    if (!oldState || !newState) return;
    const client = oldState ? oldState.client : newState.client;
    const { ch } = client;
    const Constants = client.constants;
    const { guild } = oldState;
    const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
    if (res && res.rowCount > 0) {
      const channels = res.rows[0].voiceevents
        ?.map((id) =>
          typeof client.channels.cache.get(id)?.send === 'function'
            ? client.channels.cache.get(id)
            : null,
        )
        .filter((c) => c !== null);
      if (channels && channels.length) {
        const language = await ch.languageSelector(guild);
        const lan = language.voiceUpdate;
        const con = Constants.voiceUpdate;
        const embed = new Discord.UnsafeEmbed().setTimestamp().setColor(con.color).setAuthor({
          name: lan.author.name,
          iconURL: con.author.image,
        });
        const changedKey = [];
        if (
          oldState.selfDeaf !== newState.selfDeaf &&
          oldState.serverDeaf === newState.serverDeaf
        ) {
          changedKey.push(language.deaf);
          embed.addFields({
            name: language.deaf,
            value: `${language.before}: \`${oldState.deaf}\`\n${language.after}: \`${newState.deaf}\``,
          });
        } else if (
          oldState.selfDeaf === newState.selfDeaf &&
          oldState.serverDeaf !== newState.serverDeaf
        ) {
          changedKey.push(language.deaf);
          const entry = await getAudit(24);
          if (entry) {
            if (ch.getUnix(entry.id) > Date.now() - 3000) {
              embed.addFields({
                name: language.deaf,
                value: ch.stp(lan.deafAudit, {
                  oldState,
                  newState,
                  user: entry.executor,
                }),
              });
            } else {
              embed.addFields({
                name: language.deaf,
                value: ch.stp(lan.deaf, { oldState, newState }),
              });
            }
          } else {
            embed.addFields({
              name: language.deaf,
              value: ch.stp(lan.deafNoAudit, { oldState, newState }),
            });
          }
        }
        if (
          oldState.selfMute !== newState.selfMute &&
          oldState.serverMute === newState.serverMute
        ) {
          changedKey.push(language.mute);
          embed.addFields({ name: language.mute, value: ch.stp(lan.mute, { oldState, newState }) });
        } else if (
          oldState.selfMute === newState.selfMute &&
          oldState.serverMute !== newState.serverMute
        ) {
          changedKey.push(language.mute);
          const entry = await getAudit(24);
          if (entry) {
            if (ch.getUnix(entry.id) > Date.now() - 3000) {
              embed.addFields({
                name: language.mute,
                value: ch.stp(lan.muteAudit, {
                  oldState,
                  newState,
                  user: entry.executor,
                }),
              });
            } else {
              embed.addFields({
                name: language.mute,
                value: ch.stp(lan.mute, { oldState, newState }),
              });
            }
          } else {
            embed.addFields({
              name: language.mute,
              value: ch.stp(lan.muteNoAudit, { oldState, newState }),
            });
          }
        }
        if (oldState.selfVideo !== newState.selfVideo) {
          changedKey.push(language.camera);
          if (oldState.selfVideo) embed.addFields({ name: '\u200b', value: lan.stopCamera });
          else if (newState.selfVideo) embed.addFields({ name: '\u200b', value: lan.startCamera });
        }
        if (oldState.streaming !== newState.streaming) {
          changedKey.push(language.streaming);
          if (oldState.streaming) embed.addFields({ name: '\u200b', value: lan.stopStream });
          else if (newState.streaming) embed.addFields({ name: '\u200b', value: lan.startStream });
        }
        if (
          oldState.channel &&
          newState.channel &&
          (oldState.channel.type === 13 || newState.channel.type === 13)
        ) {
          if (oldState.suppress !== newState.suppress) {
            changedKey.push(language.suppress);
            if (oldState.suppress) {
              embed.addFields({
                name: '\u200b',
                value: ch.stp(lan.setSuppress, { newChannel: newState.channel }),
              });
            } else if (newState.suppress) {
              embed.addFields({
                name: '\u200b',
                value: ch.stp(lan.unsetSuppress, { newChannel: newState.channel }),
              });
            }
          }
          if (oldState.requestToSpeakTimestamp !== newState.requestToSpeakTimestamp) {
            changedKey.push(language.requestToSpeak);
            if (oldState.requestToSpeakTimestamp) {
              embed.addFields({ name: '\u200b', value: lan.loweredHand });
            } else if (newState.requestToSpeakTimestamp) {
              embed.addFields({ name: '\u200b', value: lan.raisedHand });
            }
          }
        }
        if (oldState.channel !== newState.channel) {
          changedKey.push(language.channel);
          if (oldState.channel && newState.channel) {
            const entry = await getAudit(26);
            if (entry) {
              if (ch.getUnix(entry.id) > Date.now() - 3000) {
                embed.addFields({
                  name: language.moved,
                  value: ch.stp(lan.movedAudit, {
                    newType: language.channelTypes[newState.channel.type],
                    oldType: language.channelTypes[oldState.channel.type],
                    user: entry.executor,
                    oldChannel: oldState.channel,
                    newChannel: newState.channel,
                  }),
                });
              } else {
                embed.addFields({
                  name: language.moved,
                  value: ch.stp(lan.moved, {
                    newType: language.channelTypes[newState.channel.type],
                    oldType: language.channelTypes[oldState.channel.type],
                    oldChannel: oldState.channel,
                    newChannel: newState.channel,
                  }),
                });
              }
            } else {
              embed.addFields({
                name: language.moved,
                value: ch.stp(lan.movedNoAudit, {
                  newType: language.channelTypes[newState.channel.type],
                  oldType: language.channelTypes[oldState.channel.type],
                  oldChannel: oldState.channel,
                  newChannel: newState.channel,
                }),
              });
            }
          } else if (oldState.channel) {
            const entry = await getAudit(27);
            embed.setColor(con.leaveColor);
            if (entry) {
              if (ch.getUnix(entry.id) > Date.now() - 3000) {
                embed.addFields({
                  name: language.disconnected,
                  value: ch.stp(lan.disconnectedAudit, {
                    oldType: language.channelTypes[oldState.channel.type],
                    user: entry.executor,
                    oldChannel: oldState.channel,
                  }),
                });
              } else {
                embed.addFields({
                  name: language.disconnected,
                  value: ch.stp(lan.disconnected, {
                    oldType: language.channelTypes[oldState.channel.type],
                    oldChannel: oldState.channel,
                  }),
                });
              }
            } else {
              embed.addFields({
                name: language.disconnected,
                value: ch.stp(lan.disconnected, {
                  oldType: language.channelTypes[oldState.channel.type],
                  oldChannel: oldState.channel,
                }),
              });
            }
          } else {
            embed.addFields({
              name: language.connected,
              value: ch.stp(lan.connected, {
                newType: language.channelTypes[newState.channel.type],
                newChannel: newState.channel,
              }),
            });
            embed.setColor(con.joinColor);
          }
        }
        if (changedKey.length < 1) return;
        embed.setDescription(
          ch.stp(lan.description, { user: newState ? newState.member.user : oldState.member.user }),
        );
        embed.description = embed.description
          ? `${embed.description}\n\n${language.changes}: ${changedKey.map((o) => ` \`${o}\``)}`
          : `${language.changes}: ${changedKey.map((o) => ` \`${o}\``)}`;
        if (embed.description) ch.send(channels, { embeds: [embed] });
      }
    }
    async function getAudit(type) {
      let entry;
      if (guild.me.permissions.has(128n)) {
        const audits = await guild.fetchAuditLogs({ limit: 3, type });
        if (audits && audits.entries) {
          const audit = audits.entries.filter((a) => {
            if (a.target) return a.target.id === newState.member.user.id;
            if (a.extra.channel) return a.extra.channel.id;
            if (newState.channel === '') return newState.channel.id;
            return oldState.channel.id;
          });
          entry = audit.sort((a, b) => (b && a ? b.id - a.id : ''));
          entry = entry.first();
        }
      }
      return entry;
    }
  },
};
