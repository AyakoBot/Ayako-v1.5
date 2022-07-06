import jobs from 'node-schedule';
import type * as Eris from 'eris';
import client from '../../../BaseClient/ErisClient';
import type DBT from '../../../typings/DataBaseTypings';

export default async () => {
  const remindersRows = await client.ch
    .query(`SELECT * FROM reminders;`)
    .then((r: DBT.reminders[] | null) => r || null);
  if (!remindersRows) return;

  remindersRows.forEach((reminder) => {
    if (Number(reminder.endtime) < Date.now()) endReminder(reminder);
    else setReminder(reminder);
  });
};

const setReminder = (reminder: DBT.reminders) => {
  client.reminders.set(
    `${reminder.channelid}-${reminder.msgid}-${reminder.uniquetimestamp}`,
    jobs.scheduleJob(new Date(Number(reminder.endtime)), () => {
      endReminder(reminder);
    }),
  );
};

const endReminder = async (reminder: DBT.reminders) => {
  const user = await client.ch.getUser(reminder.userid).catch(() => null);
  if (!user) return;

  const channel =
    (client.guilds
      .find((g) => g.channels.has(reminder.channelid))
      ?.channels.get(reminder.channelid) as Eris.TextChannel) || (await user.getDMChannel());

  const language = await client.ch.languageSelector(null);
  const lan = language.commands.reminder;

  const embed: Eris.Embed = {
    type: 'rich',
    color: client.constants.colors.success,
    description: client.ch.stp(lan.reminderEnded, {
      reason: reminder.reason,
    }),
  };

  client.ch.send(
    channel,
    {
      embeds: [embed],
      content: `${user}`,
      allowedMentions: {
        users: [user.id],
      },
    },
    language,
  );

  client.ch.query(`DELETE FROM reminders WHERE uniquetimestamp = $1 AND userid = $2;`, [
    reminder.uniquetimestamp,
    reminder.userid,
  ]);

  client.reminders.delete(`${reminder.channelid}-${reminder.msgid}-${reminder.uniquetimestamp}`);
};
