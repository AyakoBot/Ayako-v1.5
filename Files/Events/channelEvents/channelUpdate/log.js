const Discord = require('discord.js');

module.exports = {
  async execute(oldChannel, newChannel) {
    const client = oldChannel ? oldChannel.client : newChannel.client;
    if (oldChannel.type === 'dm') return;
    if (newChannel.position !== oldChannel.position) return;
    if (newChannel.children !== oldChannel.children) return;
    const ch = require('../../../BaseClient/ClientHelper');
    const Constants = require('../../../Constants.json');
    const { guild } = newChannel;
    const res = await ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [guild.id]);
    if (res && res.rowCount > 0) {
      const channels = res.rows[0].channelevents
        ?.map((id) =>
          typeof client.channels.cache.get(id)?.send === 'function'
            ? client.channels.cache.get(id)
            : null,
        )
        .filter((c) => c !== null);
      if (channels && channels.length) {
        const language = await ch.languageSelector(guild);
        const lan = language.channelUpdate;
        const con = Constants.channelUpdate;
        let typeID;
        const embed = new Discord.MessageEmbed()
          .setAuthor({
            name: ch.stp(lan.author.title, { type: `${language.channels[newChannel.type]}` }),
            iconURL: con.author.image,
            url: ch.stp(con.author.link, { channel: newChannel }),
          })
          .setTimestamp()
          .setColor(con.color);
        let changedKey = [];
        if (oldChannel.name !== newChannel.name) {
          changedKey.push(language.name);
          typeID = 11;
          embed.addField(
            language.name,
            `${language.before}: \`${oldChannel.name}\`\n${language.after}: \`${newChannel.name}\``,
          );
        }
        if (oldChannel.parent !== newChannel.parent) {
          changedKey.push(language.category);
          typeID = 11;
          embed.addField(
            language.category,
            `${language.before}: \`${oldChannel.parent.name}\`\n${language.after}: \`${newChannel.parent.name}\``,
          );
        }
        if (oldChannel.nsfw !== newChannel.nsfw) {
          changedKey.push(language.nsfw);
          typeID = 11;
          embed.addField(
            language.nsfw,
            `${language.before}: \`${oldChannel.nsfw}\`\n${language.after}: \`${newChannel.nsfw}\``,
          );
        }
        if (
          oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser &&
          newChannel.rateLimitPerUser &&
          oldChannel.rateLimitPer
        ) {
          changedKey.push(language.rate_limit_per_user);
          typeID = 11;
          embed.addField(
            language.rate_limit_per_user,
            `${language.before}: \`${oldChannel.rateLimitPerUser} ${language.time.seconds}\`\n${language.after}: \`${newChannel.rateLimitPerUser} ${language.time.seconds}\``,
          );
        }
        if (oldChannel.topic !== newChannel.topic) {
          changedKey.push(language.topic);
          typeID = 11;
          if (oldChannel.type === 'stage')
            embed.addField(
              language.stageOpen,
              `${language.before}: \`${oldChannel.topic}\`\n${language.after}: \`${newChannel.topic}\``,
            );
          else
            embed.addField(
              language.topic,
              `${language.before}: \`${oldChannel.topic}\`\n${language.after}: \`${newChannel.topic}\``,
            );
        }
        if (oldChannel.type !== newChannel.type) {
          changedKey.push(language.type);
          typeID = 11;
          embed.addField(
            language.type,
            `${language.before}: \`${language.channels[oldChannel.type]}\`\n${language.after}: \`${
              language.channels[newChannel.type]
            }\``,
          );
        }
        if (oldChannel.bitrate !== newChannel.bitrate) {
          changedKey.push(language.bitrate);
          typeID = 11;
          embed.addField(
            language.bitrate,
            `${language.before}: \`${oldChannel.bitrate / 1000} kbps\`\n${language.after}: \`${
              newChannel.bitrate / 1000
            } kbps\``,
          );
        }
        if (oldChannel.rtcRegion !== newChannel.rtcRegion) {
          changedKey.push(language.rtc_region);
          typeID = 11;
          embed.addField(
            language.rtc_region,
            `${language.before}: \`${
              oldChannel.rtcRegion ? oldChannel.rtcRegion : 'automatic'
            }\`\n${language.after}: \`${
              newChannel.rtcRegion ? newChannel.rtcRegion : 'automatic'
            }\``,
          );
        }
        if (oldChannel.userLimit !== newChannel.userLimit) {
          changedKey.push(language.user_limit);
          typeID = 11;
          embed.addField(
            language.user_limit,
            `${language.before}: \`${oldChannel.userLimit}\`\n${language.after}: \`${newChannel.userLimit}\``,
          );
        }
        if (oldChannel.permissionOverwrites.cache !== newChannel.permissionOverwrites.cache) {
          const tempOP = [];
          const tempNP = [];

          oldChannel.permissionOverwrites.cache
            .map((o) => o)
            .forEach((o) => {
              const temp = {
                id: o.id,
                type: o.type,
                allow: o.allow,
                deny: o.deny,
              };
              tempOP.push(temp);
            });
          newChannel.permissionOverwrites.cache
            .map((o) => o)
            .forEach((o) => {
              const temp = {
                id: o.id,
                type: o.type,
                allow: o.allow,
                deny: o.deny,
              };
              tempNP.push(temp);
            });

          const newPerms = [];
          const oldPerms = [];

          tempNP.forEach((np) => {
            const op = tempOP.find((n) => n.id === np.id && n.type === np.type);
            if (op) {
              if (!np.allow.equals(op.allow) || !np.deny.equals(op.deny)) {
                newPerms.push(np);
              }
            }
          });

          tempOP.forEach((op) => {
            const np = tempNP.find((n) => n.id === op.id && n.type === op.type);
            if (np) {
              if (!op.allow.equals(np.allow) || !op.deny.equals(np.deny)) {
                oldPerms.push(op);
              }
            }
          });

          if (oldPerms.length > newPerms.length) {
            changedKey.push(language.permission_overwrites);
            let deletedPerm;
            typeID = 15;
            if (newPerms[0] && !oldPerms[0]) [deletedPerm] = newPerms;
            else if (oldPerms[0] && !newPerms[0]) [deletedPerm] = oldPerms;
            else {
              newPerms.forEach((n) =>
                oldPerms.forEach((o) => {
                  if (o !== n) deletedPerm = o;
                }),
              );
            }
            let text;
            if (deletedPerm.type === 'member') text = `${language.member} <@${deletedPerm.id}>`;
            else if (deletedPerm.type === 'role') text = `${language.role} <@&${deletedPerm.id}>`;
            else text = `${language.unknown} ${deletedPerm}`;

            embed.addField(language.permissions.removedPermissionsFor, text);
          } else if (oldPerms.length < newPerms.length) {
            changedKey.push(language.permission_overwrites);
            let createdPerm;
            typeID = 13;
            if (newPerms[0] && !oldPerms[0]) [createdPerm] = newPerms;
            else if (oldPerms[0] && !newPerms[0]) [createdPerm] = oldPerms;
            else {
              newPerms.forEach((n) =>
                oldPerms.forEach((o) => {
                  if (o !== n) createdPerm = n;
                }),
              );
            }
            let text;
            if (createdPerm.type === 'member') text = `${language.member} <@${createdPerm.id}>`;
            else if (createdPerm.type === 'role') text = `${language.role} <@&${createdPerm.id}>`;
            else text = `${language.unknown} ${createdPerm}`;
            embed.addField(language.permissions.grantedPermissionFor, text);
          } else {
            for (
              let i = 0;
              newPerms.length > oldPerms.length ? newPerms.length : oldPerms.length > i;
              i += 1
            ) {
              const newPerm = newPerms[i];
              const oldPerm = oldPerms[i];
              const [tBit1, Bit1] = ch.bitUniques(oldPerm.deny, newPerm.deny);
              const [tBit2, Bit2] = ch.bitUniques(oldPerm.allow, newPerm.allow);
              const tBit3 = tBit1.add([...tBit2]);
              const Bit3 = tBit3.remove([...Bit1]).remove([...Bit2]);

              let enable;
              let disable;
              let neutral;

              if (newPerm.type === 'member') {
                disable = `<@${newPerm.id}>\n`;
                enable = `<@${newPerm.id}>\n`;
              } else if (newPerm.type === 'role') {
                disable = `<@&${newPerm.id}>\n`;
                enable = `<@&${newPerm.id}>\n`;
              } else {
                disable = `${language.unknown} ${newPerm}\n`;
                enable = `${language.unknown} ${newPerm}\n`;
              }

              if (oldPerm.type === 'member') {
                neutral = `<@${oldPerm.id}>\n`;
              } else if (oldPerm.type === 'role') {
                neutral = `<@&${oldPerm.id}>\n`;
              } else {
                neutral = `${language.unknown} ${oldPerm}\n`;
              }

              for (let j = 0; Bit1.toArray().length > j; j += 1) {
                disable += `${Constants.switch.disable} \`${
                  language.permissions[Bit1.toArray()[j]]
                }\`\n`;
              }
              for (let j = 0; Bit2.toArray().length > j; j += 1) {
                enable += `${Constants.switch.enable} \`${
                  language.permissions[Bit2.toArray()[j]]
                }\`\n`;
              }
              for (let j = 0; Bit3.toArray().length > j; j += 1) {
                neutral += `${Constants.switch.neutral} \`${
                  language.permissions[Bit3.toArray()[j]]
                }\`\n`;
              }

              if (neutral.includes('`')) {
                embed.addField(
                  `${language.permissions.removedPermissionsFor} ${
                    oldPerm.type === 'member' ? language.member : language.role
                  }`,
                  neutral,
                );
                changedKey.push(language.permission_overwrites);
                typeID = 14;
              }
              if (disable.includes('`')) {
                embed.addField(
                  `${language.permissions.deniedPermissionsFor} ${
                    newPerm.type === 'member' ? language.member : language.role
                  }`,
                  disable,
                );
                changedKey.push(language.permission_overwrites);
                typeID = 14;
              }
              if (enable.includes('`')) {
                embed.addField(
                  `${language.permissions.grantedPermissionFor} ${
                    newPerm.type === 'member' ? language.member : language.role
                  }`,
                  enable,
                );
                changedKey.push(language.permission_overwrites);
                typeID = 14;
              }
            }
          }
          if (!typeID) typeID = 11;
          const audits = await guild.fetchAuditLogs({ limit: 3, type: typeID });
          let entry;
          if (audits && audits.entries) {
            const audit = audits.entries.filter((a) => a.target.id === newChannel.id);
            entry = audit.sort((a, b) => b.id - a.id);
            entry = entry.first();
          }
          if (entry) {
            [...entry.changes.entries()].forEach((change) => {
              for (let i = 1; i < change.length; i += 1) {
                const { key } = change[i];
                const before = change[i].old;
                const after = change[i].new;
                if (key === 'video_quality_mode') {
                  embed.addField(
                    language.video_quality_mode,
                    `${language.before}: \`${before === 1 ? language.automatic : '720p'}\`\n${
                      language.after
                    }: \`${after === 1 ? language.automatic : '720p'}\``,
                  );
                  changedKey.push(language.video_quality_mode);
                }
                if (key === 'type') {
                  let type;
                  if (before === 1) type = language.channelFollower;
                  if (before === 0) type = language.incoming;
                  if (type) embed.addField(language.type, type);
                }
              }
            });
          }

          if (!embed.fields.length) return;

          if (changedKey.length) changedKey = [...new Set(changedKey)];

          if (entry) {
            embed.setDescription(
              `${ch.stp(lan.description.withAudit, {
                user: entry.executor,
                channel: newChannel,
                type: language.channels[newChannel.type],
              })}\n\n${language.changes}:${changedKey.map((o) => ` \`${o}\``)}`,
            );
          } else {
            embed.setDescription(
              `${ch.stp(lan.description.withoutAudit, {
                channel: newChannel,
                type: language.channels[newChannel.type],
              })}\n\n${language.changes}:${changedKey.map((o) => ` \`${o}\``)}`,
            );
          }
          send(channels, embed, language, oldChannel);
        }
      }
    }
  },
};

function send(logchannel, embed, language, { client }) {
  embed.fields.forEach((field) => {
    if (field.value.length > 1024 || embed.length > 6000) {
      const re1 = new RegExp(client.constants.switch.disable, 'g');
      const re2 = new RegExp(client.constants.switch.neutral, 'g');
      const re3 = new RegExp(client.constants.switch.enable, 'g');
      field.value = field.value
        .replace(re1, language.deny)
        .replace(re2, language.neutral)
        .replace(re3, language.allow);
    }
  });
  client.ch.send(logchannel, { embeds: [embed] });
}
