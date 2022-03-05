const Discord = require('discord.js');

module.exports = {
  name: 'setlevel',
  perm: 32n,
  dm: false,
  takesFirstArg: false,
  aliases: ['setlevels', 'setxp', 'setxpandlevel'],
  type: 'leveling',
  async execute(msg) {
    let user;
    let m;

    if (!msg.args[0]) {
      const returned = await getUser(msg);
      if (!returned) return;
      user = returned.reply;
      m = returned.m;
    } else {
      user = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});

      if (!user) {
        const returned = await getUser(msg);
        if (!returned) return;
        user = returned.reply;
        m = returned.m;
      }
    }

    if (!user) return;

    doUserSelection(msg, user, m);
  },
};

const getUser = async (msg) => {
  const embed = new Discord.UnsafeEmbed().setDescription(msg.lan.selectUser).setAuthor({
    name: msg.lan.author,
    url: msg.client.constants.standard.invite,
  });

  const m = await msg.client.ch.reply(msg, { embeds: [embed] });
  const messageCollector = msg.channel.createMessageCollector({ time: 60000 });

  const returned = await new Promise((resolve) => {
    messageCollector.on('collect', async (message) => {
      if (message.author.id !== msg.author.id) {
        return;
      }

      const user = await msg.client.users
        .fetch(message.content.replace(/\D+/g, ''))
        .catch(() => {});
      if (!user) {
        msg.client.ch.error(msg, msg.language.errors.userNotExist);
        return;
      }

      message.delete().catch(() => {});
      messageCollector.stop();
      resolve({ reply: user });
    });

    messageCollector.on('end', (collected, reason) => {
      if (reason === 'time') {
        msg.client.ch.collectorEnd(msg, m);
        resolve();
      }
    });
  });

  if (returned) return { reply: returned.reply, m };
  return null;
};

const doUserSelection = async (msg, user, m) => {
  let row = await getRows(msg, user);
  if (!row) {
    row = { xp: 0, level: 0 };
  }

  const selection = {
    curXP: Number(row.xp),
    curLvl: Number(row.level),
    newXP: Number(row.xp),
    newLvl: Number(row.level),
    xpZeros: 1,
    lvlZeros: 0,
    user,
  };

  if (m) {
    await m.edit({ embeds: [getEmbed(msg, selection)], components: getComponents(msg, selection) });
  } else {
    m = await msg.client.ch.reply(msg, {
      embeds: [getEmbed(msg, selection)],
      components: getComponents(msg, selection),
    });
  }

  interactionHandler(msg, m, selection);
};

const interactionHandler = async (msg, m, selection) => {
  const buttonsCollector = m.createMessageComponentCollector({ time: 60000 });

  buttonsCollector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) {
      msg.client.ch.notYours(interaction, msg);
      return;
    }

    switch (interaction.customId) {
      case 'cancel': {
        buttonsCollector.stop();
        interaction.update({ content: msg.language.aborted, embeds: [], components: [] });
        break;
      }
      case 'done': {
        buttonsCollector.stop();
        handleDone(interaction, msg, m, selection);
        break;
      }
      case 'decreaseLvl': {
        selection.newLvl -= Number(`1${'0'.repeat(selection.lvlZeros)}`);
        buttonsCollector.resetTimer();
        doMath(selection, 'lvl');
        interaction
          .update({
            embeds: [getEmbed(msg, selection)],
            components: getComponents(msg, selection),
          })
          .catch(() => {});
        break;
      }
      case 'increaseLvl': {
        selection.newLvl += Number(`1${'0'.repeat(selection.lvlZeros)}`);
        buttonsCollector.resetTimer();
        doMath(selection, 'lvl');
        interaction
          .update({
            embeds: [getEmbed(msg, selection)],
            components: getComponents(msg, selection),
          })
          .catch(() => {});
        break;
      }
      case 'decreaseXP': {
        selection.newXP -= Number(`1${'0'.repeat(selection.xpZeros)}`);
        buttonsCollector.resetTimer();
        doMath(selection, 'xp');
        interaction
          .update({
            embeds: [getEmbed(msg, selection)],
            components: getComponents(msg, selection),
          })
          .catch(() => {});
        break;
      }
      case 'increaseXP': {
        selection.newXP += Number(`1${'0'.repeat(selection.xpZeros)}`);
        buttonsCollector.resetTimer();
        doMath(selection, 'xp');
        interaction
          .update({
            embeds: [getEmbed(msg, selection)],
            components: getComponents(msg, selection),
          })
          .catch(() => {});
        break;
      }
      case 'resetXP': {
        selection.newXP = selection.curXP;
        buttonsCollector.resetTimer();
        doMath(selection, 'xp');
        interaction
          .update({
            embeds: [getEmbed(msg, selection)],
            components: getComponents(msg, selection),
          })
          .catch(() => {});
        break;
      }
      case 'resetLvl': {
        selection.newLvl = selection.curLvl;
        buttonsCollector.resetTimer();
        doMath(selection, 'lvl');
        interaction
          .update({
            embeds: [getEmbed(msg, selection)],
            components: getComponents(msg, selection),
          })
          .catch(() => {});
        break;
      }
      case 'addZeroXP': {
        selection.xpZeros += 1;
        buttonsCollector.resetTimer();
        interaction
          .update({
            embeds: [getEmbed(msg, selection)],
            components: getComponents(msg, selection),
          })
          .catch(() => {});
        break;
      }
      case 'delZeroXP': {
        selection.xpZeros -= 1;
        buttonsCollector.resetTimer();
        interaction
          .update({
            embeds: [getEmbed(msg, selection)],
            components: getComponents(msg, selection),
          })
          .catch(() => {});
        break;
      }
      case 'addZeroLvl': {
        selection.lvlZeros += 1;
        buttonsCollector.resetTimer();
        interaction
          .update({
            embeds: [getEmbed(msg, selection)],
            components: getComponents(msg, selection),
          })
          .catch(() => {});
        break;
      }
      case 'delZeroLvl': {
        selection.lvlZeros -= 1;
        buttonsCollector.resetTimer();
        interaction
          .update({
            embeds: [getEmbed(msg, selection)],
            components: getComponents(msg, selection),
          })
          .catch(() => {});
        break;
      }
      default: {
        break;
      }
    }
  });

  buttonsCollector.on('end', async (collected, reason) => {
    if (reason === 'time') {
      msg.client.ch.collectorEnd(msg, m);
    }
  });
};

const getRows = async (msg, user) => {
  const res = await msg.client.ch.query(
    "SELECT * FROM level WHERE type = 'guild' AND userid = $1 AND guildid = $2;",
    [user.id, msg.guild.id],
  );

  if (res && res.rowCount) return res.rows[0];
  return null;
};

const getEmbed = (msg, selection) =>
  new Discord.UnsafeEmbed().setDescription(msg.client.ch.stp(msg.lan.selectInfo, { selection }));

const getComponents = (msg, selection) => {
  const addZeroXP = new Discord.UnsafeButtonComponent()
    .setCustomId('addZeroXP')
    .setLabel(msg.lan.add)
    .setStyle(Discord.ButtonStyle.Primary);

  const delZeroXP = new Discord.UnsafeButtonComponent()
    .setCustomId('delZeroXP')
    .setLabel(msg.lan.remove)
    .setStyle(Discord.ButtonStyle.Primary)
    .setDisabled(selection.xpZeros === 0);

  const addZeroLvl = new Discord.UnsafeButtonComponent()
    .setCustomId('addZeroLvl')
    .setLabel(msg.lan.add)
    .setStyle(Discord.ButtonStyle.Primary);

  const delZeroLvl = new Discord.UnsafeButtonComponent()
    .setCustomId('delZeroLvl')
    .setLabel(msg.lan.remove)
    .setStyle(Discord.ButtonStyle.Primary)
    .setDisabled(selection.lvlZeros === 0);

  const resetXP = new Discord.UnsafeButtonComponent()
    .setCustomId('resetXP')
    .setLabel(msg.lan.resetXP)
    .setStyle(Discord.ButtonStyle.Secondary)
    .setDisabled(selection.curXP === selection.newXP);

  const resetLvl = new Discord.UnsafeButtonComponent()
    .setCustomId('resetLvl')
    .setLabel(msg.lan.resetLevel)
    .setStyle(Discord.ButtonStyle.Secondary)
    .setDisabled(selection.curLvl === selection.newLvl);

  const increaseXP = new Discord.UnsafeButtonComponent()
    .setCustomId('increaseXP')
    .setLabel(`+1${'0'.repeat(selection.xpZeros)}`)
    .setStyle(Discord.ButtonStyle.Primary);

  const decreaseXP = new Discord.UnsafeButtonComponent()
    .setCustomId('decreaseXP')
    .setLabel(`-1${'0'.repeat(selection.xpZeros)}`)
    .setStyle(Discord.ButtonStyle.Primary);

  const increaseLvl = new Discord.UnsafeButtonComponent()
    .setCustomId('increaseLvl')
    .setLabel(`+1${'0'.repeat(selection.lvlZeros)}`)
    .setStyle(Discord.ButtonStyle.Primary);

  const decreaseLvl = new Discord.UnsafeButtonComponent()
    .setCustomId('decreaseLvl')
    .setLabel(`-1${'0'.repeat(selection.lvlZeros)}`)
    .setStyle(Discord.ButtonStyle.Primary);

  const done = new Discord.UnsafeButtonComponent()
    .setCustomId('done')
    .setLabel(msg.language.done)
    .setStyle(Discord.ButtonStyle.Primary)
    .setDisabled(
      Number(selection.newXP) === Number(selection.curXP) &&
        Number(selection.newLvl) === Number(selection.curLvl),
    );

  const cancel = new Discord.UnsafeButtonComponent()
    .setCustomId('cancel')
    .setLabel(msg.language.Cancel)
    .setStyle(Discord.ButtonStyle.Danger);

  return msg.client.ch.buttonRower([
    [delZeroXP, decreaseXP, resetXP, increaseXP, addZeroXP],
    [delZeroLvl, decreaseLvl, resetLvl, increaseLvl, addZeroLvl],
    [cancel, done],
  ]);
};

const doMath = (selection, updated) => {
  switch (updated) {
    case 'xp': {
      if (selection.newLvl < 0) {
        selection.newLvl = 0;
        break;
      }

      if (selection.newXP < 0) {
        selection.newXP = 0;
        break;
      }

      selection.newLvl = getLevel(selection.newXP);
      break;
    }
    case 'lvl': {
      if (selection.newLvl < 0) {
        selection.newLvl = 0;
        break;
      }

      if (selection.newXP < 0) {
        selection.newXP = 0;
        break;
      }

      selection.newXP = Math.floor(
        (5 / 6) *
          selection.newLvl *
          (2 * selection.newLvl * selection.newLvl + 27 * selection.newLvl + 91),
      );
      break;
    }
    default: {
      break;
    }
  }
};

const handleDone = async (answer, msg, m, selection) => {
  if (selection.curXP) {
    await msg.client.ch.query(
      `UPDATE level SET xp = $3, level = $4 WHERE type = 'guild' AND userid = $2 AND guildid = $1;`,
      [msg.guild.id, selection.user.id, selection.newXP, selection.newLvl],
    );
  } else {
    await msg.client.ch.query(
      `INSERT INTO level (type, guildid, userid, xp, level) VALUES ('guild', $1, $2, $3, $4);`,
      [msg.guild.id, selection.user.id, selection.newXP, selection.newLvl],
    );
  }

  const embed = new Discord.UnsafeEmbed()
    .setDescription(msg.client.ch.stp(msg.lan.updated, { user: selection.user }))
    .setAuthor({
      name: msg.lan.author,
      url: msg.client.constants.standard.invite,
    })
    .setFields(
      {
        name: msg.lan.oldLvl,
        value: String(selection.curLvl),
        inline: true,
      },
      {
        name: msg.lan.oldXP,
        value: String(selection.curXP),
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: true,
      },

      {
        name: msg.lan.newLvl,
        value: String(selection.newLvl),
        inline: true,
      },
      {
        name: msg.lan.newXP,
        value: String(selection.newXP),
        inline: true,
      },
      {
        name: '\u200b',
        value: '\u200b',
        inline: true,
      },
    );

  answer.update({ embeds: [embed], components: [] }).catch(() => {});
};

const getLevel = (y) =>
  Math.round(
    (3 ** 0.5 * (3888 * y ** 2 + 233280 * y - 3366425) ** 0.5 + 108 * y + 3240) ** (1 / 3) /
      (2 * 3 ** (2 / 3) * 5 ** (1 / 3)) +
      (65 * (5 / 3) ** (1 / 3)) /
        (2 *
          (3 ** 0.5 * (3888 * y ** 2 + 233280 * y - 3366425) ** 0.5 + 108 * y + 3240) ** (1 / 3)) -
      9 / 2,
  );
