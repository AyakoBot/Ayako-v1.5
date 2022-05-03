const Discord = require('discord.js');
const ms = require('ms');
const Builders = require('@discordjs/builders');

module.exports = {
  name: 'reminder',
  aliases: ['remind', 'remindme'],
  perm: null,
  dm: true,
  takesFirstArg: false,
  type: 'info',
  execute: async (msg) => {
    if (!msg.args[0] || msg.args[0].toLowerCase() === msg.lan.list) {
      listReminders(msg);
      return;
    }

    createReminder(msg);
  },
};

const createReminder = async (msg) => {
  const now = Date.now();
  const startArg = msg.args[0] === msg.lan.set ? 1 : 0;

  const { reasonArg, endTime } = getEndTime(msg, startArg, now);
  if (!reasonArg || !endTime) return;

  const reason = msg.args.slice(reasonArg);
  if (!reason) {
    msg.client.ch.error(msg, msg.lan.noReason);
    return;
  }

  await msg.client.ch.query(
    `INSERT INTO reminders (userid, channelid, reason, uniquetimestamp, endtime) VALUES ($1, $2, $3, $4, $5);`,
    [msg.author.id, msg.channel.id, reason, now, endTime],
  );

  const embed = new Builders.UnsafeEmbedBuilder()
    .setColor(msg.client.constants.colors.success)
    .setDescription(
      msg.client.ch.stp(msg.lan.created, {
        ID: now.toString(32),
        time: `<t:${String(endTime).slice(0, -3)}:R>`,
      }),
    );

  msg.client.ch.reply(msg, { embeds: [embed] });
};

const getEndTime = (msg, startArg, now) => {
  let arg = msg.args[startArg];
  let endTime = arg ? ms(arg) : null;
  let reasonArg = startArg + 1;

  if (arg) arg = arg.replace(/,/g, '.');

  if (endTime === arg) {
    endTime = ms(`${arg} ${msg.args[startArg + 1]}`);
    reasonArg += 1;
  }

  if (Number.isNaN(endTime)) {
    msg.client.ch.error(msg, msg.lan.invalidTime);
    return {};
  }
  return { reasonArg, endTime: endTime + now };
};
