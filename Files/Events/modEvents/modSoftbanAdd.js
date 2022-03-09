const Discord = require('discord.js');
const jobs = require('node-schedule');

module.exports = {
  async execute(executor, target, reason, msg, daysToDelete) {
    const mexisted = !!msg.m;
    const language = await msg.client.ch.languageSelector(msg.guild);
    const lan = language.mod.softbanAdd;
    const con = msg.client.constants.mod.softbanAdd;
    let em;
    if (mexisted) {
      em = new Discord.UnsafeEmbed(msg.m.embeds[0]).setColor(con.color).addFields({
        name: '\u200b',
        value: `${msg.client.textEmotes.loading} ${lan.loading}}`,
      });
    } else {
      em = new Discord.UnsafeEmbed()
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
          em.fields.pop();
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
          em.fields.pop();
          em.addFields({
            name: '\u200b',
            value: `${msg.client.textEmotes.cross} ${lan.selfBan}`,
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
          em.fields.pop();
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
          em.fields.pop();
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
      const banned = await msg.guild.bans.fetch(target).catch(() => {});
      if (banned) {
        if (mexisted) {
          em.fields.pop();
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
    const dmChannel = await target?.createDM().catch(() => {});
    const DMembed = new Discord.UnsafeEmbed()
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
    const ban = await msg.guild.members
      .ban(target, { reason, deleteMessageDays: daysToDelete })
      .catch((e) => {
        err = e;
      });
    if (ban) {
      const embed = new Discord.UnsafeEmbed()
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

      const unban = await msg.guild.bans.remove(target, lan.unbanReason).catch((e) => {
        err = e;
      });
      if (!unban) {
        m?.delete().catch(() => {});
        if (mexisted) {
          em.fields.pop();
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
      m?.delete().catch(() => {});
      if (mexisted) {
        em.fields.pop();
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
      em.fields.pop();
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
