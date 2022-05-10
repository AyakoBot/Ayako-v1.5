const Builders = require('@discordjs/builders');
const jobs = require('node-schedule');

module.exports = async () => {
  const client = require('../../BaseClient/DiscordClient');
  const allReminders = await getAllReminders(client);

  allReminders.forEach((reminder) => {
    if (reminder.endtime < Date.now()) endReminder(client, reminder);
    else setReminder(client, reminder);
  });
};

const setReminder = (client, reminder) => {
  client.reminders.set(
    `${reminder.channelid}-${reminder.msgid}-${reminder.uniquetimestamp}`,
    jobs.scheduleJob(new Date(Number(reminder.endtime)), () => {
      endReminder(client, reminder);
    }),
  );
};

const getAllReminders = async (client) => {
  const res = await client.ch.query(`SELECT * FROM reminders;`);
  if (res && res.rowCount) return res.rows;
  return [];
};

const endReminder = async (client, reminder) => {
  const user = await client.users.fetch(reminder.userid).catch(() => {});
  if (!user) return;

  let channel = await client.channels.cache
    .get(reminder.channelid)
    ?.messages.fetch(reminder.msgid)
    .catch(() => {});
  let method = 'reply';

  if (!channel && !client.channels.cache.get(reminder.channelid)) {
    channel = user;
    method = 'send';
  } else if (client.channels.cache.get(reminder.channelid)) {
    channel = await client.channels.cache.get(reminder.channelid);
    method = 'send';
  }

  const language = await client.ch.languageSelector();
  const lan = language.commands.reminder;

  const embed = new Builders.UnsafeEmbedBuilder()
    .setColor(client.constants.colors.success)
    .setDescription(
      client.ch.stp(lan.reminderEnded, {
        reason: reminder.reason,
      }),
    );

  client.ch[method](channel, {
    embeds: [embed],
    content: `${user}`,
  });

  client.ch.query(`DELETE FROM reminders WHERE uniquetimestamp = $1 AND userid = $2;`, [
    reminder.uniquetimestamp,
    reminder.userid,
  ]);

  client.reminders.delete(`${reminder.channelid}-${reminder.msgid}-${reminder.uniquetimestamp}`);
};
