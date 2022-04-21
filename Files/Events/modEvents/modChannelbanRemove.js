const jobs = require('node-schedule');
const Builders = require('@discordjs/builders');

module.exports = {
  async execute(executor, target, reason, msg, channel) {
    if (msg.m) msg.m = await msg.m.fetch();
    const mexisted = !!msg.m;
    const language = await msg.client.ch.languageSelector(msg.guild);
    const lan = language.mod.channelbanRemove;
    const con = msg.client.constants.mod.channelbanRemove;
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
    if (mexisted) await msg.m.edit({ embeds: [em] });
    else msg.m = await msg.client.ch.reply(msg, { embeds: [em] });
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
    const channelBanned =
      channel.permissionOverwrites.cache.get(target.id)?.deny.has(2048n) &&
      channel.permissionOverwrites.cache.get(target.id)?.deny.has(1048576n);

    if (channelBanned) {
      let err;
      const channelBan = await new Promise((resolve, reject) => {
        commitUnban(msg, target, executor, reason, channel, resolve, reject, lan);
      }).catch((e) => {
        err = e;
      });

      if (channelBan) {
        const embed = new Builders.UnsafeEmbedBuilder()
          .setColor(con.color)
          .setAuthor({
            name: msg.client.ch.stp(lan.author, { user: target }),
            iconURL: target.displayAvatarURL({ size: 4096 }),
            url: msg.client.constants.standard.invite,
          })
          .setDescription(msg.client.ch.stp(lan.description, { user: executor, target }))
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
    } else {
      if (mexisted) {
        em.data.fields.pop();
        em.addFields({
          name: '\u200b',
          value: `${msg.client.textEmotes.cross} ${lan.notBanned}`,
        });
      } else em.setDescription(`${msg.client.textEmotes.cross} ${lan.notBanned}`);
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
    if (msg.source) msg.client.emit('modSourceHandler', msg, em);

    return true;
  },
};

const commitUnban = async (msg, target, executor, reason, channel, resolve, reject) => {
  if (!channel.manageable) {
    reject(msg.language.errors.channelNotManageable);
    return;
  }

  let ended = false;

  const edit = await channel.permissionOverwrites
    .edit(
      target.id,
      { SendMessages: null, Connect: null },
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

  if (
    edit.permissionOverwrites.cache.get(target.id).deny.bitfield === 0n &&
    edit.permissionOverwrites.cache.get(target.id).allow.bitfield === 0n
  ) {
    await channel.permissionOverwrites
      .delete(target.id, `${executor.tag} | ${reason}`)
      .catch((err) => {
        ended = true;
        reject(err);
      });
  }

  if (ended) return;
  resolve(edit);
};
