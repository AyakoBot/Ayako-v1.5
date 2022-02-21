const Discord = require('discord.js');
const jobs = require('node-schedule');

module.exports = {
  async execute(executor, target, reason, msg) {
    if (msg.m) msg.m = await msg.m.fetch();
    const mexisted = !!msg.m;
    const language = await msg.client.ch.languageSelector(msg.guild);
    const lan = language.mod.kickAdd;
    const con = msg.client.constants.mod.kickAdd;
    let em;
    if (mexisted) {
      em = new Discord.MessageEmbed(msg.m.embeds[0])
        .setColor(con.color)
        .addField('\u200b', `${msg.client.constants.emotes.loading} ${lan.loading}`);
    } else {
      em = new Discord.MessageEmbed()
        .setColor(con.color)
        .setDescription(`${msg.client.constants.emotes.loading} ${lan.loading}`);
    }
    if (mexisted) await msg.m.edit({ embeds: [em] });
    else msg.m = await msg.client.ch.reply(msg, { embeds: [em] });
    const member = await msg.guild.members.fetch(target.id).catch(() => {});
    const exec = await msg.guild.members.fetch(executor.id).catch(() => {});
    if (!member) {
      if (mexisted) {
        em.fields.pop();
        em.addField('\u200b', `${msg.client.constants.emotes.cross} ${lan.noMember}`);
      } else em.setDescription(`${msg.client.constants.emotes.cross} ${lan.noMember}`);
      msg.m?.edit({ embeds: [em] });
      if (mexisted) {
        jobs.scheduleJob(new Date(Date.now() + 10000), () => {
          msg.m?.delete().catch(() => {});
        });
      }
      return false;
    }
    if (
      exec.roles.highest.position < member.roles.highest.position ||
      exec.roles.highest.position === member.roles.highest.position
    ) {
      if (mexisted) {
        em.fields.pop();
        em.addField('\u200b', `${msg.client.constants.emotes.cross} ${lan.exeNoPerms}`);
      } else em.setDescription(`${msg.client.constants.emotes.cross} ${lan.exeNoPerms}`);
      msg.m?.edit({ embeds: [em] });
      if (mexisted) {
        jobs.scheduleJob(new Date(Date.now() + 10000), () => {
          msg.m?.delete().catch(() => {});
        });
      }
      return false;
    }
    if (!member.kickable) {
      if (mexisted) {
        em.fields.pop();
        em.addField('\u200b', `${msg.client.constants.emotes.cross} ${lan.permissionError}`);
      } else em.setDescription(`${msg.client.constants.emotes.cross} ${lan.permissionError}`);
      msg.m?.edit({ embeds: [em] });
      if (mexisted) {
        jobs.scheduleJob(new Date(Date.now() + 10000), () => {
          msg.m?.delete().catch(() => {});
        });
      }
      return false;
    }

    const dmChannel = await target.createDM().catch(() => {});
    const DMembed = new Discord.MessageEmbed()
      .setDescription(`**${language.reason}:** \n${reason}`)
      .setColor(con.color)
      .setTimestamp()
      .setAuthor({
        name: msg.client.ch.stp(lan.dm.author, { guild: msg.guild }),
        iconURL: lan.author.image,
        url: msg.client.ch.stp(con.author.link, { guild: msg.guild }),
      });
    const m = msg.client.ch.send(dmChannel, { embeds: [DMembed] });
    let err;
    const kick = await member.kick(reason).catch((e) => {
      err = e;
    });
    if (kick) {
      const embed = new Discord.MessageEmbed()
        .setColor(con.color)
        .setAuthor({
          name: msg.client.ch.stp(lan.author, { user: target }),
          iconURL: msg.client.ch.displayAvatarURL(target),
          url: msg.client.constants.standard.invite,
        })
        .setDescription(msg.client.ch.stp(lan.description, { user: executor, target }))
        .setTimestamp()
        .addField(language.reason, `${reason}`)
        .setFooter({ text: msg.client.ch.stp(lan.footer, { user: executor, target }) });
      if (msg.logchannels && msg.logchannels.length)
        msg.client.ch.send(msg.logchannels, { embeds: [embed] });
    } else if (!member) {
      if (mexisted) {
        em.fields.pop();
        em.addField('\u200b', `${msg.client.constants.emotes.cross} ${lan.noMember}`);
      } else em.setDescription(`${msg.client.constants.emotes.cross} ${lan.noMember}`);
      msg.m?.edit({ embeds: [em] });
      if (mexisted) {
        jobs.scheduleJob(new Date(Date.now() + 10000), () => {
          msg.m?.delete().catch(() => {});
        });
      }
      return false;
    } else {
      m?.delete().catch(() => {});
      if (mexisted) {
        em.fields.pop();
        em.addField(
          '\u200b',
          `${msg.client.constants.emotes.cross + lan.error} ${msg.client.ch.makeCodeBlock(err)}`,
        );
      } else
        em.setDescription(
          `${msg.client.constants.emotes.cross + lan.error} ${msg.client.ch.makeCodeBlock(err)}`,
        );
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
      em.addField(
        '\u200b',
        `${msg.client.constants.emotes.tick} ${msg.client.ch.stp(lan.success, {
          target,
        })}`,
      );
    } else
      em.setDescription(
        `${msg.client.constants.emotes.tick} ${msg.client.ch.stp(lan.success, { target })}`,
      );
    await msg.m?.edit({ embeds: [em] });
    if (msg.source) msg.client.emit('modSourceHandler', msg, em);
    return true;
  },
};
