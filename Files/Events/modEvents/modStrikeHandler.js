const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  async execute(executor, target, reason, msg) {
    const lan = msg.language.mod.strike;
    const con = msg.client.constants.mod.strike;
    if (!msg.res) {
      const em = new Builders.UnsafeEmbedBuilder()
        .setColor(con.color)
        .setDescription(
          msg.client.ch.stp(lan.notEnabled, { prefix: msg.client.constants.standard.prefix }),
        );
      return msg.client.ch.reply(msg, { embeds: [em] });
    }

    const existingWarns = await getWarns(msg, target);

    let r = msg.res.rows.find((re) => re.warnamount === existingWarns);
    if (r.punishment === 6) doPunishment('modWarnAdd', executor, target, reason, msg);
    else if (r.punishment === 5) doPunishment('modBanAdd', executor, target, reason, msg);
    else if (r && r.punishment === 4) doPunishment('modTempbanAdd', executor, target, reason, msg);
    else if (r && r.punishment === 3) doPunishment('modKickAdd', executor, target, reason, msg);
    else if (r && r.punishment === 2) doPunishment('modMuteAdd', executor, target, reason, msg);
    else if (r && r.punishment === 1) doPunishment('modTempmuteAdd', executor, target, reason, msg);
    else {
      const higher = isHigher(
        existingWarns,
        msg.res.rows.map((re) => +re.warnamount),
      );
      if (higher) {
        const neededPunishmentWarnNr = getClosest(
          existingWarns,
          msg.res.rows.map((re) => +re.warnamount),
        );
        r = msg.res.rows.find((re) => re.warnamount === neededPunishmentWarnNr);
        if (r.punishment === 6) doPunishment('modWarnAdd', executor, target, reason, msg);
        else if (r.punishment === 5) doPunishment('modBanAdd', executor, target, reason, msg);
        else if (r.punishment === 4) doPunishment('modTempbanAdd', executor, target, reason, msg);
        else if (r.punishment === 3) doPunishment('modKickAdd', executor, target, reason, msg);
        else if (r.punishment === 2) doPunishment('modMuteAdd', executor, target, reason, msg);
        else if (r.punishment === 1) doPunishment('modTempmuteAdd', executor, target, reason, msg);
        else doPunishment('modWarnAdd', executor, target, reason, msg);
      } else doPunishment('modWarnAdd', executor, target, reason, msg);
    }

    return true;
  },
};

const doRoles = async (r, msg) => {
  const member = msg.guild.members.cache.get(member.id);
  if (member) {
    if (r.addroles && r.addroles.length) {
      const roles = checkRoles(r.addroles, msg.guild);
      await member.roles.add(roles, msg.language.autotypes.autopunish);
    }
    if (r.removeroles && r.removeroles.length) {
      const roles = checkRoles(r.removeroles, msg.guild);
      await member.roles.remove(roles, msg.language.autotypes.autopunish);
    }
  }
};

const doPunishment = async (punishment, executor, target, reason, msg, r) => {
  const lan = msg.language.mod.strike;
  const con = msg.client.constants.mod.strike;
  await doRoles(r, msg);
  if (punishment === 'modWarnAdd') {
    msg.client.emit(punishment, executor, target, reason, msg, r.duration ? r.duration : 3600000);
  } else {
    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: lan.confirmEmbed.author,
      })
      .setDescription(
        msg.client.ch.stp(lan.confirmEmbed.description, {
          user: target,
          punishment: msg.language.autopunish[r.punishment],
        }),
      )
      .setColor(con.confirmEmbed.color);
    const yes = new Builders.UnsafeButtonBuilder()
      .setLabel(msg.language.Yes)
      .setStyle(Discord.ButtonStyle.Primary)
      .setCustomId('yes');
    const no = new Builders.UnsafeButtonBuilder()
      .setLabel(msg.language.No)
      .setStyle(Discord.ButtonStyle.Danger)
      .setCustomId('no');
    msg.m = await msg.client.ch.reply(msg, {
      embeds: [embed],
      components: msg.client.ch.buttonRower([yes, no]),
    });
    const agreed = await new Promise((resolve) => {
      const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
      buttonsCollector.on((button) => {
        if (button.user.id === msg.author.id) {
          if (button.customId === 'yes') {
            resolve(true);
          } else if (button.customId === 'no') {
            buttonsCollector.stop();
            resolve(false);
          }
        } else msg.client.ch.notYours(button);
      });
      buttonsCollector.on('end', (collected, endReason) => {
        if (endReason === 'time') resolve(false);
      });
    });
    if (agreed) {
      msg.client.emit(punishment, executor, target, reason, msg, r.duration ? r.duration : 3600000);
    } else msg.client.emit('modWarnAdd', executor, target, reason, msg);
  }
};

const getClosest = (num, arr) => {
  arr = arr.reverse();
  let curr = arr[0];
  let diff = Math.abs(num - curr);
  for (let val = 0; val < arr.length; val += 1) {
    const newdiff = Math.abs(num - arr[val]);
    if (newdiff < diff) {
      diff = newdiff;
      curr = arr[val];
    }
  }
  return curr;
};

const isHigher = (num, arr) => {
  for (let i = 0; i < arr.length; i += 1) {
    if (num <= arr[i]) return false;
  }
  return true;
};

const checkRoles = (roles, guild) => {
  roles.forEach((r, i) => {
    const role = guild.roles.cache.get(r);
    if (!role || !role.id) roles.splice(i, 1);
  });
  return roles;
};

const getWarns = async (msg, target) => {
  const [warnRes, kickRes, muteRes, banRes, channelbanRes] = await Promise.all(
    ['warns', 'kicks', 'mutes', 'mutes', 'bans', 'channelbans'].map((table) =>
      msg.client.ch.query(`SELECT * FROM punish_${table} WHERE guildid = $1 AND userid = $2;`, [
        msg.guild.id,
        target.id,
      ]),
    ),
  );

  let totalWarns = 0;
  if (warnRes && warnRes.rowCount) totalWarns += warnRes.rowCount;
  if (kickRes && kickRes.rowCount) totalWarns += kickRes.rowCount;
  if (muteRes && muteRes.rowCount) totalWarns += muteRes.rowCount;
  if (banRes && banRes.rowCount) totalWarns += banRes.rowCount;
  if (channelbanRes && channelbanRes.rowCount) totalWarns += channelbanRes.rowCount;

  return totalWarns;
};
