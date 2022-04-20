const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  name: 'clearwarns',
  perm: 8192n,
  dm: false,
  takesFirstArg: true,
  aliases: ['clearpunishments'],
  type: 'mod',
  async execute(msg) {
    const lan = msg.language.commands.clearwarns;
    const con = msg.client.constants.commands.clearwarns;
    const user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});

    const embed = new Builders.UnsafeEmbedBuilder().setColor(con.loading);

    if (!user) {
      embed.setDescription(lan.noUser);
      embed.setColor(con.fail);
      return msg.client.ch.reply(msg, { embeds: [embed] });
    }
    const res = await getRes(msg, user);
    if (!res || res.rowCount === 0) {
      embed.setDescription(lan.noWarns);
      embed.setColor(con.fail);
      return msg.client.ch.reply(msg, { embeds: [embed] });
    }

    embed.setDescription(msg.client.ch.stp(lan.sure, { user }));
    const yes = new Builders.UnsafeButtonBuilder()
      .setCustomId('yes')
      .setLabel(msg.language.Yes)
      .setStyle(Discord.ButtonStyle.Primary);
    const no = new Builders.UnsafeButtonBuilder()
      .setCustomId('no')
      .setLabel(msg.language.No)
      .setStyle(Discord.ButtonStyle.Danger);
    msg.m = await msg.client.ch.reply(msg, {
      embeds: [embed],
      components: msg.client.ch.buttonRower([[yes, no]]),
    });

    const collector = msg.channel.createMessageComponentCollector({ time: 60000 });
    collector.on('collect', async (button) => {
      if (button.user.id === msg.author.id) {
        if (button.customId === 'yes') {
          await deleteAll(msg, user);

          embed.setDescription(msg.client.ch.stp(lan.cleared, { user }));
          embed.setColor(con.success);
          msg.m.edit({ embeds: [embed], components: [] }).catch(() => {});
          log(msg, res, user, lan, con);
          collector.stop();
        } else if (button.customId === 'no') {
          embed.setDescription(lan.fail);
          embed.setColor(con.fail);
          msg.m.edit({ embeds: [embed], components: [] }).catch(() => {});
          collector.stop();
        }
      } else msg.client.ch.notYours(button);
    });
    collector.on('end', (col, reason) => {
      if (reason === 'time') return msg.client.ch.collectorEnd(msg);
      return null;
    });
    return null;
  },
};

function log(msg, res, user, lan, con) {
  const logEmbed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: msg.client.ch.stp(lan.log.author, { user }),
      iconURL: con.log.image,
      url: msg.client.constants.standard.invite,
    })
    .setColor(con.log.color)
    .setFooter({ text: msg.client.ch.stp(lan.log.footer, { author: msg.author }) });

  let description = null;
  res.rows.forEach((r) => {
    const msgLink = msg.client.ch.stp(lan.log.details, {
      link: msg.client.ch.stp(msg.client.constants.standard.discordUrlDB, {
        guildid: r.guildid,
        channelid: r.warnedinchannelid,
        msgid: r.msgid,
      }),
    });

    logEmbed.addFields({
      name: msg.client.ch.stp(lan.log.title, {
        type: r.type,
        user: r.executorname,
        channel: r.channelname,
      }),
      value: msg.client.ch.stp(lan.log.value, {
        time: `<t:${r.uniquetimestamp.slice(0, -3)}:F> (<t:${r.uniquetimestamp.slice(0, -3)}:R>)`,
        reason: r.reason,
      }),
    });
    if (description !== null) {
      description += ` | ${msgLink}`;
    } else {
      description = `${msgLink}`;
    }
  });
  logEmbed.setDescription(description);
  if (msg.logchannels) msg.client.ch.send(msg.logchannels, { embeds: [logEmbed] });
}

const getRes = async (msg, target) => {
  const [warnRes, kickRes, muteRes, banRes, channelbanRes] = await Promise.all(
    msg.client.ch.query('SELECT * FROM punish_warns WHERE guildid = $1 AND userid = $2;', [
      msg.guild.id,
      target.id,
    ]),
    msg.client.ch.query('SELECT * FROM punish_kicks WHERE guildid = $1 AND userid = $2;', [
      msg.guild.id,
      target.id,
    ]),
    msg.client.ch.query('SELECT * FROM punish_mutes WHERE guildid = $1 AND userid = $2;', [
      msg.guild.id,
      target.id,
    ]),
    msg.client.ch.query('SELECT * FROM punish_mutes WHERE guildid = $1 AND userid = $2;', [
      msg.guild.id,
      target.id,
    ]),
    msg.client.ch.query('SELECT * FROM punish_bans WHERE guildid = $1 AND userid = $2;', [
      msg.guild.id,
      target.id,
    ]),
    msg.client.ch.query('SELECT * FROM punish_channelbans WHERE guildid = $1 AND userid = $2;', [
      msg.guild.id,
      target.id,
    ]),
  );

  const allWarns = [];
  if (warnRes && warnRes.rowCount) allWarns.concat(warnRes.rows);
  if (kickRes && kickRes.rowCount) allWarns.concat(kickRes.rows);
  if (muteRes && muteRes.rowCount) allWarns.concat(muteRes.rows);
  if (banRes && banRes.rowCount) allWarns.concat(banRes.rows);
  if (channelbanRes && channelbanRes.rowCount) allWarns.concat(channelbanRes.rows);

  return allWarns;
};

const deleteAll = async (msg, target) => {
  await Promise.all([
    msg.client.ch.query(`DELETE FROM punish_warns WHERE guildid = $1 AND userid = $2;`, [
      msg.guild.id,
      target.id,
    ]),
    msg.client.ch.query(`DELETE FROM punish_kicks WHERE guildid = $1 AND userid = $2;`, [
      msg.guild.id,
      target.id,
    ]),
    msg.client.ch.query(`DELETE FROM punish_mutes WHERE guildid = $1 AND userid = $2;`, [
      msg.guild.id,
      target.id,
    ]),
    msg.client.ch.query(`DELETE FROM punish_bans WHERE guildid = $1 AND userid = $2;`, [
      msg.guild.id,
      target.id,
    ]),
    msg.client.ch.query(`DELETE FROM punish_channelbans WHERE guildid = $1 AND userid = $2;`, [
      msg.guild.id,
      target.id,
    ]),
  ]);
};
