const Discord = require('discord.js');
const ms = require('ms');
const Builders = require('@discordjs/builders');
const jobs = require('node-schedule');

module.exports = {
  name: 'reminder',
  aliases: ['remind', 'remindme', 'reminders'],
  perm: null,
  dm: true,
  takesFirstArg: false,
  type: 'util',
  execute: async (msg, m) => {
    if (!msg.args[0] || msg.args[0].toLowerCase() === msg.lan.list) {
      listReminders(msg, m);
      return;
    }

    createReminder(msg);
  },
};

const listReminders = async (msg, m) => {
  const allReminders = await getAllReminders(msg);
  const embed = new Builders.UnsafeEmbedBuilder()
    .setDescription(msg.lan.desc)
    .setColor(msg.client.constants.colors.success)
    .setAuthor({ name: msg.lan.author, url: msg.client.constants.standard.invite });

  const components = getComponents(msg, [...allReminders], true, 1);

  allReminders.forEach((reminder) => {
    embed.addFields({
      name: `${msg.client.channels.cache.get(reminder.channelid).name} | ${
        msg.language.id
      }: \`${Number(reminder.uniquetimestamp).toString(32)}\``,
      value: `\`\`\`${reminder.reason}\`\`\`${msg.lan.ends} <t:${reminder.endtime.slice(0, -3)}:R>`,
      inline: false,
    });
  });

  if (m) {
    await msg.client.ch.edit(m, {
      embeds: [embed],
      components: msg.client.ch.buttonRower(components),
    });
  } else {
    m = await msg.client.ch.reply(msg, {
      embeds: [embed],
      components: msg.client.ch.buttonRower(components),
    });
  }

  interactionHandler(msg, m, allReminders);
};

const getComponents = (msg, allReminders, isStart, page, selectedValue) => {
  let options = [];
  if (allReminders && allReminders.length) {
    const useReminders = [...allReminders].splice(page - 1 * 25, 25);

    options = useReminders.map((reminder) =>
      new Builders.UnsafeSelectMenuOptionBuilder()
        .setDescription(reminder.reason.slice(0, 100))
        .setLabel(Number(reminder.uniquetimestamp).toString(32))
        .setValue(reminder.uniquetimestamp)
        .setDefault(selectedValue === reminder.uniquetimestamp),
    );
  } else {
    options = [
      new Builders.UnsafeSelectMenuOptionBuilder().setLabel('placeholder').setValue('placeholder'),
    ];
  }

  return [
    [
      new Builders.UnsafeSelectMenuBuilder()
        .setCustomId('reminderSelect')
        .setPlaceholder(msg.lan.placeholder)
        .setDisabled(!allReminders.length)
        .addOptions(...options)
        .setMaxValues(1)
        .setMinValues(1),
    ],
    [
      new Builders.UnsafeButtonBuilder()
        .setCustomId('prev')
        .setDisabled(Math.ceil(options.length / 25) <= page)
        .setEmoji(msg.client.objectEmotes.back)
        .setStyle(Discord.ButtonStyle.Primary),

      new Builders.UnsafeButtonBuilder()
        .setCustomId('next')
        .setDisabled(page === 1)
        .setEmoji(msg.client.objectEmotes.forth)
        .setStyle(Discord.ButtonStyle.Primary),
    ],
    [
      new Builders.UnsafeButtonBuilder()
        .setCustomId('edit')
        .setDisabled(isStart)
        .setLabel(msg.lan.editReason)
        .setStyle(Discord.ButtonStyle.Secondary),
    ],
    [
      new Builders.UnsafeButtonBuilder()
        .setCustomId('delete')
        .setDisabled(isStart)
        .setLabel(msg.lan.del)
        .setStyle(Discord.ButtonStyle.Danger),
    ],
  ];
};

const interactionHandler = (msg, m, allReminders) => {
  const buttonsCollector = m.createMessageComponentCollector({ time: 60000 });
  let page = 1;

  const getModal = (i, vals) =>
    new Builders.UnsafeModalBuilder()
      .setCustomId(`reminderEdit_${i.createdTimestamp}`)
      .setTitle(msg.lan.editTitle)
      .setComponents(
        new Builders.ActionRowBuilder().setComponents(
          new Builders.UnsafeTextInputBuilder()
            .setCustomId('editLabel')
            .setLabel(msg.lan.editLabel)
            .setPlaceholder(msg.lan.editPlaceholder)
            .setStyle(Discord.TextInputStyle.Paragraph)
            .setRequired(true)
            .setValue(vals.reason)
            .setMinLength(1)
            .setMaxLength(4000),
        ),
        new Builders.ActionRowBuilder().setComponents(
          new Builders.UnsafeTextInputBuilder()
            .setCustomId('editTime')
            .setLabel(msg.lan.timeLabel)
            .setPlaceholder(msg.lan.timePlaceholder)
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true)
            .setValue(ms(Math.abs(Number(vals.endtime) - Date.now())))
            .setMinLength(2)
            .setMaxLength(100),
        ),
      );

  buttonsCollector.on('end', (c, reason) => {
    if (reason === 'time') {
      msg.client.ch.disableComponents(m);
    }
  });

  buttonsCollector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) {
      msg.client.ch.notYours(interaction);
      return;
    }

    switch (interaction.customId) {
      case 'delete': {
        buttonsCollector.stop();

        const selected = allReminders.find(
          (r) =>
            r.uniquetimestamp ===
            interaction.message.components[0].components[0].data.options.find((o) => o.default)
              .value,
        );

        msg.client.reminders
          .get(`${selected.channelid}-${selected.msgid}-${selected.uniquetimestamp}`)
          ?.cancel();

        msg.client.reminders.delete(
          `${selected.channelid}-${selected.msgid}-${selected.uniquetimestamp}`,
        );

        await msg.client.ch.query(
          `DELETE FROM reminders WHERE uniquetimestamp = $1 AND userid = $2;`,
          [selected.uniquetimestamp, selected.userid],
        );

        await interaction.deferUpdate().catch(() => {});

        module.exports.execute(msg, m);

        break;
      }
      case 'edit': {
        buttonsCollector.stop();

        const selected = allReminders.find(
          (r) =>
            r.uniquetimestamp ===
            interaction.message.components[0].components[0].data.options.find((o) => o.default)
              .value,
        );

        const modal = getModal(interaction, selected);
        await interaction.showModal(modal);

        const submit = await interaction
          .awaitModalSubmit({
            filter: (modalSubmit) =>
              modalSubmit.customId === `reminderEdit_${interaction.createdTimestamp}`,
            time: 300000,
          })
          .catch(() => {});

        if (!submit) return;

        await submit.deferUpdate().catch(() => {});

        let newTime = submit.fields.getField('editTime').value;
        const newReason = submit.fields.getField('editLabel').value;
        if (!newReason) return;

        if (!ms(newTime)) {
          newTime = ms(Math.abs(Number(selected.endtime) - Date.now()));
        }

        await msg.client.ch.query(
          `UPDATE reminders SET reason = $1, endtime = $4 WHERE uniquetimestamp = $2 AND userid = $3;`,
          [
            newReason,
            selected.uniquetimestamp,
            interaction.user.id,
            Number(ms(newTime)) + Date.now(),
          ],
        );

        msg.client.reminders
          .get(`${selected.channelid}-${selected.msgid}-${selected.uniquetimestamp}`)
          ?.cancel();

        msg.client.reminders.delete(
          `${selected.channelid}-${selected.msgid}-${selected.uniquetimestamp}`,
        );

        setReminder(msg.client, {
          userid: msg.author.id,
          channelid: selected.channelid,
          reason: newReason,
          uniquetimestamp: selected.uniquetimestamp,
          endtime: ms(newTime) + Date.now(),
          msgid: selected.msgid,
        });

        module.exports.execute(msg, m);
        break;
      }
      case 'next': {
        page += 1;
        const components = getComponents(msg, [...allReminders], null, page);
        msg.client.ch.edit(interaction, { components: msg.client.ch.buttonRower(components) });
        break;
      }
      case 'prev': {
        page -= 1;
        const components = getComponents(msg, [...allReminders], null, page);
        msg.client.ch.edit(interaction, { components: msg.client.ch.buttonRower(components) });
        break;
      }
      default: {
        const components = getComponents(msg, [...allReminders], null, page, interaction.values[0]);

        components[2].forEach((c) => c.setDisabled(false));
        components[3].forEach((c) => c.setDisabled(false));
        msg.client.ch.edit(interaction, { components: msg.client.ch.buttonRower(components) });
        break;
      }
    }
  });
};

const getAllReminders = async (msg) => {
  const res = await msg.client.ch.query(`SELECT * FROM reminders WHERE userid = $1;`, [
    msg.author.id,
  ]);
  if (res && res.rowCount) return res.rows;
  return [];
};

const createReminder = async (msg) => {
  const now = Date.now();
  const startArg = msg.args[0] === msg.lan.set ? 1 : 0;

  const { reasonArg, endTime } = getEndTime(msg, startArg, now);
  if ((!reasonArg && typeof reasonArg !== 'number') || !endTime) return;

  const reason = msg.args.slice(reasonArg).join(' ');
  if (!reason) {
    msg.client.ch.error(msg, msg.lan.noReason);
    return;
  }

  await msg.client.ch.query(
    `INSERT INTO reminders (userid, channelid, reason, uniquetimestamp, endtime, msgid) VALUES ($1, $2, $3, $4, $5, $6);`,
    [msg.author.id, msg.channel.id, reason, now, endTime, msg.id],
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

  setReminder(msg.client, {
    userid: msg.author.id,
    channelid: msg.channel.id,
    reason,
    uniquetimestamp: now,
    endtime: endTime,
    msgid: msg.id,
  });
};

const getEndTime = (msg, startArg, now) => {
  let reasonArg = Number(String(startArg));

  const args = msg.args
    .slice(startArg)
    .map((a) => (ms(a.replace(/\./g, ',')) ? ms(a.replace(/\./g, ',')) : a));

  let skip;
  let end;
  const timeArgs = args
    .map((a, i) => {
      if (end) return null;
      if (i === skip) return null;
      if (ms(`${a} ${args[i + 1]}`)) {
        skip = i + 1;
        return ms(`${a} ${args[i + 1]}`);
      }

      if (!ms(`${a}`)) {
        end = true;
        return null;
      }
      return ms(`${a}`);
    })
    .filter((a) => !!a);

  reasonArg += timeArgs.length;

  const endTime = timeArgs.reduce((a, b) => a + b, now);

  return { reasonArg, endTime };
};

const setReminder = (client, reminder) => {
  client.reminders.set(
    `${reminder.channelid}-${reminder.msgid}-${reminder.uniquetimestamp}`,
    jobs.scheduleJob(new Date(reminder.endtime), () => {
      endReminder(client, reminder);
    }),
  );
};

const endReminder = async (client, reminder) => {
  const user = await client.users.fetch(reminder.userid).catch(() => {});
  if (!user) return;

  let channel = await client.channels.cache
    .get(reminder.channelid)
    .messages.fetch(reminder.msgid)
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
