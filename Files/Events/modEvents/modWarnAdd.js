const jobs = require('node-schedule');
const Builders = require('@discordjs/builders');

module.exports = {
  async execute(executor, target, reason, msg) {
    if (msg.m) msg.m = await msg.m.fetch();
    const mexisted = !!msg.m;
    const con = msg.client.constants.mod.warnAdd;
    const language = await msg.client.ch.languageSelector(msg.guild);
    const lan = language.mod.warnAdd;
    let em;
    if (mexisted) {
      em = new Builders.UnsafeEmbedBuilder(msg.m.embeds[0]).setColor(con.color).addFields({
        name: '\u200b',
        value: `${msg.client.textEmotes.loading} ${lan.loading}`,
      });
    } else {
      em = new Builders.UnsafeEmbedBuilder()
        .setColor(con.color)
        .setDescription(`${msg.client.textEmotes.loading} ${lan.loading}`);
    }
    if (mexisted) await msg.m.edit({ embeds: [em] });
    else msg.m = await msg.client.ch.reply(msg, { embeds: [em] });
    const member = await msg.guild.members.fetch(target.id).catch(() => {});
    const exec = await msg.guild.members.fetch(executor.id).catch(() => {});
    if (
      exec?.roles.highest.position < member?.roles.highest.position ||
      exec?.roles.highest.position === member?.roles.highest.position
    ) {
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
    const warnEmbed = new Builders.UnsafeEmbedBuilder()
      .setTitle(msg.client.ch.stp(lan.DMtitle, { guild: msg.guild }))
      .setColor(con.color)
      .setDescription(`${language.reason}: \n${reason}`)
      .setTimestamp();
    msg.client.ch.send(target, { embeds: [warnEmbed] });
    const WarnLogEmbed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: msg.client.ch.stp(lan.log.author, { target }),
        iconURL: target.displayAvatarURL({ size: 4096 }),
        url: msg.url,
      })
      .setDescription(msg.client.ch.stp(lan.log.description, { target, user: executor }))
      .addFields({ name: language.reason, value: `${reason}` })
      .setColor(con.color)
      .setTimestamp();
    if (msg.logchannels && msg.logchannels.length) {
      msg.client.ch.send(msg.logchannels, { embeds: [WarnLogEmbed] });
    }
    let warnnr;
    const res = await msg.client.ch.query(
      'SELECT * FROM warns WHERE guildid = $1 AND userid = $2;',
      [msg.guild.id, target.id],
    );
    if (res && res.rowCount > 0) warnnr = res.rowCount + 1;
    else warnnr = 1;
    msg.client.ch.query(
      'INSERT INTO warns (guildid, userid, reason, type, dateofwarn, warnedinchannelid, warnedbyuserid, warnedinchannelname, warnedbyusername, msgid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);',
      [
        msg.guild.id,
        target.id,
        reason,
        'Warn',
        Date.now(),
        msg.channel.id,
        executor.id,
        msg.channel.name,
        executor.username,
        msg.id,
      ],
    );
    if (mexisted) {
      em.fields.pop();
      em.addFields({
        name: '\u200b',
        value: `${msg.client.textEmotes.tick} ${msg.client.ch.stp(lan.success, {
          target,
          nr: warnnr,
        })}`,
      });
    } else {
      em.setDescription(
        `${msg.client.textEmotes.tick} ${msg.client.ch.stp(lan.success, {
          target,
          nr: warnnr,
        })}`,
      );
    }
    await msg.m?.edit({ embeds: [em] });
    if (msg.source) msg.client.emit('modSourceHandler', msg, em);
    return true;
  },
};
