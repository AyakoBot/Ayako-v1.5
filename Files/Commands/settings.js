/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const Discord = require('discord.js');
const fs = require('fs');

const editors = new Discord.Collection();
fs.readdirSync('./Files/Commands/settings/editors')
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    const editorfile = require(`./settings/editors/${file}`);
    editors.set(editorfile.key, editorfile);
  });

module.exports = {
  name: 'settings',
  perm: null,
  dm: false,
  takesFirstArg: false,
  aliases: null,
  async execute(msg) {
    const settings = new Discord.Collection();
    const settingsFiles = fs
      .readdirSync('./Files/Commands/settings')
      .filter((file) => file.endsWith('.js'));

    settingsFiles.forEach((file) => {
      const settingsfile = require(`./settings/${file}`);
      settingsfile.name = file.replace('.js', '');

      if (!msg.language.commands.settings[settingsfile.name]) {
        throw new Error(`Couldn't find ${settingsfile.name} in msg.language.commands.settings`);
      }

      settingsfile.category = msg.language.commands.settings[settingsfile.name].category;
      settings.set(file.replace('.js', ''), settingsfile);
    });

    if (!msg.args[0]) {
      let categoryText = '';
      const categories = [];
      settings.forEach((setting) => {
        setting.category.forEach((category) => {
          if (!categories.includes(category)) categories.push(category);
        });
      });

      categories.forEach((category) => {
        const settingCategories = [];
        settings.forEach((s) => {
          if (s.category.includes(category)) settingCategories.push(s.name);
        });

        for (let i = 0; i < settingCategories.length; i += 1) {
          const settingsFile = settings.get(settingCategories[i]);

          let type;
          if (settingsFile.type) {
            switch (settingsFile.type) {
              default: {
                type = msg.client.constants.emotes.blue;
                break;
              }
              case 1: {
                type = msg.client.constants.emotes.yellow;
                break;
              }
              case 2: {
                type = msg.client.constants.emotes.red;
                break;
              }
              case 3: {
                type = msg.client.constants.emotes.blue;
                break;
              }
              case 4: {
                type = msg.client.constants.emotes.green;
                break;
              }
            }
          } else type = msg.client.constants.emotes.blue;

          settingCategories[i] = `${type}${settingCategories[i]} `;
          settingCategories[i] += new Array(22 - settingCategories[i].length).join(' ');
        }

        categoryText += `__${category}__:\n${msg.client.ch.makeCodeBlock(
          `${settingCategories.map((s) => `${s}`)}`.replace(/,/g, ''),
        )}\n`;
      });

      const embed = new Discord.MessageEmbed()
        .setAuthor(
          msg.language.commands.settings.noEmbed.author,
          msg.client.constants.emotes.settingsLink,
          msg.client.constants.standard.invite,
        )
        .setDescription(
          msg.client.ch.stp(msg.lan.settings.desc, {
            prefix: msg.client.constants.standard.prefix,
            commands: categoryText,
          }),
        )
        .setColor(msg.client.constants.commands.settings.color);
      msg.client.ch.reply(msg, { embeds: [embed] });
    } else {
      let settingsFile = settings.get(msg.args[0].toLowerCase());
      if (!settingsFile) return msg.client.ch.reply(msg, { content: msg.lan.invalSettings });
      if (settingsFile.hasNoSettings) {
        settingsFile = require('./settings/overview');
        settingsFile.name = 'overview';
      }

      msg.file = settingsFile;
      msg.lan = msg.language.commands.settings[settingsFile.name];
      msg.lanSettings = msg.language.commands.settings;

      whereToGo(msg);
    }
    return null;
  },
  async display(msg) {
    const singleRowDisplay = async (row, answer) => {
      const embed =
        typeof msg.file.displayEmbed === 'function'
          ? msg.file.displayEmbed(msg, row)
          : noEmbed(msg);

      embed
        .setAuthor(
          msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
          msg.client.constants.emotes.settingsLink,
          msg.client.constants.standard.invite,
        )
        .setColor(msg.client.constants.commands.settings.color);

      const edit = new Discord.MessageButton()
        .setCustomId('edit')
        .setStyle('PRIMARY')
        .setLabel(msg.language.Edit);

      if (
        msg.file.perm &&
        !msg.member.permissions.has(new Discord.Permissions(msg.file.perm)) &&
        msg.author.id !== '318453143476371456'
      ) {
        return msg.client.ch.reply(msg, { embeds: [embed] });
      }

      await replier({ msg, answer }, { embed, rawButtons: [edit] });

      const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
      buttonsCollector.on('collect', (interaction) => {
        if (interaction.user.id === msg.author.id) {
          if (interaction.customId === 'edit') {
            buttonsCollector.stop();
            singleRowEdit({ msg, answer: interaction }, row, embed, false);
          }
        } else msg.client.ch.notYours(interaction, msg);
      });
      buttonsCollector.on('end', (collected, reason) => {
        if (reason === 'time') msg.m.edit({ embeds: [embed], components: [] });
      });
      return null;
    };

    const mmrDisplay = async (answer) => {
      if (!answer) await rower(msg);

      msg.lanSettings = msg.language.commands.settings;
      msg.lan = msg.lanSettings[msg.file.name];
      msg.client.constants.commands.settings.editReq.splice(2, 1);

      const res = await msg.client.ch.query(
        `SELECT * FROM ${
          msg.client.constants.commands.settings.tablenames[msg.file.name][0]
        } WHERE guildid = $1;`,
        [msg.guild.id],
      );

      let embed = new Discord.MessageEmbed().setColor(msg.client.constants.commands.settings.color);

      if (res && res.rowCount > 0) {
        if (msg.file.mmrEmbed[Symbol.toStringTag] === 'AsyncFunction') {
          embed = await msg.file.mmrEmbed(msg, res.rows);
        } else {
          embed =
            typeof msg.file.mmrEmbed === 'function'
              ? msg.file.mmrEmbed(msg, res.rows)
              : noEmbed(msg);
        }
      } else embed = noEmbed(msg);

      embed
        .setAuthor(
          msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
          msg.client.constants.emotes.settingsLink,
          msg.client.constants.standard.invite,
        )
        .setColor(msg.client.constants.commands.settings.color);

      const settingsConstant = msg.client.constants.commands.settings.setupQueries[msg.file.name];
      const options = {
        allOptions: [],
        take: [],
        page: 1,
      };
      res.rows.forEach((row) => {
        options.allOptions.push({
          label: `${row.id} ${
            settingsConstant.removeIdent !== ''
              ? `| ${getIdentifier(msg, settingsConstant, row)}`
              : ''
          }`,
          value: row.id,
        });
      });

      options.take = [];
      for (
        let i = options.page * 25;
        i < options.allOptions.length && i < options.page * 25 + 25;
        i += 1
      ) {
        options.take.push(options.allOptions[i]);
      }

      const { list, next, prev, edit } = getMMRListButtons();

      const rows = [[list], [next, prev]];
      if (
        !msg.file.perm ||
        msg.member.permissions.has(new Discord.Permissions(msg.file.perm)) ||
        msg.author.id === '318453143476371456'
      ) {
        rows.push([edit]);
      }

      await replier({ msg, answer }, { rawButtons: rows, embed });

      const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
      buttonsCollector.on('collect', (interaction) => {
        if (interaction.user.id !== msg.author.id) {
          return msg.client.ch.notYours(interaction, msg);
        }
        switch (interaction.customId) {
          default: {
            break;
          }
          case 'list': {
            singleRowDisplay(res.rows[interaction.values[0] - 1]);
            buttonsCollector.stop();
            break;
          }
          case 'next': {
            options.page += 1;
            break;
          }
          case 'prev': {
            options.page -= 1;
            break;
          }
          case 'edit': {
            mmrEditList({ msg, answer }, { res, embed });
            buttonsCollector.stop();
            break;
          }
        }
        return null;
      });
      buttonsCollector.on('end', (collected, reason) => {
        if (reason === 'time') msg.client.ch.collectorEnd(msg);
        return null;
      });
    };

    if (!msg.file.setupRequired === false) return mmrDisplay();

    const res = await msg.client.ch.query(
      `SELECT * FROM ${
        msg.client.constants.commands.settings.tablenames[msg.file.name][0]
      } WHERE guildid = $1;`,
      [msg.guild.id],
    );

    if (res && res.rowCount > 0) return singleRowDisplay(res.rows[0]);
    return noEmbed(msg);
  },
};

const noEmbed = (msg) => {
  const embed = new Discord.MessageEmbed()
    .setColor(msg.client.constants.commands.settings.color)
    .setAuthor(msg.language.commands.settings.noEmbed.author)
    .setDescription(msg.language.commands.settings.noEmbed.desc);
  msg.client.ch.reply(msg, { embeds: [embed] });
};

async function rower(msg) {
  const res = await msg.client.ch.query(
    `SELECT * FROM ${
      msg.client.constants.commands.settings.tablenames[msg.file.name][0]
    } ORDER BY uniquetimestamp ASC;`,
  );
  if (!res || res.rowCount === 0) return;
  if (!res.rows[0].uniquetimestamp) return;

  const promises = [];
  res.rows.forEach((row, i) => {
    res.rows[i].id = i + 1;
    promises.push(
      msg.client.ch.query(
        `UPDATE ${
          msg.client.constants.commands.settings.tablenames[msg.file.name][0]
        } SET id = $1 WHERE uniquetimestamp = $2;`,
        [res.rows[i].id, res.rows[i].uniquetimestamp],
      ),
    );
  });
  await Promise.all(promises);
}

const replier = async (msgData, sendData) => {
  const { msg, answer } = msgData;
  const { rawButtons, embed } = sendData;
  const buttons = msg.client.ch.buttonRower(rawButtons);

  if (answer && !answer.replied) {
    await answer.update({
      embeds: [embed],
      components: buttons,
    });
  } else if (msg.m) {
    await msg.m.edit({
      embeds: [embed],
      components: buttons,
    });
  } else {
    msg.m = await msg.client.ch.reply(msg, {
      embeds: [embed],
      components: buttons,
    });
  }
  return true;
};

const getMMRListButtons = (msg, options, editView) => {
  const next = new Discord.MessageButton()
    .setCustomId('next')
    .setLabel(msg.language.next)
    .setDisabled(options.allOptions.length < 25)
    .setStyle('SUCCESS');
  const prev = new Discord.MessageButton()
    .setCustomId('prev')
    .setLabel(msg.language.prev)
    .setDisabled(true)
    .setStyle('DANGER');
  const list = new Discord.MessageButton()
    .setCustomId('list')
    .setDisabled(!options.allOptions.length)
    .setMaxValues(1)
    .setMinvalues(1)
    .setPlaceholder(msg.language.select.id.select)
    .setOptions(options.take);

  if (editView) {
    const add = new Discord.MessageButton()
      .setCustomId('add')
      .setStyle('SUCCESS')
      .setLabel(msg.language.add);
    const remove = new Discord.MessageButton()
      .setCustomId('remove')
      .setStyle('DANGER')
      .setLabel(msg.language.remove)
      .setDisabled(!options.allOptions.length);

    return { next, prev, list, add, remove };
  }
  if (!editView) {
    const edit = new Discord.MessageButton()
      .setCustomId('edit')
      .setStyle('PRIMARY')
      .setLabel(msg.language.Edit);

    return { next, prev, edit, list };
  }

  return null;
};

const getIdentifier = (msg, settingsConstant, row) => {
  let identifier;

  switch (settingsConstant.identType) {
    default: {
      identifier = row[settingsConstant.ident];
      break;
    }
    case 'role': {
      identifier = msg.guild.roles.cache.get(row[settingsConstant.ident]).name;
      break;
    }
    case 'channel': {
      identifier = msg.guild.channels.cache.get(row[settingsConstant.ident]).name;
      break;
    }
  }

  return identifier;
};

const mmrEditList = async (msgData, sendData) => {
  const { msg } = msgData;
  const { res } = sendData;

  const mmrRemove = async (answer) => {
    const removeLanguage = msg.lanSettings[msg.file.name].otherEdits.remove;

    const required = {
      key: 'id',
      value: removeLanguage.process[0],
      assinger: msg.client.constants.commands.settings.edit[msg.file.name].id,
    };

    const editor = editors.find((f) => f.key.includes(msg.property));
    const returnedData = await editorInteractionHandler(
      { msg, answer },
      { insertedValues: {}, required, editor },
      {},
      res,
    );
    if (!returnedData) return null;
    answer = returnedData.interaction;

    const { values } = returnedData;
    values.uniquetimestamp = res.rows[values.id - 1].uniquetimestamp;

    const table = msg.client.constants.commands.settings.tablenames[msg.file.name][0];

    return msg.client.ch.query(`DELETE FROM ${table} WHERE id = $1 AND uniquetimestamp = $2;`, [
      values.id,
      values.uniquetimestamp,
    ]);
  };

  const mmrAddRepeater = async (answer, embed, addLanguage, steps, insertedValues, row) => {
    const { requiredSteps, currentStep } = steps;

    if (requiredSteps.length === currentStep + 1) {
      return insertedValues;
    }

    const required = {
      key: msg.client.constants.commands.settings.setupQueries[msg.file.name].add[currentStep],
      value: addLanguage.process[currentStep],
      assinger:
        msg.client.constants.commands.settings.edit[msg.file.name][
          msg.client.constants.commands.settings.setupQueries[msg.file.name].add[currentStep]
        ],
    };

    const editor = editors.find((f) => f.key.includes(msg.property));
    if (editor.requiresInteraction) {
      const returnedData = await editorInteractionHandler(
        { msg, answer },
        { insertedValues, required, editor },
        row,
        res,
      );
      if (!returnedData) return null;
      answer = returnedData.interaction;
    } else {
      editor.execute(msg, required, insertedValues);
    }

    return mmrAddRepeater(answer, embed, addLanguage, steps, insertedValues, row);
  };

  const mmrAdd = async (answer, row) => {
    const addLanguage = msg.lanSettings[msg.file.name].otherEdits.add;
    const requiredSteps = msg.client.constants.commands.settings[msg.file.name].add;

    const embed = new Discord.MessageEmbed()
      .setAuthor(addLanguage.name, null, msg.client.constants.standard.invite)
      .setColor(msg.client.constants.commands.settings.color);

    const values = await mmrAddRepeater(
      answer,
      embed,
      addLanguage,
      { requiredSteps, currentStep: 0 },
      {},
      row,
    );

    values.uniquetimestamp = Date.now();
    values.id = res.rows.length + 1;
    values.guildid = msg.guild.id;

    const tables = msg.client.constants.commands.settings.tablenames[msg.file.name];
    tables.forEach((table, i) => {
      const cols = msg.client.constants.commands.settings.setupQueries.cols[i];
      const vals = msg.client.constants.commands.settings.setupQueries.vals[i];

      const valueIdentifier = cols.map((collumn, j) => `$${j + 1}`);
      const valuesSTP = vals.map((value) => msg.client.ch.stp(value, { values, msg }));

      msg.client.ch.query(
        `INSERT INTO ${table} (${cols}) VALUES (${valueIdentifier.join(', ')});`,
        valuesSTP,
      );
    });
  };

  const { answer } = msgData;
  let { embed } = sendData;

  if (!embed) {
    embed = msg.file.mmrEmbed(msg, res);
  }

  embed.setDescription(msg.lanSettings.mmrEditList);

  const options = {
    allOptions: [],
    take: [],
    page: 1,
  };
  const settingsConstant = msg.client.constants.commands.settings.setupQueries[msg.file.name];

  res.rows.forEach((row) => {
    options.allOptions.push({
      label: `${row.id} ${
        settingsConstant.removeIdent !== '' ? `| ${getIdentifier(msg, settingsConstant, row)}` : ''
      }`,
      value: row.id,
    });
  });

  options.take = [];
  for (
    let i = options.page * 25;
    i < options.allOptions.length && i < options.page * 25 + 25;
    i += 1
  ) {
    options.take.push(options.allOptions[i]);
  }

  const rawButtons = getMMRListButtons(msg, options, true);

  await replier({ msg, answer }, { rawButtons, embed });

  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  buttonsCollector.on('collect', (interaction) => {
    if (interaction.user.id !== msg.author.id) return msg.client.ch.notYours(interaction, msg);
    switch (interaction.customId) {
      default: {
        return null;
      }
      case 'add': {
        mmrAdd(interaction, {});
        buttonsCollector.stop();
        break;
      }
      case 'remove': {
        mmrRemove(interaction);
        buttonsCollector.stop();
        break;
      }
      case 'next': {
        options.page += 1;
        break;
      }
      case 'prev': {
        options.page -= 1;
        break;
      }
      case 'list': {
        singleRowEdit(
          { msg, answer: interaction },
          res.rows[interaction.values[0] - 1],
          embed,
          true,
        );
        buttonsCollector.stop();
        break;
      }
    }

    return null;
  });
  buttonsCollector.on('end', (collected, reason) => {
    if (reason === 'time') msg.client.ch.collectorEnd(msg);
  });
};

const singleRowEdit = async (msgData, row, embed, comesFromMMR) => {
  const { msg, answer } = msgData;

  if (!embed) {
    embed = msg.file.displayEmbed(msg, row);
  }

  const rawButtons = msg.file.buttons(msg, row);

  if (comesFromMMR) {
    const back = new Discord.MessageButton()
      .setCustomId('back')
      .setLabel(msg.language.back)
      .setEmoji(msg.client.constants.emotes.back)
      .setStyle('DANGER');

    rawButtons.push(back);
  }

  embed.setAuthor(
    msg.client.ch.stp(msg.lanSettings.authorEdit, { type: msg.lanSettings[msg.file.name].type }),
    msg.client.constants.emotes.settingsLink,
    msg.client.constants.standard.invite,
  );

  await replier({ msg, answer }, { rawButtons, embed });

  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  buttonsCollector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) return msg.client.ch.notYours(interaction, msg);

    const [editKey] = Object.entries(msg.lanSettings[msg.file.name].edit)
      .map(([key, value]) => {
        if (interaction.customId === value.name) return key;
        return null;
      })
      .filter((f) => !!f);

    buttonsCollector.stop();
    await changing({ msg, answer: interaction }, { usedKey: editKey, row, comesFromMMR });

    return null;
  });
  buttonsCollector.on('end', (collected, reason) => {
    if (reason === 'time') msg.client.ch.collectorEnd(msg);
  });
};

const whereToGo = async (msg, answer) => {
  if (!msg.args[1]) module.exports.display(msg);
  else if (
    msg.args[1] &&
    msg.file.perm &&
    !msg.member.permissions.has(new Discord.Permissions(msg.file.perm)) &&
    msg.author.id !== '318453143476371456'
  ) {
    return msg.client.ch.reply(msg, {
      content: msg.language.commands.commandHandler.missingPermissions,
    });
  } else {
    if (!msg.file.setupRequired === false) return mmrEditList({ msg, answer }, { res });
    const res = await msg.client.ch.query(
      `SELECT * FROM ${
        msg.client.constants.commands.settings.tablenames[msg.file.name][0]
      } WHERE guildid = $1;`,
      [msg.guild.id],
    );
    singleRowEdit({ msg, answer }, res.rows[0]);
  }
  return null;
};

const editorInteractionHandler = async (msgData, editorData, row, res) => {
  const { msg, answer } = msgData;
  const { insertedValues, required, editor } = editorData;

  const languageOfSetting = msg.language.commands.settings[msg.file.name];
  const languageOfKey = languageOfSetting.edit[required.assinger];

  const Objects = {
    options: [],
    take: [],
    page: 1,
  };

  const passObject = editor.dataPreparation(msg, { insertedValues, required, Objects }, row, res);
  const selected = editor.getSelected(msg, insertedValues, required, passObject);

  const embed = new Discord.MessageEmbed()
    .setColor(msg.client.constants.commands.settings.color)
    .addField(
      ' \u200b',
      `${languageOfKey.recommended ? `${languageOfKey.recommended}\n` : ''}${languageOfKey.desc}`,
    )
    .addField(msg.language.page, `\`1/${Math.ceil(Objects.options.length / 25)}\``)
    .setTitle(languageOfKey.name)
    .setAuthor(
      msg.client.ch.stp(msg.lanSettings.authorEdit, {
        type: languageOfSetting.type,
      }),
      msg.client.constants.emotes.settingsLink,
      msg.client.constants.standard.invite,
    );
  if (selected !== 'noSelect') {
    embed.setDescription(
      `**${msg.language.selected}:**\n${selected.length ? selected : msg.language.none}`,
    );
  }

  await replier(
    { msg, answer },
    { embed, rawButtons: editor.buttons(msg, passObject, insertedValues, required, row) },
  );

  let messageCollector;
  if (editor.interactionType === 'message') {
    messageCollector = msg.channel.createMessageCollector({ time: 60000 });
    messageHandler({ msg, messageCollector }, { insertedValues, required, editor });
  }
  return buttonHandler(
    { msg, row, embed, messageCollector },
    { insertedValues, required, editor, passObject, Objects },
    { languageOfKey, languageOfSetting },
  );
};

const changing = async (msgData, editData) => {
  const { msg } = msgData;
  let { answer } = msgData;
  const { usedKey, row, comesFromMMR } = editData;

  const settings = msg.client.constants.commands.settings.edit[msg.file.name];
  const editor = editors.find((f) => f.key.includes(settings[usedKey]));
  const language =
    usedKey === 'active' ? msg.lanSettings.active : msg.lanSettings[msg.file.name].edit[usedKey];

  const required = {
    key: settings[usedKey],
    value: language,
    assinger: usedKey,
  };

  const insertedValues = {};

  if (editor.requiresInteraction) {
    const returnedData = await editorInteractionHandler(
      { msg, answer },
      { insertedValues, required, editor },
      row,
    );
    if (!returnedData) return null;
    answer = returnedData.interaction;
  } else {
    editor.execute(msg, required, insertedValues, row);
  }

  dbUpdate(msg, { insertedValues, required, comesFromMMR, row });
  log(msg, { insertedValues, required, comesFromMMR, row });

  row[usedKey] = insertedValues[usedKey];

  const embed = msg.file.displayEmbed(msg, row);

  return singleRowEdit({ msg, answer }, row, embed, comesFromMMR);
};

const dbUpdate = (msg, editData) => {
  const { insertedValues, required, comesFromMMR, row } = editData;
  const [tableName] = msg.client.constants.commands.settings.tablenames[msg.file.name];

  if (comesFromMMR) {
    msg.client.ch.query(
      `UPDATE ${tableName} SET ${required.assinger} = $1 WHERE guildid = $2 AND uniquetimestamp = $3;`,
      [insertedValues[required.assinger], msg.guild.id, row.uniquetimestamp],
    );
  } else {
    msg.client.ch.query(`UPDATE ${tableName} SET ${required.assinger} = $1 WHERE guildid = $2;`, [
      insertedValues[required.assinger],
      msg.guild.id,
    ]);
  }
};

const log = async (msg, editData) => {
  const { insertedValues, required, comesFromMMR, row } = editData;

  const oldSettings = row[required.assinger];
  const newSettings = insertedValues[required.assinger];
  const settingsName = msg.lanSettings[msg.file.name].edit[required.assinger].name;
  const { type } = msg.language.commands.settings[msg.file.name];

  const embed = new Discord.MessageEmbed().setAuthor(
    msg.client.ch.stp(msg.language.selfLog.author, {
      type,
    }),
    msg.client.constants.emotes.settingsLink,
    msg.client.constants.standard.invite,
  );
  if (comesFromMMR) {
    embed.setDescription(
      msg.client.ch.stp(msg.language.descriptionWithID, { type, msg, id: row.id }),
    );
  } else {
    embed.setDescription(msg.client.ch.stp(msg.language.description, { type, msg }));
  }

  embed.addField(msg.lanSettings.oldValue, `${settingsName}: ${oldSettings}`, true);
  embed.addField(msg.lanSettings.newValue, `${settingsName}: ${newSettings}`, true);

  const res = await msg.client.ch.query('SELECT settingslog FROM logchannels WHERE guildid = $1;', [
    msg.guild.id,
  ]);
  const channels = res.rows[0].settingslog
    ?.map((id) =>
      typeof msg.client.channels.cache.get(id)?.send === 'function'
        ? msg.client.channels.cache.get(id)
        : null,
    )
    .filter((c) => c !== null);
  msg.client.ch.send(channels, { embeds: [embed] });
};

const buttonHandler = async (msgData, editData, languageData) => {
  const { insertedValues, required, editor, passObject, Objects } = editData;
  const { msg, row, messageCollector } = msgData;
  let { embed } = msgData;
  const { languageOfKey, languageOfSetting } = languageData;

  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  return new Promise((resolve) => {
    buttonsCollector.on('collect', async (interaction) => {
      if (interaction.user.id !== msg.author.id) return msg.client.ch.notYours(interaction, msg);
      buttonsCollector.resetTimer();
      if (messageCollector) messageCollector.resetTimer();
      switch (interaction.customId) {
        default: {
          if (interaction.values && Array.isArray(insertedValues[required.assinger])) {
            interaction.values.forEach((value) => {
              if (insertedValues[required.assinger].includes(value)) {
                insertedValues[required.assinger].splice(
                  insertedValues[required.assinger].indexOf(value),
                  1,
                );
              } else {
                insertedValues[required.assinger].push(value);
              }
            });
          } else {
            insertedValues[required.assinger] = interaction.values;
          }

          const returnedObject = editor.interactionHandler(
            { msg, answer: interaction },
            passObject,
            insertedValues,
            required,
          );
          if (!returnedObject) break;
          else embed = returnedObject.returnEmbed;

          embed
            .setColor(msg.client.constants.commands.settings.color)
            .addField(
              ' \u200b',
              `${languageOfKey.recommended ? `${languageOfKey.recommended}\n` : ''}${
                languageOfKey.desc
              }`,
            )
            .addField(msg.language.page, `\`1/${Math.ceil(Objects.options.length / 25)}\``)
            .setTitle(languageOfKey.name)
            .setAuthor(
              msg.client.ch.stp(msg.lanSettings.authorEdit, {
                type: languageOfSetting.type,
              }),
              msg.client.constants.emotes.settingsLink,
              msg.client.constants.standard.invite,
            );

          await replier(
            { msg, answer: interaction },
            {
              rawButtons: editor.buttons(msg, passObject, insertedValues, required, row),
              embed,
            },
          );
          break;
        }
        case 'back': {
          whereToGo(msg, interaction);
          buttonsCollector.stop();
          if (messageCollector) messageCollector.stop();
          resolve(null);
          break;
        }
        case 'next': {
          const indexLast = passObject.Objects.options.findIndex(
            (r) =>
              r.value ===
              interaction.message.components[0].components[0].options[
                interaction.message.components[0].components[0].options.length - 1
              ].value,
          );

          passObject.Objects.take = [];
          passObject.Objects.page += 1;

          embed.fields.splice(-1, 1);
          embed.addField(
            msg.language.page,
            `\`${passObject.Objects.page}/${Math.ceil(passObject.Objects.options.length / 25)}\``,
          );

          for (
            let j = indexLast + 1;
            j < indexLast + 26 && j < passObject.Objects.options.length;
            j += 1
          ) {
            passObject.Objects.take.push(passObject.Objects.options[j]);
          }

          await replier(
            { msg, answer: interaction },
            { rawButtons: editor.buttons(msg, passObject, insertedValues, required, row), embed },
          );
          break;
        }
        case 'prev': {
          const indexFirst = passObject.Objects.options.findIndex(
            (r) => r.value === interaction.message.components[0].components[0].options[0].value,
          );

          passObject.Objects.take = [];
          passObject.Objects.page -= 1;

          embed.fields.splice(-1, 1);
          embed.addField(
            msg.language.page,
            `\`${passObject.Objects.page}/${Math.ceil(passObject.Objects.options.length / 25)}\``,
          );

          for (
            let j = indexFirst - 25;
            j < indexFirst && j < passObject.Objects.options.length;
            j += 1
          ) {
            passObject.Objects.take.push(passObject.Objects.options[j]);
          }

          await replier(
            { msg, answer: interaction },
            { rawButtons: editor.buttons(msg, passObject, insertedValues, required, row), embed },
          );
          break;
        }
        case 'done': {
          buttonsCollector.stop();
          if (messageCollector) messageCollector.stop();
          resolve({ values: insertedValues, interaction });
        }
      }
      return null;
    });
    buttonsCollector.on('end', (collected, reason) => {
      if (reason === 'time') {
        msg.client.ch.collectorEnd(msg);
        resolve(null);
      }
    });
  });
};

const messageHandler = async (msgData, editData) => {
  const { insertedValues, required, editor } = editData;
  const { msg, messageCollector } = msgData;

  messageCollector.on('collect', async (message) => {
    if (message.author.id !== msg.author.id) return null;
    messageCollector.resetTimer();
    editor.messageHandler({ msg, message }, insertedValues, required);
    return null;
  });
};
