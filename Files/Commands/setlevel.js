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
  const embed = new Discord.MessageEmbed().setDescription(msg.lan.selectUser).setAuthor({
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
  new Discord.MessageEmbed().setDescription(msg.client.ch.stp(msg.lan.selectInfo, { selection }));

const getComponents = (msg, selection) => {
  const addZeroXP = new Discord.MessageButton()
    .setCustomId('addZeroXP')
    .setLabel(msg.lan.add)
    .setStyle('PRIMARY')
    .setDisabled(selection.xpZeros === 25);

  const delZeroXP = new Discord.MessageButton()
    .setCustomId('delZeroXP')
    .setLabel(msg.lan.remove)
    .setStyle('PRIMARY')
    .setDisabled(selection.xpZeros === 0);

  const addZeroLvl = new Discord.MessageButton()
    .setCustomId('addZeroLvl')
    .setLabel(msg.lan.add)
    .setStyle('PRIMARY')
    .setDisabled(selection.lvlZeros === 25);

  const delZeroLvl = new Discord.MessageButton()
    .setCustomId('delZeroLvl')
    .setLabel(msg.lan.remove)
    .setStyle('PRIMARY')
    .setDisabled(selection.lvlZeros === 0);

  const resetXP = new Discord.MessageButton()
    .setCustomId('resetXP')
    .setLabel(msg.lan.resetXP)
    .setStyle('SECONDARY')
    .setDisabled(selection.curXP === selection.newXP);

  const resetLvl = new Discord.MessageButton()
    .setCustomId('resetLvl')
    .setLabel(msg.lan.resetLevel)
    .setStyle('SECONDARY')
    .setDisabled(selection.curLvl === selection.newLvl);

  const increaseXP = new Discord.MessageButton()
    .setCustomId('increaseXP')
    .setLabel(`+1${'0'.repeat(selection.xpZeros)}`)
    .setStyle('PRIMARY');

  const decreaseXP = new Discord.MessageButton()
    .setCustomId('decreaseXP')
    .setLabel(`-1${'0'.repeat(selection.xpZeros)}`)
    .setStyle('PRIMARY');

  const increaseLvl = new Discord.MessageButton()
    .setCustomId('increaseLvl')
    .setLabel(`+1${'0'.repeat(selection.lvlZeros)}`)
    .setStyle('PRIMARY');

  const decreaseLvl = new Discord.MessageButton()
    .setCustomId('decreaseLvl')
    .setLabel(`-1${'0'.repeat(selection.lvlZeros)}`)
    .setStyle('PRIMARY');

  const done = new Discord.MessageButton()
    .setCustomId('done')
    .setLabel(msg.language.done)
    .setStyle('SUCCESS')
    .setDisabled(
      Number(selection.newXP) === Number(selection.curXP) &&
        Number(selection.newLvl) === Number(selection.curLvl),
    );

  const cancel = new Discord.MessageButton()
    .setCustomId('cancel')
    .setLabel(msg.language.cancel)
    .setStyle('DANGER');

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

      if (String(selection.newXP).length > 25) break;

      for (let i = 0; selection.newXP >= (5 / 6) * i * (2 * i * i + 27 * i + 91); i += 1) {
        selection.newLvl = i;
      }
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

  const embed = new Discord.MessageEmbed()
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