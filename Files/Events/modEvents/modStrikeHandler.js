const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  async execute(executor, target, reason, msg, rows) {
    const lan = msg.language.mod.strike;
    const con = msg.client.constants.mod.strike;
    if (!rows || !rows.length) {
      const em = new Builders.UnsafeEmbedBuilder()
        .setColor(con.color)
        .setDescription(
          msg.client.ch.stp(lan.notEnabled, { prefix: msg.client.constants.standard.prefix }),
        );
      return msg.client.ch.reply(msg, { embeds: [em] });
    }

    const existingWarns = await getWarns(msg, target);

    const startPunish = (type) => {
      doPunishment(type, executor, target, reason, msg, r);
    };

    let r = rows.find((re) => Number(re.warnamount) === existingWarns);
    if (r && Number(r.punishment) === 7) startPunish('channelbanAdd');
    else if (r && Number(r.punishment) === 6) startPunish('tempchannelbanAdd');
    else if (r && Number(r.punishment) === 5) startPunish('warnAdd');
    else if (r && Number(r.punishment) === 4) startPunish('banAdd');
    else if (r && Number(r.punishment) === 3) startPunish('tempbanAdd');
    else if (r && Number(r.punishment) === 2) startPunish('kickAdd');
    else if (r && Number(r.punishment) === 1) startPunish('tempmuteAdd');
    else {
      const higher = isHigher(
        existingWarns,
        rows.map((re) => Number(re.warnamount)),
      );

      if (higher) {
        const neededPunishmentWarnNr = getClosest(
          existingWarns,
          rows.map((re) => Number(re.warnamount)),
        );
        r = rows.find((re) => Number(re.warnamount) === neededPunishmentWarnNr);
        if (r && Number(r.punishment) === 7) startPunish('channelbanAdd');
        else if (r && Number(r.punishment) === 6) startPunish('tempchannelbanAdd');
        else if (r && Number(r.punishment) === 5) startPunish('warnAdd');
        else if (r && Number(r.punishment) === 4) startPunish('banAdd');
        else if (r && Number(r.punishment) === 3) startPunish('tempbanAdd');
        else if (r && Number(r.punishment) === 2) startPunish('kickAdd');
        else if (r && Number(r.punishment) === 1) startPunish('tempmuteAdd');
        else startPunish('warnAdd');
      } else startPunish('warnAdd');
    }

    return true;
  },
};

const doRoles = async (r, msg, user) => {
  if (!r) return;

  const member = await msg.guild.members.fetch(user.id);
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
  await doRoles(r, msg, target);
  if (punishment === 'warnAdd') {
    msg.client.emit('modBaseEvent', { executor, target, reason, msg, guild: msg.guild }, 'warnAdd');
  } else {
    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: lan.confirmEmbed.author,
      })
      .setDescription(
        msg.client.ch.stp(lan.confirmEmbed.description, {
          user: target,
          punishment: msg.language.autopunish[Number(r.punishment)],
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
      components: msg.client.ch.buttonRower([[yes, no]]),
    });
    const agreed = await new Promise((resolve) => {
      const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
      buttonsCollector.on('collect', (button) => {
        if (button.user.id === msg.author.id) {
          if (button.customId === 'yes') {
            buttonsCollector.stop();
            button.update({ components: [] }).catch(() => {});
            resolve(true);
          } else if (button.customId === 'no') {
            buttonsCollector.stop();
            button.update({ components: [] }).catch(() => {});
            resolve(false);
          }
        } else msg.client.ch.notYours(button);
      });
      buttonsCollector.on('end', (collected, endReason) => {
        if (endReason === 'time') resolve(false);
      });
    });
    if (agreed) {
      msg.client.emit(
        'modBaseEvent',
        {
          executor,
          target,
          reason,
          msg,
          duration: r.duration ? r.duration : 60,
          guild: msg.guild,
        },
        punishment,
      );
    } else {
      msg.client.emit(
        'modBaseEvent',
        {
          target,
          executor,
          reason,
          msg,
          guild: msg.guild,
        },
        'warnAdd',
      );
    }
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
    ['warns', 'kicks', 'mutes', 'bans', 'channelbans'].map((table) =>
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
