const jobs = require('node-schedule');
const Builders = require('@discordjs/builders');

module.exports = {
  async execute(executor, target, reason, msg, duration, channel) {
    if (msg.m) msg.m = await msg.m.fetch();
    const mexisted = !!msg.m;
    const language = await msg.client.ch.languageSelector(msg.guild);
    const lan = language.mod.channelbanAdd;
    const con = msg.client.constants.mod.channelbanAdd;
    const now = Date.now();
    let em;
    if (mexisted) {
      em = new Builders.UnsafeEmbedBuilder(msg.m.embeds[0]).setColor(con.color).addFields({
        name: '\u200b',
        value: `${msg.client.textEmotes.loading} ${lan.loading}}`,
      });
    } else {
      em = new Builders.UnsafeEmbedBuilder()
        .setColor(con.color)
        .setDescription(`${msg.client.textEmotes.loading} ${lan.loading}`);
    }
    if (msg.id) {
      if (mexisted) await msg.m.edit({ embeds: [em] });
      else msg.m = await msg.client.ch.reply(msg, { embeds: [em] });
      const member = await msg.guild.members.fetch(target.id).catch(() => {});
      const exec = await msg.guild.members.fetch(executor.id).catch(() => {});
      if (exec?.roles.highest.position <= member?.roles.highest.position) {
        if (mexisted) {
          em.data.fields.pop();
          em.addFields({
            name: '\u200b',
            value: `${msg.client.textEmotes.cross} ${lan.exeNoPerms}`,
          });
        } else em.setDescription(`${msg.client.textEmotes.cross} ${lan.exeNoPerms}`);
        msg.m?.edit({ embeds: [em] });
        if (mexisted) {
          jobs.scheduleJob(new Date(Date.now() + 10000), () => {
            msg.m?.delete().catch(() => {});
          });
        }
        return false;
      }
      if (executor.id === target.id) {
        if (mexisted) {
          em.data.fields.pop();
          em.addFields({
            name: '\u200b',
            value: `${msg.client.textEmotes.cross} ${lan.selfBan}}`,
          });
        } else em.setDescription(`${msg.client.textEmotes.cross} ${lan.selfBan}`);
        msg.m?.edit({ embeds: [em] });
        if (mexisted) {
          jobs.scheduleJob(new Date(Date.now() + 10000), () => {
            msg.m?.delete().catch(() => {});
          });
        }
        return false;
      }
      if (target.id === msg.client.user.id) {
        if (mexisted) {
          em.data.fields.pop();
          em.addFields({
            name: '\u200b',
            value: `${msg.client.textEmotes.cross} ${lan.meBan}`,
          });
        } else em.setDescription(`${msg.client.textEmotes.cross} ${lan.meBan}`);
        msg.m?.edit({ embeds: [em] });
        if (mexisted) {
          jobs.scheduleJob(new Date(Date.now() + 10000), () => {
            msg.m?.delete().catch(() => {});
          });
        }
        return false;
      }
      if (member?.bannable === false) {
        if (mexisted) {
          em.data.fields.pop();
          em.addFields({
            name: '\u200b',
            value: `${msg.client.textEmotes.cross} ${lan.permissionError}`,
          });
        } else em.setDescription(`${msg.client.textEmotes.cross} ${lan.permissionError}`);
        msg.m?.edit({ embeds: [em] });
        if (mexisted) {
          jobs.scheduleJob(new Date(Date.now() + 10000), () => {
            msg.m?.delete().catch(() => {});
          });
        }
        return false;
      }

      const channelBanned =
        channel.permissionOverwrites.cache.get(target.id)?.deny.has(2048n) &&
        channel.permissionOverwrites.cache.get(target.id)?.deny.has(1048576n);

      if (channelBanned) {
        if (mexisted) {
          em.data.fields.pop();
          em.addFields({
            name: '\u200b',
            value: `${msg.client.textEmotes.cross} ${msg.client.ch.stp(lan.alreadyBanned, {
              target,
            })}`,
          });
        } else {
          em.setDescription(
            `${msg.client.textEmotes.cross} ${msg.client.ch.stp(lan.alreadyBanned, {
              target,
            })}`,
          );
        }
        msg.m?.edit({ embeds: [em] });
        if (mexisted) {
          jobs.scheduleJob(new Date(Date.now() + 10000), () => {
            msg.m?.delete().catch(() => {});
          });
        }
        return false;
      }
    }
    const dmChannel = await target.createDM().catch(() => {});
    const DMembed = new Builders.UnsafeEmbedBuilder()
      .setDescription(`**${language.reason}:** \n${reason}`)
      .setColor(con.color)
      .setTimestamp()
      .setAuthor({
        name: msg.client.ch.stp(lan.dm.author, { guild: msg.guild }),
        iconURL: lan.author.image,
        url: msg.client.ch.stp(con.author.link, { guild: msg.guild }),
      });
    const m = await msg.client.ch.send(dmChannel, { embeds: [DMembed] });
    let err;
    const channelBan = await new Promise((resolve, reject) => {
      commitBan(msg, target, executor, reason, channel, resolve, reject, lan);
    }).catch((e) => {
      err = e;
    });
    if (channelBan) {
      await msg.client.ch.query(
        `INSERT INTO warns
         (guildid, userid, reason, type, duration, closed, dateofwarn, warnedinchannelid, warnedbyuserid, warnedinchannelname, warnedbyusername, channelbanid) VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
        [
          msg.guild.id,
          target.id,
          reason,
          'ChannelBan',
          duration ? now + Number(duration) : null,
          !duration,
          now,
          msg.channel.id,
          executor.id,
          msg.channel.name,
          msg.author.username,
          channel.id,
        ],
      );
      const embed = new Builders.UnsafeEmbedBuilder()
        .setColor(con.color)
        .setAuthor({
          name: msg.client.ch.stp(lan.author, { user: target, channel }),
          iconURL: target.displayAvatarURL({ size: 4096 }),
          url: msg.client.constants.standard.invite,
        })
        .setDescription(msg.client.ch.stp(lan.description, { user: executor, target, channel }))
        .setTimestamp()
        .addFields({ name: language.reason, value: `${reason}` })
        .setFooter({ text: msg.client.ch.stp(lan.footer, { user: executor, target }) });
      if (msg.logchannels && msg.logchannels.length) {
        msg.client.ch.send(msg.logchannels, { embeds: [embed] });
      }
    } else {
      m?.delete().catch(() => {});
      if (mexisted) {
        em.data.fields.pop();
        em.addFields({
          name: '\u200b',
          value: `${msg.client.textEmotes.cross + lan.error} ${msg.client.ch.makeCodeBlock(err)}`,
        });
      } else {
        em.setDescription(
          `${msg.client.textEmotes.cross + lan.error} ${msg.client.ch.makeCodeBlock(err)}`,
        );
      }
      msg.m?.edit({ embeds: [em] });
      if (mexisted) {
        jobs.scheduleJob(new Date(Date.now() + 10000), () => {
          msg.m?.delete().catch(() => {});
        });
      }
      return false;
    }
    if (mexisted) {
      em.data.fields.pop();
      em.addFields({
        name: '\u200b',
        value: `${msg.client.textEmotes.tick} ${msg.client.ch.stp(lan.success, {
          target,
        })}`,
      });
    } else {
      em.setDescription(
        `${msg.client.textEmotes.tick} ${msg.client.ch.stp(lan.success, { target })}`,
      );
    }

    await msg.m?.edit({ embeds: [em] });
    if (!duration) return true;

    const res2 = await msg.client.ch.query(
      'SELECT * FROM warns WHERE guildid = $1 AND userid = $2 AND dateofwarn = $3;',
      [msg.guild.id, target.id, now],
    );
    if (res2 && res2.rowCount > 0) {
      [msg.r] = res2.rows;
      msg.client.channelBans.set(
        `${msg.guild.id}-${target.id}`,
        jobs.scheduleJob(`${msg.guild.id}-${target.id}`, new Date(Date.now() + duration), () => {
          msg.client.emit(
            'modChannelbanRemove',
            msg.client.user,
            target,
            language.ready.unmute.reason,
            msg,
            channel,
          );
        }),
      );
      if (msg.source) msg.client.emit('modSourceHandler', msg, em);
      return true;
    }
    return false;
  },
};

const commitBan = async (msg, target, executor, reason, channel, resolve, reject) => {
  if (!channel.manageable) {
    reject(msg.language.errors.channelNotManageable);
    return;
  }

  let ended = false;
  if (!channel.permissionOverwrites.cache.has(target.id)) {
    await channel.permissionOverwrites
      .create(
        target.id,
        {},
        {
          reason: `${executor.tag} | ${reason}`,
          type: 1,
        },
      )
      .catch((err) => {
        ended = true;
        reject(err);
      });
  }

  if (ended) return;

  const edit = await channel.permissionOverwrites
    .edit(
      target.id,
      { SendMessages: false, Connect: false },
      {
        reason: `${executor.tag} | ${reason}`,
        type: 1,
      },
    )
    .catch((err) => {
      ended = true;
      reject(err);
    });

  if (ended) return;
  resolve(edit);
};
