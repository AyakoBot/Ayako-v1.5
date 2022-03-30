const Discord = require('discord.js');
const jobs = require('node-schedule');
const Builders = require('@discordjs/builders');

module.exports = {
  async execute(executor, target, reason, msg, duration) {
    if (msg.m) msg.m = await msg.m.fetch();

    const mexisted = !!msg.m;
    const language = await msg.client.ch.languageSelector(msg.guild);
    const lan = language.mod.tempmuteAdd;
    const con = msg.client.constants.mod.tempmuteAdd;
    const now = Date.now();
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
    const memberClient = msg.guild.me;
    if (!member) {
      if (mexisted) {
        em.fields.pop();
        em.addFields({
          name: '\u200b',
          value: `${msg.client.textEmotes.cross} ${lan.noMember}`,
        });
        msg.m?.edit({ embeds: [em] });
      } else {
        em.setDescription(`${msg.client.textEmotes.cross} ${lan.noMemberHint}`);
        const Yes = new Builders.UnsafeButtonBuilder()
          .setCustomId('yes')
          .setLabel(language.Yes)
          .setStyle(Discord.ButtonStyle.Primary);
        const No = new Builders.UnsafeButtonBuilder()
          .setCustomId('no')
          .setLabel(language.No)
          .setStyle(Discord.ButtonStyle.Danger);
        msg.m?.edit({ embeds: [em], components: msg.client.ch.buttonRower([[Yes, No]]) });
      }
      if (mexisted) {
        jobs.scheduleJob(new Date(Date.now() + 10000), () => {
          msg.m?.delete().catch(() => {});
        });
      } else {
        const [aborted, answer] = await ask(executor, msg);
        if (aborted) {
          em.setDescription(`${msg.client.textEmotes.cross} ${lan.noMember}`);
          if (answer) answer.update({ embeds: [em], components: [] });
          else msg.m?.edit({ embeds: [em], components: [] });
          return false;
        }
        return assingWarn(
          executor,
          target,
          reason,
          msg,
          answer,
          em,
          language,
          con,
          lan,
          duration,
          now,
        );
      }
    }
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
    if (
      memberClient.roles.highest.position < member?.roles.highest.position ||
      memberClient.roles.highest.position === member?.roles.highest.position ||
      !memberClient.permissions.has(268435456n)
    ) {
      if (mexisted) {
        em.fields.pop();
        em.addFields({
          name: '\u200b',
          value: `${msg.client.textEmotes.cross} ${lan.meNoPerms}`,
        });
      } else em.setDescription(`${msg.client.textEmotes.cross} ${lan.meNoPerms}`);
      msg.m?.edit({ embeds: [em] });
      if (mexisted) {
        jobs.scheduleJob(new Date(Date.now() + 10000), () => {
          msg.m?.delete().catch(() => {});
        });
      }
      return false;
    }
    let warnnr;
    const res = await msg.client.ch.query(
      'SELECT * FROM warns WHERE guildid = $1 AND userid = $2;',
      [msg.guild.id, target.id],
    );
    if (res && res.rowCount > 0) warnnr = res.rowCount + 1;
    else warnnr = 1;

    if (member?.communicationDisabledUntil) {
      if (mexisted) {
        em.fields.pop();
        em.addFields({
          name: '\u200b',
          value: `${msg.client.textEmotes.cross} ${lan.hasRole}`,
        });
      } else em.setDescription(`${msg.client.textEmotes.cross} ${lan.hasRole}`);
      msg.m?.edit({ embeds: [em] });
      if (mexisted) {
        jobs.scheduleJob(new Date(Date.now() + 10000), () => {
          msg.m?.delete().catch(() => {});
        });
      }
      return false;
    }

    let err;
    const Mute = await msg.guild.members.cache
      .get(target.id)
      .timeout(duration, reason)
      .catch(() => {});
    if (Mute) {
      if (!msg.source) {
        await msg.client.ch.query(
          `INSERT INTO warns 
          (guildid, userid, reason, type, duration, closed, dateofwarn, warnedinchannelid, warnedbyuserid, warnedinchannelname, warnedbyusername) VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
          [
            msg.guild.id,
            target.id,
            reason,
            'Mute',
            now + +duration,
            false,
            now,
            msg.channel.id,
            executor.id,
            msg.channel.name,
            msg.author.username,
          ],
        );
      }
      const dmChannel = await target.createDM().catch(() => {});
      const DMembed = new Builders.UnsafeEmbedBuilder()
        .setDescription(`**${language.reason}:** \n${reason}`)
        .setColor(con.color)
        .setTimestamp()
        .setAuthor({
          name: msg.client.ch.stp(lan.dm.author, { guild: msg.guild }),
          iconURL: con.author.image,
          url: msg.client.ch.stp(con.author.link, { guild: msg.guild }),
        });
      msg.client.ch.send(dmChannel, { embeds: [DMembed] });
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
    return false;
  },
};

async function ask(executor, msg) {
  if (!msg.m) return [true];

  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  const resolved = new Promise((resolve) => {
    buttonsCollector.on('collect', async (button) => {
      if (button.user.id !== executor.id) return msg.client.ch.notYours(button);
      if (button.customId === 'yes') {
        buttonsCollector.stop();
        resolve([false, button]);
      } else if (button.customId === 'no') {
        buttonsCollector.stop();
        resolve([true, button]);
      }
      return null;
    });
    buttonsCollector.on('end', (col, reason) => {
      if (reason === 'time') {
        msg.client.ch.collectorEnd(msg);
        resolve([true]);
      }
    });
  });
  return resolved;
}

async function assingWarn(
  executor,
  target,
  reason,
  msg,
  answer,
  em,
  language,
  con,
  lan,
  duration,
  now,
) {
  const dmChannel = await target.createDM().catch(() => {});
  if (!msg.source || msg.source !== 'guildMemberAdd') {
    await msg.client.ch.query(
      `INSERT INTO warns 
       (guildid, userid, reason, type, duration, closed, dateofwarn, warnedinchannelid, warnedbyuserid, warnedinchannelname, warnedbyusername) VALUES 
       ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
      [
        msg.guild.id,
        target.id,
        reason,
        'Mute',
        now + +duration,
        false,
        now,
        msg.channel.id,
        executor.id,
        msg.channel.name,
        msg.author.username,
      ],
    );
  }
  const DMembed = new Builders.UnsafeEmbedBuilder()
    .setDescription(`**${language.reason}:** \n${reason}`)
    .setColor(con.color)
    .setTimestamp()
    .setAuthor({
      name: msg.client.ch.stp(lan.dm.author, { guild: msg.guild }),
      iconURL: lan.author.image,
      url: msg.client.ch.stp(con.author.link, { guild: msg.guild }),
    });
  msg.client.ch.send(dmChannel, { embeds: [DMembed] });
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
  if (msg.logchannels) msg.client.ch.send(msg.logchannels, { embeds: [embed] });
  await msg.client.ch.query(
    `INSERT INTO warns 
     (guildid, userid, reason, type, duration, closed, dateofwarn, warnedinchannelid, warnedbyuserid, warnedinchannelname, warnedbyusername) VALUES 
     ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
    [
      msg.guild.id,
      target.id,
      reason,
      'Mute',
      now + +duration,
      false,
      now,
      msg.channel.id,
      executor.id,
      msg.channel.name,
      msg.author.username,
    ],
  );
  em.setDescription(`${msg.client.textEmotes.tick} ${msg.client.ch.stp(lan.success, { target })}`);
  await answer.update({ embeds: [em], components: [] });
  return true;
}
