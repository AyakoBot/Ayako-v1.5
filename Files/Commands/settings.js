const Discord = require('discord.js');

module.exports = {
  name: 'settings',
  perm: null,
  dm: false,
  takesFirstArg: false,
  aliases: null,
  async execute(msg, answer) {
    const options = [];

    if (!msg.args[0]) {
      let categoryText = '';
      const categories = [];
      msg.client.settings.forEach((setting) => {
        setting.category.forEach((category) => {
          if (!categories.includes(category)) categories.push(category);
        });
      });

      categories.forEach((category) => {
        const settingCategories = [];
        msg.client.settings.forEach((s) => {
          if (s.category.includes(category)) {
            if (s.folder && !!settingCategories.findIndex((a) => a.folder === s.folder)) {
              if (msg.client.constants.commands.settings.baseSettings[s.folder] === s.name) {
                options.push({ label: s.folder, value: s.folder });
                settingCategories.push(s.folder);
              }
            } else {
              options.push({ label: s.name, value: s.name });
              settingCategories.push(s.name);
            }
          }
        });

        for (let i = 0; i < settingCategories.length; i += 1) {
          let settingsFile = msg.client.settings.get(settingCategories[i]);
          if (!settingsFile) {
            settingsFile = msg.client.settings.get(
              msg.client.constants.commands.settings.baseSettings[settingCategories[i]],
            );
          }

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

          const index = options.findIndex((o) => o.value === settingsFile.name);
          if (options[index]) {
            options[index].emoji = type;
            options[index].description = category;
          } else {
            const ind = options.findIndex((o) => o.value === settingsFile.folder);
            options[ind].emoji = msg.client.constants.emotes.folder;
          }

          settingCategories[i] = `${type}${settingCategories[i]} `;
          settingCategories[i] += new Array(22 - settingCategories[i].length).join(' ');
        }

        categoryText += `__${category}__:\n${msg.client.ch.makeCodeBlock(
          `${settingCategories.map((s) => `${s}`)}`.replace(/,/g, ''),
        )}\n`;
      });

      const rawButtons = [
        new Discord.MessageSelectMenu()
          .addOptions(options)
          .setCustomId('menu')
          .setMaxValues(1)
          .setMinValues(1)
          .setPlaceholder(msg.language.commands.settings.menu.placeholder),
      ];

      const embed = new Discord.MessageEmbed()
        .setAuthor({
          name: msg.language.commands.settings.noEmbed.author,
          iconURL: msg.client.constants.emotes.settingsLink,
          url: msg.client.constants.standard.invite,
        })
        .setDescription(
          msg.client.ch.stp(msg.language.commands.settings.settings.desc, {
            prefix: msg.client.constants.standard.prefix,
            commands: categoryText,
          }),
        );
      await replier({ msg, answer }, { embeds: [embed], rawButtons });
      categoryMenuHandler({ msg, answer }, false);
    } else {
      let settingsFile = msg.client.settings.get(msg.args[0].toLowerCase());

      if (!settingsFile && msg.client.constants.commands.settings.baseSettings[msg.args[0]]) {
        settingsFile = {
          name: msg.args[0].toLowerCase(),
          folder: msg.args[0].toLowerCase(),
        };
      }
      if (!settingsFile) {
        return msg.client.ch.reply(msg, { content: msg.lan.invalSettings, components: [] });
      }

      if (settingsFile.name === settingsFile.folder) {
        return categoryDisplay(msg, answer, true);
      }
      if (settingsFile.hasNoSettings) {
        settingsFile = require('./settings/categories/overview');
        settingsFile.name = 'overview';
      }

      msg.file = settingsFile;
      msg.lan = msg.language.commands.settings[settingsFile.name];
      msg.lanSettings = msg.language.commands.settings;

      whereToGo(msg, answer);
    }
    return null;
  },
  async display(msgData) {
    const { msg } = msgData;

    const singleRowDisplay = async (res, row, answer, comesFromMMR) => {
      let embed;
      let embed2;

      if (typeof msg.file.displayEmbed === 'function') {
        const returned = msg.file.displayEmbed(msg, row);
        if (Array.isArray(returned)) {
          [embed, embed2] = returned;
        } else {
          embed = returned;
        }
      } else embed = noEmbed(msg, answer, res, comesFromMMR);

      embed.setAuthor({
        name: msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
        iconURL: msg.client.constants.emotes.settingsLink,
        url: msg.client.constants.standard.invite,
      });

      const edit = new Discord.MessageButton()
        .setCustomId('edit')
        .setStyle('PRIMARY')
        .setLabel(msg.language.Edit);

      if (
        msg.file.perm &&
        !msg.member.permissions.has(new Discord.Permissions(msg.file.perm)) &&
        msg.author.id !== '318453143476371456'
      ) {
        if (embed2) return replier({ msg, answer }, { embeds: [embed2, embed] });
        return replier({ msg, answer }, { embeds: [embed] });
      }

      if (embed2) await replier({ msg, answer }, { embeds: [embed2, embed], rawButtons: [edit] });
      else await replier({ msg, answer }, { embeds: [embed], rawButtons: [edit] });

      const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
      buttonsCollector.on('collect', (interaction) => {
        if (interaction.user.id === msg.author.id) {
          if (interaction.customId === 'edit') {
            buttonsCollector.stop();
            singleRowEdit({ msg, answer: interaction }, { row, res }, embed, comesFromMMR);
          }
        } else msg.client.ch.notYours(interaction, msg);
      });
      buttonsCollector.on('end', (collected, reason) => {
        if (reason === 'time') {
          msg.m.edit({ embeds: [embed], components: [] }).catch(() => {});
          msg.m.reactions.removeAll().catch(() => {});
        }
      });

      if (comesFromMMR) {
        const returned = await reactionHandler({ msg, answer }, buttonsCollector, {
          needsReturn: true,
        });
        if (returned) mmrDisplay();
      } else reactionHandler({ msg, answer }, buttonsCollector);

      return null;
    };

    const mmrDisplay = async (answer) => {
      msg.lanSettings = msg.language.commands.settings;
      msg.lan = msg.lanSettings[msg.file.name];
      msg.client.constants.commands.settings.editReq.splice(2, 1);

      if (!msg.client.constants.commands.settings.tablenames[msg.file.name]) {
        throw new Error(`Table Names for ${msg.file.name} missing in Constants.json`);
      }

      const res = await msg.client.ch.query(
        `SELECT * FROM ${
          msg.client.constants.commands.settings.tablenames[msg.file.name][0]
        } WHERE guildid = $1 ORDER BY uniquetimestamp ASC;`,
        [msg.guild.id],
      );

      if (!res.rows[0]?.id) {
        res.rows.forEach((row, i) => {
          res.rows[i].id = i;
        });
      }
      let embed = new Discord.MessageEmbed();

      if (res && res.rowCount > 0) {
        if (msg.file.mmrEmbed[Symbol.toStringTag] === 'AsyncFunction') {
          embed = await msg.file.mmrEmbed(msg, res.rows);
        } else if (typeof msg.file.mmrEmbed === 'function') {
          embed = msg.file.mmrEmbed(msg, res.rows);
        } else {
          noEmbed(msg, answer, res, true);
          return;
        }
      } else {
        noEmbed(msg, answer, { rows: [] }, true);
        return;
      }

      embed.setAuthor({
        name: msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
        iconURL: msg.client.constants.emotes.settingsLink,
        url: msg.client.constants.standard.invite,
      });

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
          value: `${row.id}`,
        });
      });

      options.take = [];
      for (
        let i = options.page * 25 - 25;
        i < options.allOptions.length && i < options.page * 25 + 25;
        i += 1
      ) {
        options.take.push(options.allOptions[i]);
      }

      const { list, next, prev, edit } = getMMRListButtons(msg, options, false);

      const rows = [[list], [prev, next]];
      if (
        !msg.file.perm ||
        msg.member.permissions.has(new Discord.Permissions(msg.file.perm)) ||
        msg.author.id === '318453143476371456'
      ) {
        rows.push([edit]);
      }

      await replier({ msg, answer }, { rawButtons: rows, embeds: [embed] });

      const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
      reactionHandler({ msg, answer }, buttonsCollector);

      buttonsCollector.on('collect', async (interaction) => {
        if (interaction.user.id !== msg.author.id) {
          return msg.client.ch.notYours(interaction, msg);
        }
        switch (interaction.customId) {
          default: {
            break;
          }
          case 'list': {
            await interaction.deferReply().catch(() => {});
            singleRowDisplay(res, res.rows[interaction.values[0]], interaction, true);
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
            buttonsCollector.stop();
            mmrEditList({ msg, answer: interaction }, { res, embed });
            break;
          }
        }
        return null;
      });

      buttonsCollector.on('end', (collected, reason) => {
        if (reason === 'time') {
          msg.client.ch.collectorEnd(msg);
          msg.m.reactions.removeAll().catch(() => {});
        }
        return null;
      });
    };

    if (msg.file.setupRequired === false) return mmrDisplay(msgData.answer);

    const res = await msg.client.ch.query(
      `SELECT * FROM ${
        msg.client.constants.commands.settings.tablenames[msg.file.name][0]
      } WHERE guildid = $1;`,
      [msg.guild.id],
    );

    if (res && res.rowCount > 0) return singleRowDisplay(res, res.rows[0], msgData.answer);
    return noEmbed(msg, msgData.answer, res, false);
  },
};

const noEmbed = async (msg, answer, res) => {
  const embed = new Discord.MessageEmbed()
    .setAuthor({
      name: msg.language.commands.settings.noEmbed.author,
    })
    .setDescription(
      msg.client.ch.stp(msg.language.commands.settings.noEmbed.desc, {
        prefix: msg.client.constants.standard.prefix,
        name: msg.file.name,
      }),
    );

  const edit = new Discord.MessageButton()
    .setCustomId('edit')
    .setStyle('PRIMARY')
    .setLabel(msg.language.Edit);

  await replier({ msg, answer }, { embeds: [embed], rawButtons: [edit] });

  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  reactionHandler({ msg, answer }, buttonsCollector);

  buttonsCollector.on('collect', (interaction) => {
    if (interaction.user.id !== msg.author.id) return msg.client.ch.notYours(interaction, msg);
    buttonsCollector.stop();
    if (msg.file.setupRequired === false) {
      return mmrEditList({ msg, answer: interaction }, { res, embed });
    }
    return setup(msg, interaction);
  });

  buttonsCollector.on('end', (collected, reason) => {
    if (reason === 'time') msg.client.ch.collectorEnd(msg);
  });
};

/**
 * @constructor
 * @param {object} msgData - {answer, msg}.
 * @param {object} sendData - {rawButtons, embeds}.
 */
const replier = async (msgData, sendData) => {
  const { msg, answer } = msgData;
  const { rawButtons, embeds } = sendData;
  let buttons = [];
  let manualReply = false;

  if (rawButtons && rawButtons.length) {
    buttons = msg.client.ch.buttonRower(rawButtons);
  }

  if (answer && answer.deferred) {
    await answer.deleteReply().catch(() => {});
    manualReply = true;
  }

  if (answer && !answer.replied && !manualReply) {
    await answer.update({
      embeds,
      components: buttons,
    });
  } else if (msg.m) {
    await msg.m.edit({
      embeds,
      components: buttons,
    });
  } else {
    msg.m = await msg.client.ch.reply(msg, {
      embeds,
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
  const list = new Discord.MessageSelectMenu()
    .setCustomId('list')
    .setDisabled(!options.allOptions.length)
    .setMaxValues(1)
    .setMinValues(1)
    .setPlaceholder(msg.language.select.id.select)
    .setOptions(options.take.length ? options.take : { label: '--', value: '0' });

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
      identifier = row[settingsConstant.ident] ? row[settingsConstant.ident] : '--';
      break;
    }
    case 'role': {
      const role = msg.guild.roles.cache.get(row[settingsConstant.ident]);
      if (role) {
        identifier = role.name.replace(/\W{2}/gu, '');
      } else {
        identifier = '--';
      }
      break;
    }
    case 'channel': {
      const channel = msg.guild.channels.cache.get(row[settingsConstant.ident]);
      if (channel) {
        identifier = channel.name.replace(/\W{2}/gu, '');
      } else {
        identifier = '--';
      }
      break;
    }
  }

  return identifier;
};

const mmrEditList = async (msgData, sendData) => {
  const { msg } = msgData;
  const { res } = sendData;

  if (!res.rows[0]?.id) {
    res.rows.forEach((row, i) => {
      res.rows[i].id = i;
    });
  }

  const mmrRemove = async (answer) => {
    const removeLanguage = msg.lanSettings[msg.file.name].otherEdits.remove;

    const required = {
      key: 'uniquetimestamp',
      value: removeLanguage.process[0],
      assinger: 'id',
      required: true,
    };

    const editor = msg.client.settingsEditors.find((f) => f.key.includes(required.key));
    const returnedData = await editorInteractionHandler(
      { msg, answer },
      { insertedValues: {}, required, editor },
      {},
      res,
      true,
    );

    if (!returnedData) return null;
    answer = returnedData.interaction;

    const { values } = returnedData;
    const row = res.rows.find((f) => f.id === Number(values.id));
    values.uniquetimestamp = row.uniquetimestamp;

    const table = msg.client.constants.commands.settings.tablenames[msg.file.name][0];

    await msg.client.ch.query(`DELETE FROM ${table} WHERE uniquetimestamp = $1;`, [
      values.uniquetimestamp,
    ]);

    log(msg, { insertedValues: values, required, comesFromMMR: true, row });
    return module.exports.execute(msg, answer);
  };

  const mmrAddRepeater = async (answer, embed, addLanguage, steps, insertedValues, row) => {
    const { requiredSteps, currentStep } = steps;

    if (requiredSteps.length <= currentStep) {
      return answer;
    }

    const keyOfCurStep =
      msg.client.constants.commands.settings.setupQueries[msg.file.name].add[currentStep];
    const DataOfCurStep = msg.client.constants.commands.settings.edit[msg.file.name][keyOfCurStep];

    if (!DataOfCurStep) {
      throw new Error(
        `"${keyOfCurStep}" missing in Constants.json. "${msg.file.name}" Settings used`,
      );
    }

    const required = {
      key: DataOfCurStep.key,
      value: addLanguage.process[currentStep],
      assinger: keyOfCurStep,
      required: DataOfCurStep.required,
    };

    const editor = msg.client.settingsEditors.find((f) => f.key.includes(required.key));
    if (editor.requiresInteraction) {
      const returnedData = await editorInteractionHandler(
        { msg, answer },
        { insertedValues, required, editor },
        row,
        res,
        true,
      );
      if (!returnedData) return null;
      answer = returnedData.interaction;
    } else {
      await editor.execute(msg, required, insertedValues, answer);
    }

    steps.currentStep += 1;
    return mmrAddRepeater(answer, embed, addLanguage, steps, insertedValues, row);
  };

  const mmrAdd = async (answer, row) => {
    const addLanguage = msg.lanSettings[msg.file.name].otherEdits.add;
    const requiredSteps = msg.client.constants.commands.settings.setupQueries[msg.file.name].add;

    const embed = new Discord.MessageEmbed().setAuthor({
      name: addLanguage.name,
      iconURL: msg.client.constants.emotes.settingsLink,
      url: msg.client.constants.standard.invite,
    });

    const insertedValues = {};

    const repeaterDone = await mmrAddRepeater(
      answer,
      embed,
      addLanguage,
      { requiredSteps, currentStep: 0 },
      insertedValues,
      row,
    );

    if (!repeaterDone) return;

    insertedValues.uniquetimestamp = Date.now();
    insertedValues.id = res.rows.length + 1;
    insertedValues.guildid = msg.guild.id;

    const tables = msg.client.constants.commands.settings.tablenames[msg.file.name];
    const promises = tables.map(async (table, i) => {
      let tableRes;
      if (i !== 0) {
        tableRes = await msg.client.ch.query(`SELECT * FROM ${table} WHERE guildid = $1;`, [
          msg.guild.id,
        ]);
      }
      if (i === 0 || !tableRes || !tableRes.rowCount) {
        const cols = msg.client.constants.commands.settings.setupQueries[msg.file.name].cols[i];
        const vals = msg.client.constants.commands.settings.setupQueries[msg.file.name].vals[i];

        const valueIdentifier = cols.split(/, +/).map((collumn, j) => `$${j + 1}`);
        const valuesSTP = vals.map((value) =>
          msg.client.ch.stp(`${value}`, { values: insertedValues, msg }),
        );

        const faultyInput = valueIdentifier.map(
          (val) => val.startsWith('{{') && val.endsWith('}}'),
        );
        if (faultyInput.includes(true)) {
          msg.channel.send({
            content: msg.client.ch.stp(msg.language.commands.settings.errors.faultyInput, {
              support: msg.client.constants.standard.support,
            }),
          });
          throw new Error(
            `faultyInput: INSERT INTO ${table}(${cols}) VALUES(${valueIdentifier.join(
              ', ',
            )}); ${valuesSTP}`,
          );
        }
        await msg.client.ch.query(
          `INSERT INTO ${table} (${cols}) VALUES (${valueIdentifier.join(', ')});`,
          valuesSTP,
        );
        log(msg, { insertedValues, row });
      }
    });

    await Promise.all(promises);

    module.exports.execute(msg, repeaterDone);
  };

  const { answer } = msgData;
  let { embed } = sendData;

  if (!embed) {
    embed = await msg.file.mmrEmbed(msg, res.rows);
  }

  embed.setDescription(msg.lanSettings.mmrEditList).setAuthor({
    name: msg.client.ch.stp(msg.lanSettings.authorEdit, {
      type: msg.lanSettings[msg.file.name].type,
    }),
    iconURL: msg.client.constants.emotes.settingsLink,
    url: msg.client.constants.standard.invite,
  });

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
      value: `${row.id}`,
    });
  });

  options.take = [];
  for (
    let i = options.page * 25 - 25;
    i < options.allOptions.length && i < options.page * 25 + 25;
    i += 1
  ) {
    options.take.push(options.allOptions[i]);
  }

  const { list, next, prev, add, remove } = getMMRListButtons(msg, options, true);
  const rows = [[list], [prev, next], [remove, add]];

  await replier({ msg, answer }, { rawButtons: rows, embeds: [embed] });

  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  buttonsCollector.on('collect', async (interaction) => {
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
        await interaction.deferReply().catch(() => {});
        const row = res.rows.find((r) => r.id === Number(interaction.values[0]));

        singleRowEdit({ msg, answer: interaction }, { row, res }, null, true);
        buttonsCollector.stop();
        break;
      }
    }

    return null;
  });
  buttonsCollector.on('end', (collected, reason) => {
    if (reason === 'time') {
      msg.client.ch.collectorEnd(msg);
      msg.m.reactions.removeAll().catch(() => {});
    }
  });

  reactionHandler({ msg, answer }, buttonsCollector, { isInEdit: true });
};

const singleRowEdit = async (msgData, resData, embed, comesFromMMR) => {
  const { msg, answer } = msgData;
  const { row, res } = resData;
  let embed2;

  if (Array.isArray(embed)) {
    [embed, embed2] = embed;
  }

  if (!embed) {
    if (!row) return setup(msg, answer);
    if (typeof msg.file.displayEmbed === 'function') {
      const returned = msg.file.displayEmbed(msg, row);
      if (Array.isArray(returned)) {
        [embed, embed2] = returned;
      } else {
        embed = returned;
      }
    } else embed = noEmbed(msg, answer, res, comesFromMMR);
  }

  const rawButtons = msg.file.buttons(msg, row);

  embed.setAuthor({
    name: msg.client.ch.stp(msg.lanSettings.authorEdit, {
      type: msg.lanSettings[msg.file.name].type,
    }),
    iconURL: msg.client.constants.emotes.settingsLink,
    url: msg.client.constants.standard.invite,
  });

  if (embed2) await replier({ msg, answer }, { embeds: [embed2, embed], rawButtons });
  else await replier({ msg, answer }, { rawButtons, embeds: [embed] });

  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  buttonsCollector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) {
      return msg.client.ch.notYours(interaction, msg);
    }

    let [editKey] = Object.entries(msg.lanSettings[msg.file.name].edit)
      .map(([key, value]) => {
        if (interaction.customId === value.name) return key;
        return null;
      })
      .filter((f) => !!f);

    buttonsCollector.stop();
    if (!editKey) editKey = interaction.customId;
    await changing({ msg, answer: interaction }, { usedKey: editKey, comesFromMMR }, { row, res });

    return null;
  });
  buttonsCollector.on('end', (collected, reason) => {
    if (reason === 'time') {
      msg.client.ch.collectorEnd(msg);
      msg.m.reactions.removeAll().catch(() => {});
    }
  });

  if (comesFromMMR) {
    const returned = await reactionHandler({ msg, answer }, buttonsCollector, {
      needsReturn: true,
    });
    if (returned) mmrEditList({ msg, answer }, { res });
  } else {
    reactionHandler({ msg, answer }, buttonsCollector, { needsReturn: false, sendTo: 'settings' });
  }

  return null;
};

const whereToGo = async (msg, answer) => {
  if (!msg.args[1] || msg.args[1].toLowerCase() !== msg.language.edit)
    module.exports.display({ msg, answer });
  else if (
    msg.args[1].toLowerCase() === msg.language.edit &&
    msg.file.perm &&
    !msg.member.permissions.has(new Discord.Permissions(msg.file.perm)) &&
    msg.author.id !== '318453143476371456'
  ) {
    return msg.client.ch.reply(msg, {
      content: msg.language.commands.commandHandler.missingPermissions,
      components: [],
    });
  } else if (msg.args[1].toLowerCase() === msg.language.edit) {
    const res = await msg.client.ch.query(
      `SELECT * FROM ${
        msg.client.constants.commands.settings.tablenames[msg.file.name][0]
      } WHERE guildid = $1;`,
      [msg.guild.id],
    );
    if (msg.file.setupRequired === false) return mmrEditList({ msg, answer }, { res });
    singleRowEdit({ msg, answer }, { row: res.rows[0], res });
  }
  return null;
};

const editorInteractionHandler = async (msgData, editorData, row, res, comesFromMMR) => {
  const { msg, answer } = msgData;
  const { insertedValues, required, editor } = editorData;

  const languageOfSetting = msg.language.commands.settings[msg.file.name];
  const languageOfKey = languageOfSetting.edit[required.assinger];

  const Objects = {
    options: [],
    take: [],
    page: 1,
  };

  insertedValues[required.assinger] = row[required.assinger]?.length
    ? msg.client.ch.objectClone(row[required.assinger])
    : null;

  const passObject =
    typeof editor.dataPreparation === 'function'
      ? editor.dataPreparation(msg, { insertedValues, required, Objects }, row, res)
      : { Objects };

  const selected =
    typeof editor.getSelected === 'function'
      ? editor.getSelected(msg, insertedValues, required, passObject)
      : 'noSelect';

  const embed = new Discord.MessageEmbed();
  if (required.assinger !== 'id') {
    embed
      .addField(
        '\u200b',
        `\u200b${languageOfKey.recommended ? `${languageOfKey.recommended}\n` : ''}${
          languageOfKey.desc ? languageOfKey.desc : ''
        }`,
      )
      .setTitle(msg.client.ch.stp(languageOfKey.name, { row: row || '--' }));
  } else {
    embed.addField('\u200b', `${msg.language.select.id.desc}`).setTitle(msg.language.id);
  }
  embed.setAuthor({
    name: msg.client.ch.stp(msg.lanSettings.authorEdit, {
      type: languageOfSetting.type,
    }),
    iconURL: msg.client.constants.emotes.settingsLink,
    url: msg.client.constants.standard.invite,
  });

  if (editor.requiresMenu) {
    embed.addField(msg.language.page, `\`1/${Math.ceil(Objects.options.length / 25)}\``);
  }

  if (selected !== 'noSelect') {
    embed.setDescription(
      `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
    );
  }

  await replier(
    { msg, answer },
    {
      embeds: [embed],
      rawButtons:
        typeof editor.buttons === 'function'
          ? editor.buttons(msg, passObject, insertedValues, required, row)
          : await standardButtons(msg, passObject, insertedValues, required, row, editor),
    },
  );

  let messageCollector;
  if (editor.interactionType === 'message') {
    messageCollector = msg.channel.createMessageCollector({ time: 60000 });
    messageHandler(
      { msg, messageCollector },
      { insertedValues, required, editor, passObject, row },
      { languageOfKey, languageOfSetting },
      Objects,
    );
  }

  return buttonHandler(
    { msg, row, embed, messageCollector, res },
    { insertedValues, required, editor, passObject, Objects },
    { languageOfKey, languageOfSetting },
    comesFromMMR,
  );
};

const changing = async (msgData, editData, resData) => {
  const { msg } = msgData;
  let { answer } = msgData;
  const { usedKey, comesFromMMR } = editData;
  const { row, res } = resData;

  const settings = msg.client.constants.commands.settings.edit[msg.file.name];

  if (!settings[usedKey] && usedKey === 'active') {
    settings[usedKey] = msg.client.constants.commands.settings.edit.active;
  }

  if (!settings[usedKey]) {
    throw new Error(`${usedKey} is not a defined Key in the Settings Constants Object`);
  }

  const editor = msg.client.settingsEditors.find((f) =>
    usedKey === 'active' ? f.key.includes('boolean') : f.key?.includes(settings[usedKey].key),
  );
  const language =
    usedKey === 'active' ? msg.lanSettings.active : msg.lanSettings[msg.file.name].edit[usedKey];

  const required = {
    key:
      usedKey === 'active'
        ? msg.client.constants.commands.settings.edit.active.key
        : settings[usedKey].key,
    value: language,
    assinger: usedKey,
    required:
      usedKey === 'active'
        ? msg.client.constants.commands.settings.edit.active.required
        : settings[usedKey].required,
  };

  const insertedValues = {};

  if (editor.requiresInteraction) {
    const returnedData = await editorInteractionHandler(
      { msg, answer },
      { insertedValues, required, editor },
      row,
      res,
      comesFromMMR,
    );
    if (!returnedData) return null;
    answer = returnedData.interaction;
  } else {
    await editor.execute(msg, required, insertedValues, row);
  }

  const [tableName] = msg.client.constants.commands.settings.tablenames[msg.file.name];

  if (comesFromMMR) {
    msg.client.ch.query(
      `UPDATE ${tableName} SET ${required.assinger} = $1 WHERE guildid = $2 AND uniquetimestamp = $3;`,
      [
        (insertedValues[required.assinger] && insertedValues[required.assinger].length) ||
        insertedValues[required.assinger] !== undefined
          ? insertedValues[required.assinger]
          : null,
        msg.guild.id,
        row.uniquetimestamp,
      ],
    );
  } else {
    msg.client.ch.query(`UPDATE ${tableName} SET ${required.assinger} = $1 WHERE guildid = $2;`, [
      (insertedValues[required.assinger] && insertedValues[required.assinger].length) ||
      insertedValues[required.assinger] !== undefined
        ? insertedValues[required.assinger]
        : null,
      msg.guild.id,
    ]);
  }

  log(msg, { insertedValues, required, comesFromMMR, row });

  row[usedKey] = insertedValues[usedKey];
  let embed;
  let embed2;

  if (typeof msg.file.displayEmbed === 'function') {
    const returned = msg.file.displayEmbed(msg, row);
    if (Array.isArray(returned)) {
      [embed, embed2] = returned;
    } else {
      embed = returned;
    }
  } else embed = noEmbed(msg, answer, res, comesFromMMR);

  if (embed2) return singleRowEdit({ msg, answer }, { row, res }, [embed, embed2], comesFromMMR);
  return singleRowEdit({ msg, answer }, { row, res }, embed, comesFromMMR);
};

const log = async (msg, editData) => {
  const { insertedValues, required, comesFromMMR, row } = editData;

  const oldSettings = required ? row[required.assinger] : {};
  const newSettings = required ? insertedValues[required.assinger] : {};
  const settingsName =
    required && msg.lanSettings[msg.file.name].edit[required.assinger]
      ? msg.lanSettings[msg.file.name].edit[required.assinger].name
      : 'id';
  const { type } = msg.language.commands.settings[msg.file.name];

  const embed = new Discord.MessageEmbed().setAuthor({
    name: msg.client.ch.stp(msg.language.selfLog.author, {
      type,
    }),
    iconURL: msg.client.constants.emotes.settingsLink,
    url: msg.client.constants.standard.invite,
  });

  if (comesFromMMR) {
    embed.setDescription(
      msg.client.ch.stp(msg.language.selfLog.descriptionWithID, { type, msg, id: row.id }),
    );
  } else {
    embed.setDescription(msg.client.ch.stp(msg.language.selfLog.description, { type, msg }));
  }

  embed.addField(msg.lanSettings.oldValue, `${settingsName}: ${oldSettings}`, true);
  embed.addField(msg.lanSettings.newValue, `${settingsName}: ${newSettings}`, true);

  const res = await msg.client.ch.query('SELECT settingslog FROM logchannels WHERE guildid = $1;', [
    msg.guild.id,
  ]);
  const channels = res?.rows[0]?.settingslog
    ?.map((id) =>
      typeof msg.client.channels.cache.get(id)?.send === 'function'
        ? msg.client.channels.cache.get(id)
        : null,
    )
    .filter((c) => c !== null);
  msg.client.ch.send(channels, { embeds: [embed] });
};

const buttonHandler = async (msgData, editData, languageData, comesFromMMR) => {
  const { insertedValues, required, editor, passObject, Objects } = editData;
  const { msg, row, messageCollector, res } = msgData;
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
          const returnedObject =
            typeof editor.interactionHandler === 'function'
              ? editor.interactionHandler(
                  { msg, answer: interaction },
                  passObject,
                  insertedValues,
                  required,
                  row,
                )
              : await interactionHandler(
                  { msg, answer: interaction },
                  passObject,
                  insertedValues,
                  required,
                  editor,
                  row,
                );

          if (!returnedObject) {
            buttonsCollector.stop();
            break;
          }
          embed = returnedObject.returnEmbed;

          if (required.assinger !== 'id') {
            embed
              .addField(
                '\u200b',
                `\u200b${languageOfKey.recommended ? `${languageOfKey.recommended}\n` : ''}${
                  languageOfKey.desc ? languageOfKey.desc : ''
                }`,
              )
              .setTitle(msg.client.ch.stp(languageOfKey.name, { row: row || '--' }));
          } else {
            embed.addField('\u200b', `${msg.language.select.id.desc}`).setTitle(msg.language.id);
          }
          embed.setAuthor({
            name: msg.client.ch.stp(msg.lanSettings.authorEdit, {
              type: languageOfSetting.type,
            }),
            iconURL: msg.client.constants.emotes.settingsLink,
            url: msg.client.constants.standard.invite,
          });

          if (editor.requiresMenu) {
            embed.addField(msg.language.page, `\`1/${Math.ceil(Objects.options.length / 25)}\``);
          }

          await replier(
            { msg, answer: interaction },
            {
              rawButtons:
                typeof editor.buttons === 'function'
                  ? editor.buttons(msg, passObject, insertedValues, required, row)
                  : await standardButtons(msg, passObject, insertedValues, required, row, editor),
              embeds: [embed],
            },
          );
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

          if (editor.requiresMenu) {
            embed.addField(
              msg.language.page,
              `\`${passObject.Objects.page}/${Math.ceil(passObject.Objects.options.length / 25)}\``,
            );
          }

          for (
            let j = indexLast + 1;
            j < indexLast + 26 && j < passObject.Objects.options.length;
            j += 1
          ) {
            passObject.Objects.take.push(passObject.Objects.options[j]);
          }

          await replier(
            { msg, answer: interaction },
            {
              rawButtons:
                typeof editor.buttons === 'function'
                  ? editor.buttons(msg, passObject, insertedValues, required, row)
                  : await standardButtons(msg, passObject, insertedValues, required, row, editor),
              embeds: [embed],
            },
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

          if (editor.requiresMenu) {
            embed.addField(
              msg.language.page,
              `\`${passObject.Objects.page}/${Math.ceil(passObject.Objects.options.length / 25)}\``,
            );
          }

          for (
            let j = indexFirst - 25;
            j < indexFirst && j < passObject.Objects.options.length;
            j += 1
          ) {
            passObject.Objects.take.push(passObject.Objects.options[j]);
          }

          await replier(
            { msg, answer: interaction },
            {
              rawButtons:
                typeof editor.buttons === 'function'
                  ? editor.buttons(msg, passObject, insertedValues, required, row)
                  : await standardButtons(msg, passObject, insertedValues, required, row, editor),
              embeds: [embed],
            },
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
        msg.m.reactions.removeAll().catch(() => {});
        resolve(null);
      }
    });

    reactionHandler({ msg }, buttonsCollector, {
      needsReturn: true,
      isInEdit: true,
      removeReact: false,
    }).then((returned) => {
      if (messageCollector) messageCollector.stop();

      if (returned.isInEdit) {
        reassignMsg(
          `${msg.client.constants.standard.prefix}${module.exports.name} ${msg.file.name} ${msg.language.edit}`,
          msg,
        );
      }

      if (!comesFromMMR) {
        if (returned) whereToGo(msg);
      } else if (returned) singleRowEdit({ msg }, { res, row }, null, comesFromMMR);

      resolve(null);
    });
  });
};

const messageHandler = async (msgData, editData, languageData, Objects) => {
  const { insertedValues, required, editor, passObject, row } = editData;
  const { msg, messageCollector } = msgData;
  const { languageOfKey, languageOfSetting } = languageData;

  messageCollector.on('collect', async (message) => {
    if (message.author.id !== msg.author.id) return null;
    messageCollector.resetTimer();
    message.delete().catch(() => {});
    const { returnEmbed } = editor.messageHandler({ msg, message }, insertedValues, required);

    returnEmbed
      .addField(
        '\u200b',
        `${languageOfKey.recommended ? `${languageOfKey.recommended}\n` : ''}${
          languageOfKey.desc ? languageOfKey.desc : ''
        }`,
      )
      .setTitle(msg.client.ch.stp(languageOfKey.name, { row: row || '--' }))
      .setAuthor({
        name: msg.client.ch.stp(msg.lanSettings.authorEdit, {
          type: languageOfSetting.type,
        }),
        iconURL: msg.client.constants.emotes.settingsLink,
        url: msg.client.constants.standard.invite,
      });

    if (editor.requiresMenu) {
      returnEmbed.addField(msg.language.page, `\`1/${Math.ceil(Objects.options.length / 25)}\``);
    }

    return replier(
      { msg },
      {
        rawButtons:
          typeof editor.buttons === 'function'
            ? editor.buttons(msg, passObject, insertedValues, required, row)
            : await standardButtons(msg, passObject, insertedValues, required, row, editor),
        embeds: [returnEmbed],
      },
    );
  });
};

const interactionHandler = async (msgData, preparedData, insertedValues, required, editor, row) => {
  const { msg, answer } = msgData;
  const { Objects } = preparedData;

  if (answer.values && Array.isArray(insertedValues[required.assinger])) {
    answer.values.forEach((value) => {
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
    let isString;
    if (
      (!row.length && required.assinger !== 'id') ||
      (required.assinger !== 'id' && Object.keys(row).includes(required.assinger))
    ) {
      const typeRes = await msg.client.ch.query(
        `SELECT pg_typeof(${required.assinger}) FROM ${
          msg.client.constants.commands.settings.tablenames[msg.file.name][0]
        } LIMIT 1;`,
      );
      if (typeRes && typeRes.rowCount > 0) {
        isString = !typeRes.rows[0].pg_typeof.endsWith('[]');
      }
    } else {
      isString = true;
    }
    if (answer.values) {
      insertedValues[required.assinger] = isString ? answer.values[0] : answer.values;
    }
  }

  const selected =
    typeof editor.getSelected === 'function'
      ? editor.getSelected(msg, insertedValues, required, preparedData)
      : 'noSelect';

  const returnEmbed = new Discord.MessageEmbed().setDescription(
    `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
  );

  Objects.options.forEach((option) => {
    if (insertedValues[required.assinger]?.includes(option.value)) {
      option.emoji = msg.client.constants.emotes.minusBGID;
    } else {
      option.emoji = msg.client.constants.emotes.plusBGID;
    }
  });

  return { returnEmbed };
};

const standardButtons = async (msg, preparedData, insertedValues, required, row, editor) => {
  const { Objects } = preparedData;
  const returnedButtons = [];

  let doneDisabled = false;
  let isString = true;

  if (required.assinger !== 'id' && Object.keys(row).includes(required.assinger)) {
    const typeRes = await msg.client.ch.query(
      `SELECT pg_typeof(${required.assinger}) FROM ${
        msg.client.constants.commands.settings.tablenames[msg.file.name][0]
      } LIMIT 1;`,
    );
    if (typeRes && typeRes.rowCount > 0) {
      isString = !typeRes.rows[0].pg_typeof.endsWith('[]');
    }
  } else {
    isString = true;
  }

  if (!isString) {
    doneDisabled =
      msg.client.ch.arrayEquals(insertedValues[required.assinger], row[required.assinger]) ||
      (insertedValues[required.assinger] &&
        !insertedValues[required.assinger].length &&
        required.required);
  } else {
    doneDisabled =
      !insertedValues[required.assinger] || insertedValues[required.assinger] === msg.language.none;
  }

  if (editor.requiresMenu) {
    const getMany = required.key.endsWith('s');

    const menu = new Discord.MessageSelectMenu()
      .setCustomId(required.key)
      .addOptions(Objects.take)
      .setMinValues(1)
      .setMaxValues(getMany ? Objects.take.length : 1)
      .setPlaceholder(msg.language.select[required.key].select);
    const next = new Discord.MessageButton()
      .setCustomId('next')
      .setLabel(msg.language.next)
      .setDisabled(Objects.page === Math.ceil(Objects.options.length / 25))
      .setStyle('SUCCESS');
    const prev = new Discord.MessageButton()
      .setCustomId('prev')
      .setLabel(msg.language.prev)
      .setDisabled(Objects.page === 1)
      .setStyle('DANGER');

    returnedButtons.push([menu], [prev, next]);
  }

  const done = new Discord.MessageButton()
    .setCustomId('done')
    .setLabel(msg.language.done)
    .setDisabled(doneDisabled)
    .setStyle('PRIMARY');

  returnedButtons.push([done]);

  return returnedButtons;
};

const setup = async (msg, answer) => {
  const lan = msg.language.commands.settings.setup;

  const embed = new Discord.MessageEmbed()
    .setAuthor({
      name: lan.author,
      url: msg.client.constants.standard.invite,
    })
    .setDescription(msg.client.ch.stp(lan.question, { type: msg.lanSettings[msg.file.name].type }));

  const yes = new Discord.MessageButton()
    .setLabel(msg.language.Yes)
    .setCustomId('yes')
    .setStyle('SUCCESS');
  const no = new Discord.MessageButton()
    .setLabel(msg.language.No)
    .setCustomId('no')
    .setStyle('DANGER');

  await replier({ msg, answer }, { rawButtons: [[yes, no]], embeds: [embed] });

  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  buttonsCollector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) return msg.client.ch.notYours(interaction, msg);
    switch (interaction.customId) {
      default: {
        return null;
      }
      case 'yes': {
        buttonsCollector.stop();
        const settingsConst = msg.client.constants.commands.settings.setupQueries[msg.file.name];

        const promises = msg.client.constants.commands.settings.tablenames[msg.file.name].map(
          (query, i) => {
            const assingers = settingsConst.cols[i].split(/, +/).map((q, j) => `$${j + 1}`);
            const values = settingsConst.vals[i].map((val) => msg.client.ch.stp(`${val}`, { msg }));

            return msg.client.ch.query(
              `INSERT INTO ${
                msg.client.constants.commands.settings.tablenames[msg.file.name][i]
              } (${settingsConst.cols[i]}) VALUES (${assingers});`,
              values,
            );
          },
        );

        await Promise.all(promises);

        whereToGo(msg, interaction);
        break;
      }
      case 'no': {
        buttonsCollector.stop();
        const abort = new Discord.MessageEmbed()
          .setAuthor({
            name: lan.author,
            url: msg.client.constants.standard.invite,
          })
          .setDescription(lan.abort);
        return replier({ msg, answer: interaction }, { embeds: [abort] });
      }
    }
    return null;
  });
  buttonsCollector.on('end', (collected, reason) => {
    if (reason === 'time') {
      msg.client.ch.collectorEnd(msg);
      msg.m.reactions.removeAll().catch(() => {});
    }
  });
};

const categoryDisplay = async (msg, answer, needsBack) => {
  let categoryText = '';
  const categories = [];
  const options = [];
  const settings = msg.client.settings.filter((setting) => setting.folder === msg.args[0]);

  settings.forEach((setting) => {
    setting.category.forEach((category) => {
      if (!categories.includes(category)) categories.push(category);
    });
  });

  categories.forEach((category) => {
    const settingCategories = [];
    settings.forEach((s) => {
      if (s.category.includes(category)) {
        settingCategories.push(s.name);
        options.push({ label: s.name, value: s.name });
      }
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

      const index = options.findIndex((o) => o.value === settingsFile.name);
      options[index].emoji = type;
      options[index].description = category;
    }

    categoryText += `__${category}__:\n${msg.client.ch.makeCodeBlock(
      `${settingCategories.map((s) => `${s}`)}`.replace(/,/g, ''),
    )}\n`;
  });

  const embed = new Discord.MessageEmbed()
    .setAuthor({
      name: msg.client.ch.stp(msg.language.commands.settings.author, {
        type: msg.language.commands.settings[settings.first().name].type,
      }),
      iconURL: msg.client.constants.emotes.settingsLink,
      url: msg.client.constants.standard.invite,
    })
    .setDescription(
      msg.client.ch.stp(msg.language.commands.settings.settings.desc, {
        prefix: msg.client.constants.standard.prefix,
        commands: categoryText,
      }),
    );

  const rawButtons = [
    new Discord.MessageSelectMenu()
      .addOptions(options)
      .setCustomId('menu')
      .setMaxValues(1)
      .setMinValues(1)
      .setPlaceholder(msg.language.commands.settings.menu.placeholder),
  ];

  await replier({ msg, answer }, { embeds: [embed], rawButtons });
  categoryMenuHandler({ msg, answer }, needsBack);
};

const categoryMenuHandler = async ({ msg, answer }, needsBack) => {
  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });

  buttonsCollector.on('collect', (interaction) => {
    if (interaction.user.id !== msg.author.id) return msg.client.ch.notYours(interaction, msg);
    reassignMsg(
      `${msg.client.constants.standard.prefix}${module.exports.name} ${interaction.values[0]}`,
      msg,
    );

    buttonsCollector.stop();
    return module.exports.execute(msg, interaction);
  });

  buttonsCollector.on('end', (collected, reason) => {
    if (reason === 'time') {
      msg.client.ch.collectorEnd(msg);
      msg.m.reactions.removeAll().catch(() => {});
    }
  });

  if (needsBack) {
    reactionHandler({ msg, answer }, buttonsCollector, { needsReturn: false });
  }
};

const reassignMsg = (newContent, msg) => {
  msg.content = `${newContent}`;
  msg.args = msg.content.replace(new RegExp('\\n', 'g'), ' ').split(/ +/);

  msg.args.shift();
};

const reactionHandler = ({ msg, answer }, buttonsCollector, byData) => {
  let needsReturn;
  let sendTo;
  let isInEdit;
  let removeReact;

  if (byData) {
    needsReturn = byData.needsReturn;
    sendTo = byData.sendTo;
    isInEdit = byData.isInEdit;
    removeReact = byData.removeReact;
  }

  if (!msg.m.reactions.cache.get(msg.client.constants.emotes.back)?.me) {
    msg.m.react(msg.client.constants.emotes.back).catch(() => {});
  }
  const reactionsCollector = msg.m.createReactionCollector({
    time: 60000,
  });

  return new Promise((resolve) => {
    reactionsCollector.on('collect', (reaction, user) => {
      if (user.id !== msg.author.id && user.id !== msg.client.user.id) {
        return reaction.users.remove(user.id);
      }

      if (user.id === msg.client.user.id) return null;

      if (reaction.emoji.name === msg.client.constants.emotes.back) {
        if (buttonsCollector) buttonsCollector.stop();
        reactionsCollector.stop();

        resolve({ isInEdit });

        if (needsReturn) {
          if (removeReact) msg.m.reactions.removeAll().catch(() => {});
          else reaction.users.remove(user.id);
          return null;
        }

        if (sendTo) {
          if (Array.isArray(sendTo)) {
            const [, folder] = sendTo;

            reassignMsg(
              `${msg.client.constants.standard.prefix}${module.exports.name} ${folder}`,
              msg,
            );
            msg.file = undefined;
            reaction.users.remove(user.id);
            module.exports.execute(msg, answer);
            return null;
          }

          switch (sendTo) {
            default: {
              reassignMsg(`${msg.client.constants.standard.prefix}${module.exports.name}`, msg);
              msg.m.reactions.removeAll().catch(() => {});
              module.exports.execute(msg, answer);
              return null;
            }
          }
        }

        if (msg.file && msg.file.folder) {
          reassignMsg(
            `${msg.client.constants.standard.prefix}${module.exports.name} ${msg.file.folder}`,
            msg,
          );
          msg.file = undefined;
          reaction.users.remove(user.id);
          module.exports.execute(msg, answer);
        } else {
          reassignMsg(`${msg.client.constants.standard.prefix}${module.exports.name}`, msg);
          msg.m.reactions.removeAll().catch(() => {});
          module.exports.execute(msg, answer);
        }
      }
      return null;
    });

    reactionsCollector.on('remove', (reaction, user) => {
      if (user.id === msg.author.id) {
        reactionsCollector.stop();
        resolve();
      }
    });

    if (buttonsCollector) {
      buttonsCollector.on('end', () => {
        reactionsCollector.stop();
      });
    }
  });
};
