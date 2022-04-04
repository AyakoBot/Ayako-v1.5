const jobs = require('node-schedule');
const Builders = require('@discordjs/builders');

module.exports = {
  async execute(executor, target, reason, msg) {
    if (msg.m) msg.m = await msg.m.fetch();
    const mexisted = !!msg.m;
    const language = await msg.client.ch.languageSelector(msg.guild);
    const lan = language.mod.banRemove;
    const con = msg.client.constants.mod.banRemove;
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
    const ban = await msg.guild.bans.fetch(target).catch(() => {});
    if (ban) {
      let err;
      const unban = await msg.guild.bans.remove(target, reason).catch((e) => {
        err = e;
      });
      if (unban) {
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
