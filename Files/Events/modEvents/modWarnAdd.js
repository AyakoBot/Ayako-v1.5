const Discord = require('discord.js');
const jobs = require('node-schedule');

module.exports = {
  async execute(executor, target, reason, msg) {
    if (msg.m) msg.m = await msg.m.fetch();
    const mexisted = !!msg.m;
    const con = msg.client.constants.mod.warnAdd;
    const language = await msg.client.ch.languageSelector(msg.guild);
    const lan = language.mod.warnAdd;
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
    if (
      exec?.roles.highest.position < member?.roles.highest.position ||
      exec?.roles.highest.position === member?.roles.highest.position
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
    const warnEmbed = new Discord.MessageEmbed()
      .setTitle(msg.client.ch.stp(lan.DMtitle, { guild: msg.guild }))
      .setColor(con.color)
      .setDescription(`${language.reason}: \n${reason}`)
      .setTimestamp();
    msg.client.ch.send(target, { embeds: [warnEmbed] });
    const WarnLogEmbed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.client.ch.stp(lan.log.author, { target }),
        iconURL: msg.client.ch.displayAvatarURL(target),
        url: msg.url,
      })
      .setDescription(msg.client.ch.stp(lan.log.description, { target, user: executor }))
      .addField(language.reason, `${reason}`)
      .setColor(con.color)
      .setTimestamp();
    if (msg.logchannels && msg.logchannels.length)
      msg.client.ch.send(msg.logchannels, { embeds: [WarnLogEmbed] });
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
      em.addField(
        '\u200b',
        `${msg.client.constants.emotes.tick} ${msg.client.ch.stp(lan.success, {
          target,
          nr: warnnr,
        })}`,
      );
    } else
      em.setDescription(
        `${msg.client.constants.emotes.tick} ${msg.client.ch.stp(lan.success, {
          target,
          nr: warnnr,
        })}`,
      );
    await msg.m?.edit({ embeds: [em] });
    if (msg.source) msg.client.emit('modSourceHandler', msg, em);
    return true;
  },
};
