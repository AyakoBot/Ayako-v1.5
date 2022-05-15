const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
  name: 'settings',
  perm: null,
  dm: false,
  takesFirstArg: false,
  aliases: ['s'],
  type: 'util',
  async execute(msg, answer) {
    const options = [];

    if (!msg.args[0]) {
      let categoryText = '';
      const categories = [];
      getAllSettings().forEach((setting) => {
        setting.category.forEach((category) => {
          if (!categories.includes(category)) categories.push(category);
        });
      });

      categories.forEach((category) => {
        const settingCategories = [];
        getAllSettings()
          .filter((s) => s.display !== false)
          .forEach((s) => {
            if (s.category.includes(category)) {
              if (s.folder && !!settingCategories.findIndex((a) => a.folder === s.folder)) {
                if (msg.client.constants.commands.settings.baseSettings[s.folder] === s.name) {
                  options.push(
                    new Builders.UnsafeSelectMenuOptionBuilder()
                      .setLabel(s.folder)
                      .setValue(s.folder),
                  );
                  settingCategories.push(s.folder);
                }
              } else if (!options.find((o) => o.data.label === s.name) && (!s.childOf || s.main)) {
                options.push(
                  new Builders.UnsafeSelectMenuOptionBuilder().setLabel(s.name).setValue(s.name),
                );
                settingCategories.push(s.name);
              }
            }
          });

        for (let i = 0; i < settingCategories.length; i += 1) {
          let settingsFile = getSetting(settingCategories[i]);
          if (!settingsFile) {
            settingsFile = getSetting(
              msg.client.constants.commands.settings.baseSettings[settingCategories[i]],
            );
          }

          let textType;
          let objectType;
          if (settingsFile.type) {
            switch (settingsFile.type) {
              case 1: {
                objectType = msg.client.objectEmotes.yellow;
                textType = msg.client.textEmotes.yellow;
                break;
              }
              case 2: {
                objectType = msg.client.objectEmotes.red;
                textType = msg.client.textEmotes.red;
                break;
              }
              case 3: {
                objectType = msg.client.objectEmotes.blue;
                textType = msg.client.textEmotes.blue;
                break;
              }
              case 4: {
                objectType = msg.client.objectEmotes.green;
                textType = msg.client.textEmotes.green;
                break;
              }
              default: {
                objectType = msg.client.objectEmotes.blue;
                textType = msg.client.textEmotes.blue;
                break;
              }
            }
          } else {
            objectType = msg.client.objectEmotes.blue;
            textType = msg.client.textEmotes.blue;
          }

          const index = options.findIndex((o) => o.data.value === settingsFile.name);
          if (options[index]) {
            options[index].setEmoji(objectType);
            options[index].setDescription(category);
          } else {
            const ind = options.findIndex((o) => o.data.value === settingsFile.folder);
            options[ind].setEmoji(msg.client.objectEmotes.folder);
          }

          settingCategories[i] = `${textType}${settingCategories[i]} `;
          settingCategories[i] += new Array(22 - settingCategories[i].length).join(' ');
        }

        categoryText += `__${msg.lan.categories[category]}__:\n${msg.client.ch.makeCodeBlock(
          `${settingCategories.map((s) => `${s}`)}`.replace(/,/g, ''),
        )}\n`;
      });

      const rawButtons = [
        new Builders.UnsafeSelectMenuBuilder()
          .addOptions(...options)
          .setCustomId('menu')
          .setMaxValues(1)
          .setMinValues(1)
          .setPlaceholder(msg.language.commands.settings.menu.placeholder),
      ];

      const embed = new Builders.UnsafeEmbedBuilder()
        .setAuthor({
          name: msg.language.commands.settings.noEmbed.author,
          iconURL: msg.client.objectEmotes.settings.link,
          url: msg.client.constants.standard.invite,
        })
        .setDescription(
          msg.client.ch.stp(msg.language.commands.settings.settings.desc, {
            prefix: msg.client.constants.standard.prefix,
            commands: categoryText,
          }),
        );

      await replier({ msg, answer }, { embeds: [embed], rawButtons }, 1);
      categoryMenuHandler({ msg, answer }, false);
    } else {
      let settingsFile = getSetting(msg.args[0].toLowerCase());

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
        settingsFile = require('./Settings/Categories/overview');
        settingsFile.name = 'overview';
      }

      msg.file = settingsFile;
      msg.lan = msg.language.commands.settings[settingsFile.name];
      msg.lanSettings = msg.language.commands.settings;

      whereToGo(msg, answer);
    }
    return null;
  },
  async display(msgData, possibleRow, possibleRes) {
    const { msg } = msgData;

    const singleRowDisplay = async (res, row, answer, comesFromMMR) => {
      let embed;
      let embed2;

      if (typeof msg.file.displayEmbed === 'function') {
        const returned = await msg.file.displayEmbed(msg, row);
        if (Array.isArray(returned)) {
          [embed, embed2] = returned;
        } else {
          embed = returned;
        }
      } else embed = noEmbed(msg, answer, res, comesFromMMR);

      embed.setAuthor({
        name: msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
        iconURL: msg.client.objectEmotes.settings.link,
        url: msg.client.constants.standard.invite,
      });

      const components = [
        [
          new Builders.UnsafeButtonBuilder()
            .setCustomId('edit')
            .setStyle(Discord.ButtonStyle.Primary)
            .setLabel(msg.language.Edit),
        ],
      ];

      if (msg.file.childOf) {
        components.unshift(getRelatedSettingsButtons(msg));
      }

      if (
        msg.file.perm &&
        !msg.member.permissions.has(new Discord.PermissionsBitField(msg.file.perm)) &&
        msg.author.id !== '318453143476371456'
      ) {
        if (embed2) return replier({ msg, answer }, { embeds: [embed2, embed] }, 2);
        return replier({ msg, answer }, { embeds: [embed] }, 3);
      }

      if (embed2) {
        await replier({ msg, answer }, { embeds: [embed2, embed], rawButtons: components }, 4);
      } else await replier({ msg, answer }, { embeds: [embed], rawButtons: components }, 5);
      if (!msg.m) return null;

      const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
      buttonsCollector.on('collect', (interaction) => {
        if (interaction.user.id === msg.author.id) {
          if (interaction.customId === 'edit') {
            buttonsCollector.stop();
            singleRowEdit({ msg, answer: interaction }, { row, res }, embed, comesFromMMR);
          } else if (
            msg.client.constants.commands.settings.childSettings[msg.file.childOf] &&
            msg.client.constants.commands.settings.childSettings[msg.file.childOf].includes(
              interaction.customId,
            )
          ) {
            buttonsCollector.stop();
            reassignMsg(
              `${msg.client.constants.standard.prefix}${module.exports.name} ${
                interaction.customId
              } notedit ${
                row[msg.client.constants.commands.settings.identifiers[msg.file.childOf]]
              }`,
              msg,
              1,
            );

            msg.file = getSetting(interaction.customId);
            msg.lan = msg.language.commands.settings[msg.file.name];

            whereToGo(msg, interaction);
          }
        } else msg.client.ch.notYours(interaction);
      });
      buttonsCollector.on('end', (collected, reason) => {
        if (reason === 'time') {
          msg.client.ch.edit(msg.m, { embeds: [embed], components: [] });
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

      let res;
      if (msg.file.manualResGetter) {
        res = await msg.file.manualResGetter(msg);
      } else {
        res = await msg.client.ch.query(
          `SELECT * FROM ${
            msg.client.constants.commands.settings.tablenames[msg.file.name][0]
          } WHERE guildid = $1 ORDER BY uniquetimestamp ASC;`,
          [msg.guild.id],
        );
      }

      let embed = new Builders.UnsafeEmbedBuilder();

      if (res && res.rowCount > 0) {
        if (!res.rows[0].id) {
          res.rows.forEach((row, i) => {
            res.rows[i].id = i;
          });
        }

        if (msg.file.mmrEmbed[Symbol.toStringTag] === 'AsyncFunction') {
          embed = await msg.file.mmrEmbed(msg, res && res.rows ? res.rows : []);
        } else if (typeof msg.file.mmrEmbed === 'function') {
          embed = msg.file.mmrEmbed(msg, res && res.rows ? res.rows : []);
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
        iconURL: msg.client.objectEmotes.settings.link,
        url: msg.client.constants.standard.invite,
      });

      const settingsConstant = msg.client.constants.commands.settings.setupQueries[msg.file.name];
      const options = {
        allOptions: [],
        take: [],
        page: 1,
      };

      res?.rows?.forEach((row) => {
        const isEmote = msg.client.emojis.cache.get(getIdentifier(msg, settingsConstant, row));

        options.allOptions.push(
          new Builders.UnsafeSelectMenuOptionBuilder()
            .setLabel(
              `${row.id} ${
                settingsConstant.removeIdent !== ''
                  ? `| ${isEmote ? '' : getIdentifier(msg, settingsConstant, row)}`
                  : ''
              }`.slice(0, 100),
            )
            .setValue(String(row.id))
            .setEmoji(isEmote),
        );
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
        msg.member.permissions.has(new Discord.PermissionsBitField(msg.file.perm)) ||
        msg.author.id === '318453143476371456'
      ) {
        rows.push([edit]);
      }

      if (msg.file.childOf && !msg.file.displayParentOnly) {
        rows.unshift(getRelatedSettingsButtons(msg));
      }

      await replier({ msg, answer }, { rawButtons: rows, embeds: [embed] }, 6);
      if (!msg.m) return;

      const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
      reactionHandler({ msg, answer }, buttonsCollector);

      buttonsCollector.on('collect', async (interaction) => {
        if (interaction.user.id !== msg.author.id) {
          return msg.client.ch.notYours(interaction);
        }
        switch (interaction.customId) {
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
          default: {
            if (
              msg.client.constants.commands.settings.childSettings[msg.file.childOf] &&
              msg.client.constants.commands.settings.childSettings[msg.file.childOf].includes(
                interaction.customId,
              )
            ) {
              buttonsCollector.stop();
              reassignMsg(
                `${msg.client.constants.standard.prefix}${module.exports.name} ${
                  interaction.customId
                } ${msg.args[1] ? msg.args[1] : ''} ${msg.args[2] ? msg.args[2] : ''}`,
                msg,
                2,
              );

              msg.file = getSetting(interaction.customId);
              msg.lan = msg.language.commands.settings[msg.file.name];
              return whereToGo(msg, interaction);
            }
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

    if (
      msg.file.setupRequired === false &&
      msg.args[2] ===
        (possibleRow
          ? possibleRow[msg.client.constants.commands.settings.identifiers[msg.file.childOf]]
          : null) &&
      !msg.file.canBe1Row
    ) {
      singleRowDisplay(possibleRes, possibleRow);
    } else if (msg.file.setupRequired === false) {
      return mmrDisplay(msgData.answer, possibleRes, possibleRow);
    }

    let res;
    if (msg.file.manualResGetter) {
      res = await msg.file.manualResGetter(msg);
    } else {
      res = await msg.client.ch.query(
        `SELECT * FROM ${
          msg.client.constants.commands.settings.tablenames[msg.file.name][0]
        } WHERE guildid = $1;`,
        [msg.guild.id],
      );
    }

    if (res && res.rowCount > 0) return singleRowDisplay(res, res.rows[0], msgData.answer);
    return noEmbed(msg, msgData.answer, res, false);
  },
};

const noEmbed = async (msg, answer, res) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: msg.language.commands.settings.noEmbed.author,
    })
    .setDescription(
      msg.client.ch.stp(msg.language.commands.settings.noEmbed.desc, {
        prefix: msg.client.constants.standard.prefix,
        name: msg.file.name,
      }),
    );

  let rawButtons = [
    [
      new Builders.UnsafeButtonBuilder()
        .setCustomId('edit')
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel(msg.language.Edit),
    ],
  ];

  if (msg.file.childOf && !msg.file.displayParentOnly) {
    rawButtons.unshift(getRelatedSettingsButtons(msg));
  }

  if (
    msg.file.perm &&
    !msg.member.permissions.has(new Discord.PermissionsBitField(msg.file.perm)) &&
    msg.author.id !== '318453143476371456'
  ) {
    rawButtons = [];
  }

  await replier({ msg, answer }, { embeds: [embed], rawButtons }, 7);
  if (!msg.m) return;

  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  reactionHandler({ msg, answer }, buttonsCollector);

  buttonsCollector.on('collect', (interaction) => {
    if (interaction.user.id !== msg.author.id) return msg.client.ch.notYours(interaction);
    buttonsCollector.stop();

    if (interaction.customId === 'edit') {
      if (msg.file.setupRequired === false) {
        return mmrEditList({ msg, answer: interaction }, { res, embed });
      }
    } else if (
      msg.client.constants.commands.settings.childSettings[msg.file.childOf] &&
      msg.client.constants.commands.settings.childSettings[msg.file.childOf].includes(
        interaction.customId,
      )
    ) {
      reassignMsg(
        `${msg.client.constants.standard.prefix}${module.exports.name} ${interaction.customId} noedit ${msg.args[2]}`,
        msg,
        3,
      );

      msg.file = getSetting(interaction.customId);
      msg.lan = msg.language.commands.settings[msg.file.name];
      return whereToGo(msg, interaction);
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
// eslint-disable-next-line no-unused-vars
const replier = async (msgData, sendData, originNumber) => {
  // console.log('replied', originNumber);
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
    await msg.client.ch.edit(answer, {
      embeds,
      components: buttons,
    });
  } else if (msg.m) {
    await msg.client.ch.edit(msg.m, {
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
  const next = new Builders.UnsafeButtonBuilder()
    .setCustomId('next')
    .setEmoji(msg.client.objectEmotes.forth)
    .setDisabled(options.allOptions.length < 25)
    .setStyle(Discord.ButtonStyle.Primary);
  const prev = new Builders.UnsafeButtonBuilder()
    .setCustomId('prev')
    .setEmoji(msg.client.objectEmotes.back)
    .setDisabled(true)
    .setStyle(Discord.ButtonStyle.Danger);
  const list = new Builders.UnsafeSelectMenuBuilder()
    .setCustomId('list')
    .setDisabled(!options.allOptions.length)
    .setMaxValues(1)
    .setMinValues(1)
    .setPlaceholder(msg.language.select.id.select)
    .setOptions(
      ...(options.take.length
        ? options.take
        : [new Builders.SelectMenuOptionBuilder().setLabel('--').setValue('0')]),
    );

  if (editView) {
    const add = new Builders.UnsafeButtonBuilder()
      .setCustomId('add')
      .setStyle(Discord.ButtonStyle.Primary)
      .setLabel(msg.language.add);
    const remove = new Builders.UnsafeButtonBuilder()
      .setCustomId('remove')
      .setStyle(Discord.ButtonStyle.Danger)
      .setLabel(msg.language.remove)
      .setDisabled(!options.allOptions.length);

    return { next, prev, list, add, remove };
  }
  if (!editView) {
    const edit = new Builders.UnsafeButtonBuilder()
      .setCustomId('edit')
      .setStyle(Discord.ButtonStyle.Primary)
      .setLabel(msg.language.Edit);

    return { next, prev, edit, list };
  }

  return null;
};

const getIdentifier = (msg, settingsConstant, row) => {
  let identifier;

  switch (settingsConstant.identType) {
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
    default: {
      identifier = row[settingsConstant.ident] ? row[settingsConstant.ident] : '--';
      break;
    }
  }

  return identifier;
};

const mmrEditList = async (msgData, sendData) => {
  const { msg } = msgData;
  const { res } = sendData;

  if (res && res.rowCount && !res.rows[0].id) {
    res?.rows?.forEach((row, i) => {
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

    const editor = getAllEditors().find((f) => f.key.includes(required.key));
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
    const row = res?.rows?.find((f) => f.id === Number(values.id));
    values.uniquetimestamp = row.uniquetimestamp;

    const table = msg.client.constants.commands.settings.tablenames[msg.file.name][0];

    await msg.client.ch.query(`DELETE FROM ${table} WHERE uniquetimestamp = $1;`, [
      values.uniquetimestamp,
    ]);

    log(msg, { insertedValues: values, required, comesFromMMR: true, row }, 'del');
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

    const editor = getAllEditors().find((f) => f.key.includes(required.key));
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

    const embed = new Builders.UnsafeEmbedBuilder().setAuthor({
      name: addLanguage.name,
      iconURL: msg.client.objectEmotes.settings.link,
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
    insertedValues.id = Number(res?.rows?.length) + 1 || 1;
    insertedValues.guildid = msg.guild.id;
    insertedValues[msg.client.constants.commands.settings.identifiers[msg.file.childOf]] =
      row[msg.client.constants.commands.settings.identifiers[msg.file.childOf]] ||
      msg.args[2] ||
      insertedValues[msg.client.constants.commands.settings.identifiers[msg.file.childOf]];

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
        log(msg, { insertedValues, row }, 'add');
      }
    });

    await Promise.all(promises);

    module.exports.execute(msg, repeaterDone);
  };

  const { answer } = msgData;
  let { embed } = sendData;

  if (!embed) {
    embed = await msg.file.mmrEmbed(msg, res && res.rows ? res.rows : []);
  }

  embed
    .setDescription(
      `${msg.file.tutorial ? `[${msg.lanSettings.tutorial}](${msg.file.tutorial})\n` : ''}${
        msg.lanSettings.mmrEditList
      }`,
    )
    .setAuthor({
      name: msg.client.ch.stp(msg.lanSettings.authorEdit, {
        type: msg.lanSettings[msg.file.name].type,
      }),
      iconURL: msg.client.objectEmotes.settings.link,
      url: msg.client.constants.standard.invite,
    });

  const options = {
    allOptions: [],
    take: [],
    page: 1,
  };
  const settingsConstant = msg.client.constants.commands.settings.setupQueries[msg.file.name];

  res?.rows?.forEach((row) => {
    const isEmote = msg.client.emojis.cache.get(getIdentifier(msg, settingsConstant, row));

    options.allOptions.push(
      new Builders.UnsafeSelectMenuOptionBuilder()
        .setLabel(
          `${row.id} ${
            settingsConstant.removeIdent !== ''
              ? `| ${isEmote ? '' : getIdentifier(msg, settingsConstant, row)}`
              : ''
          }`.slice(0, 100),
        )
        .setValue(String(row.id))
        .setEmoji(isEmote),
    );
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

  if (msg.file.childOf && !msg.file.displayParentOnly) {
    rows.unshift(getRelatedSettingsButtons(msg));
  }

  await replier({ msg, answer }, { rawButtons: rows, embeds: [embed] }, 8);
  if (!msg.m) return;

  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  buttonsCollector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) return msg.client.ch.notYours(interaction);
    switch (interaction.customId) {
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
        const row = res?.rows?.find((r) => r.id === Number(interaction.values[0]));

        singleRowEdit({ msg, answer: interaction }, { row, res }, null, true);
        buttonsCollector.stop();
        break;
      }
      default: {
        if (
          msg.client.constants.commands.settings.childSettings[msg.file.childOf] &&
          msg.client.constants.commands.settings.childSettings[msg.file.childOf].includes(
            interaction.customId,
          )
        ) {
          buttonsCollector.stop();
          reassignMsg(
            `${msg.client.constants.standard.prefix}${module.exports.name} ${interaction.customId} edit ${msg.args[2]}`,
            msg,
            4,
          );

          msg.file = getSetting(interaction.customId);
          msg.lan = msg.language.commands.settings[msg.file.name];
          return whereToGo(msg, interaction);
        }
        return null;
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
      const returned = await msg.file.displayEmbed(msg, row);
      if (Array.isArray(returned)) {
        [embed, embed2] = returned;
      } else {
        embed = returned;
      }
    } else embed = noEmbed(msg, answer, res, comesFromMMR);
  }

  const rawButtons = await msg.file.buttons(msg, row);

  if (msg.file.childOf) {
    rawButtons.unshift(getRelatedSettingsButtons(msg));
  }

  embed.setAuthor({
    name: msg.client.ch.stp(msg.lanSettings.authorEdit, {
      type: msg.lanSettings[msg.file.name].type,
    }),
    iconURL: msg.client.objectEmotes.settings.link,
    url: msg.client.constants.standard.invite,
  });

  if (
    msg.file.tutorial &&
    (msg.file.setupRequired || typeof msg.file.setupRequired !== 'boolean')
  ) {
    embed.setDescription(
      `[${msg.file.tutorialNote ? msg.lan.tutorialNote : msg.lanSettings.tutorial}](${
        msg.file.tutorial
      })`,
    );
  }

  if (embed2) await replier({ msg, answer }, { embeds: [embed2, embed], rawButtons }, 9);
  else await replier({ msg, answer }, { rawButtons, embeds: [embed] }, 10);
  if (!msg.m) return null;

  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  buttonsCollector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) {
      return msg.client.ch.notYours(interaction);
    }

    if (
      msg.client.constants.commands.settings.childSettings[msg.file.childOf] &&
      msg.client.constants.commands.settings.childSettings[msg.file.childOf].includes(
        interaction.customId,
      )
    ) {
      buttonsCollector.stop();
      reassignMsg(
        `${msg.client.constants.standard.prefix}${module.exports.name} ${
          interaction.customId
        } edit ${row[msg.client.constants.commands.settings.identifiers[msg.file.childOf]]}`,
        msg,
        5,
      );

      msg.file = getSetting(interaction.customId);
      msg.lan = msg.language.commands.settings[msg.file.name];
      return whereToGo(msg, interaction);
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
  let res;
  if (msg.args[2]) {
    res = await getResRows(msg);
  }

  if (!msg.args[1] || msg.args[1].toLowerCase() !== msg.language.edit) {
    module.exports.display(
      { msg, answer },
      res?.rows && res?.rows?.length === 1 ? res.rows[0] : null,
      res,
    );
  } else if (
    msg.args[1].toLowerCase() === msg.language.edit &&
    msg.file.perm &&
    !msg.member.permissions.has(new Discord.PermissionsBitField(msg.file.perm)) &&
    msg.author.id !== '318453143476371456'
  ) {
    return msg.client.ch.reply(msg, {
      content: msg.language.commands.commandHandler.missingPermissions,
      components: [],
    });
  } else if (msg.args[1].toLowerCase() === msg.language.edit) {
    let row = res?.rows?.length === 1 ? res.rows[0] : null;
    if (!row) {
      if (msg.file.manualResGetter) {
        res = await msg.file.manualResGetter(msg);
      } else {
        res = await msg.client.ch.query(
          `SELECT * FROM ${
            msg.client.constants.commands.settings.tablenames[msg.file.name][0]
          } WHERE guildid = $1;`,
          [msg.guild.id],
        );
      }

      if (res && res.rowCount) [row] = res.rows;
    }

    const possibleRow = res?.rows && res?.rows?.length === 1 ? res.rows[0] : null;
    if (
      msg.file.setupRequired === false &&
      msg.args[2] ===
        (possibleRow
          ? possibleRow[msg.client.constants.commands.settings.identifiers[msg.file.childOf]]
          : null) &&
      !msg.file.canBe1Row
    ) {
      return singleRowEdit({ msg, answer }, { row, res });
    }

    if (msg.file.setupRequired === false) {
      return mmrEditList({ msg, answer }, { res });
    }

    singleRowEdit({ msg, answer }, { row, res });
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

  if (Array.isArray(row[required.assinger])) {
    insertedValues[required.assinger] = row[required.assinger]?.length
      ? msg.client.ch.objectClone(row[required.assinger])
      : [];
  } else {
    insertedValues[required.assinger] = row[required.assinger]
      ? msg.client.ch.objectClone(row[required.assinger])
      : null;
  }

  const passObject =
    typeof editor.dataPreparation === 'function'
      ? await editor.dataPreparation(msg, { insertedValues, required, Objects }, row, res)
      : { Objects };

  const selected =
    typeof editor.getSelected === 'function'
      ? await editor.getSelected(msg, insertedValues, required, passObject)
      : 'noSelect';

  const embed = new Builders.UnsafeEmbedBuilder();
  if (required.assinger !== 'id') {
    embed
      .addFields({
        name: '\u200b',
        value: `\u200b**${msg.lanSettings.valid}**:\n${languageOfKey.answers}${
          languageOfKey.recommended ? `\n\n${languageOfKey.recommended}\n` : ''
        }${languageOfKey.desc ? languageOfKey.desc : ''}`,
      })
      .setTitle(msg.client.ch.stp(languageOfKey.name, { row: row || '--' }));
  } else {
    embed
      .addFields({ name: '\u200b', value: `${msg.language.select.id.desc}` })
      .setTitle(msg.language.id);
  }
  embed.setAuthor({
    name: msg.client.ch.stp(msg.lanSettings.authorEdit, {
      type: languageOfSetting.type,
    }),
    iconURL: msg.client.objectEmotes.settings.link,
    url: msg.client.constants.standard.invite,
  });

  if (editor.requiresMenu) {
    embed.addFields({
      name: msg.language.page,
      value: `\`${
        Math.ceil(passObject.Objects.options.length / 25) ? passObject.Objects.page : 0
      }/${Math.ceil(Objects.options.length / 25)}\``,
    });
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
          ? await editor.buttons(msg, passObject, insertedValues, required, row)
          : await standardButtons(msg, passObject, insertedValues, required, row, editor),
    },
    11,
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

  const editor = getAllEditors().find((f) =>
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

  if (!editor) {
    throw new Error(
      `Cannot find Editor for key "${usedKey}" in \n${JSON.stringify(
        getAllEditors().map((e) => `${e.key}`),
        null,
        1,
      )}`,
    );
  }

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

  let updateRes;
  let oldRes;

  if (comesFromMMR) {
    oldRes = await msg.client.ch.query(
      `SELECT * FROM ${tableName} WHERE guildid = $1 AND uniquetimestamp = $2;`,
      [msg.guild.id, row.uniquetimestamp],
    );

    await msg.client.ch.query(
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

    updateRes = await msg.client.ch.query(
      `SELECT * FROM ${tableName} WHERE guildid = $1 AND uniquetimestamp = $2;`,
      [msg.guild.id, row.uniquetimestamp],
    );
  } else {
    oldRes = await msg.client.ch.query(`SELECT * FROM ${tableName} WHERE guildid = $1;`, [
      msg.guild.id,
    ]);

    await msg.client.ch.query(
      `UPDATE ${tableName} SET ${required.assinger} = $1 WHERE guildid = $2;`,
      [
        (insertedValues[required.assinger] && insertedValues[required.assinger].length) ||
        insertedValues[required.assinger] !== undefined
          ? insertedValues[required.assinger]
          : null,
        msg.guild.id,
      ],
    );

    updateRes = await msg.client.ch.query(`SELECT * FROM ${tableName} WHERE guildid = $1;`, [
      msg.guild.id,
    ]);
  }

  if (msg.file.doMoreThings) {
    msg.file.doMoreThings(msg, insertedValues, required.assinger, updateRes, oldRes);
  }

  log(msg, { insertedValues, required, comesFromMMR, row }, 'update');

  row[usedKey] = insertedValues[usedKey];
  let embed;
  let embed2;

  if (typeof msg.file.displayEmbed === 'function') {
    const returned = await msg.file.displayEmbed(msg, row);
    if (Array.isArray(returned)) {
      [embed, embed2] = returned;
    } else {
      embed = returned;
    }
  } else embed = noEmbed(msg, answer, res, comesFromMMR);

  if (embed2) return singleRowEdit({ msg, answer }, { row, res }, [embed, embed2], comesFromMMR);
  return singleRowEdit({ msg, answer }, { row, res }, embed, comesFromMMR);
};

const log = async (msg, editData, logType) => {
  const { insertedValues, required, comesFromMMR, row } = editData;

  const oldSettings = required ? row[required.assinger] : {};
  const newSettings = required ? insertedValues[required.assinger] : {};
  const settingsName =
    required && msg.lanSettings[msg.file.name].edit[required.assinger]
      ? msg.lanSettings[msg.file.name].edit[required.assinger].name
      : 'id';
  const { type } = msg.language.commands.settings[msg.file.name];

  const embed = new Builders.UnsafeEmbedBuilder().setAuthor({
    name: msg.client.ch.stp(msg.language.selfLog.author, {
      type,
    }),
    iconURL: msg.client.objectEmotes.settings.link,
    url: msg.client.constants.standard.invite,
  });

  switch (logType) {
    case 'add': {
      embed.addFields({
        name: msg.lanSettings.newValue,
        value: `\`\`\`${JSON.stringify(insertedValues, null, 1)}\`\`\``,
        inline: true,
      });

      if (comesFromMMR) {
        embed.setDescription(
          msg.client.ch.stp(msg.language.selfLog.addedWithID, { type, msg, id: row.id }),
        );
      } else {
        embed.setDescription(msg.client.ch.stp(msg.language.selfLog.added, { type, msg }));
      }
      break;
    }
    case 'del': {
      embed.addFields({
        name: msg.lanSettings.oldValue,
        value: `\`\`\`${JSON.stringify(insertedValues, null, 1)}\`\`\``,
        inline: true,
      });

      if (comesFromMMR) {
        embed.setDescription(
          msg.client.ch.stp(msg.language.selfLog.deletedWithID, { type, msg, id: row.id }),
        );
      } else {
        embed.setDescription(msg.client.ch.stp(msg.language.selfLog.deleted, { type, msg }));
      }
      break;
    }
    default: {
      embed.addFields({
        name: msg.lanSettings.oldValue,
        value: `${settingsName}: ${oldSettings}`,
        inline: true,
      });
      embed.addFields({
        name: msg.lanSettings.newValue,
        value: `${settingsName}: ${newSettings}`,
        inline: true,
      });

      if (comesFromMMR) {
        embed.setDescription(
          msg.client.ch.stp(msg.language.selfLog.descriptionWithID, { type, msg, id: row.id }),
        );
      } else {
        embed.setDescription(msg.client.ch.stp(msg.language.selfLog.description, { type, msg }));
      }
      break;
    }
  }

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
  const { msg, row, res, messageCollector } = msgData;
  let { embed } = msgData;
  const { languageOfKey, languageOfSetting } = languageData;

  if (!msg.m) return null;
  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  return new Promise((resolve) => {
    buttonsCollector.on('collect', async (interaction) => {
      if (interaction.user.id !== msg.author.id) return msg.client.ch.notYours(interaction);
      buttonsCollector.resetTimer();
      if (messageCollector) messageCollector.resetTimer();

      if (
        msg.client.constants.commands.settings.childSettings[msg.file.childOf] &&
        msg.client.constants.commands.settings.childSettings[msg.file.childOf].includes(
          interaction.customId,
        )
      ) {
        buttonsCollector.stop();
        reassignMsg(
          `${msg.client.constants.standard.prefix}${module.exports.name} ${
            interaction.customId
          } edit ${row[msg.client.constants.commands.settings.identifiers[msg.file.childOf]]}`,
          msg,
          6,
        );

        msg.file = getSetting(interaction.customId);
        msg.lan = msg.language.commands.settings[msg.file.name];
        return whereToGo(msg, interaction);
      }

      switch (interaction.customId) {
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

          embed.data.fields.splice(-1, 1);

          if (editor.requiresMenu) {
            embed.addFields({
              name: msg.language.page,
              value: `\`${
                Math.ceil(passObject.Objects.options.length / 25) ? passObject.Objects.page : 0
              }/${Math.ceil(passObject.Objects.options.length / 25)}\``,
            });
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
                  ? await editor.buttons(msg, passObject, insertedValues, required, row)
                  : await standardButtons(msg, passObject, insertedValues, required, row, editor),
              embeds: [embed],
            },
            12,
          );
          break;
        }
        case 'prev': {
          const indexFirst = passObject.Objects.options.findIndex(
            (r) => r.value === interaction.message.components[0].components[0].options[0].value,
          );

          passObject.Objects.take = [];
          passObject.Objects.page -= 1;

          embed.data.fields.splice(-1, 1);

          if (editor.requiresMenu) {
            embed.addFields({
              name: msg.language.page,
              value: `\`${
                Math.ceil(passObject.Objects.options.length / 25) ? passObject.Objects.page : 0
              }/${Math.ceil(passObject.Objects.options.length / 25)}\``,
            });
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
                  ? await editor.buttons(msg, passObject, insertedValues, required, row)
                  : await standardButtons(msg, passObject, insertedValues, required, row, editor),
              embeds: [embed],
            },
            13,
          );
          break;
        }
        case 'done': {
          buttonsCollector.stop();
          if (messageCollector) messageCollector.stop();
          resolve({ values: insertedValues, interaction });
          break;
        }
        default: {
          const collectors = [buttonsCollector];
          if (messageCollector) collectors.push(messageCollector);

          const returnedObject =
            typeof editor.interactionHandler === 'function'
              ? await editor.interactionHandler(
                  { msg, answer: interaction },
                  passObject,
                  insertedValues,
                  required,
                  row,
                  collectors,
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

          if (returnedObject.recall) {
            let newRes;
            if (msg.file.manualResGetter) {
              newRes = await msg.file.manualResGetter(msg);
            } else {
              newRes = await msg.client.ch.query(
                `SELECT * FROM ${
                  msg.client.constants.commands.settings.tablenames[msg.file.name][0]
                } WHERE guildid = $1;`,
                [msg.guild.id],
              );
            }

            return changing(
              { msg, answer: returnedObject.answer },
              { usedKey: required.key, comesFromMMR },
              { row: newRes.rows[0], res: newRes },
            );
          }

          embed = returnedObject.returnEmbed;

          if (required.assinger !== 'id') {
            embed
              .addFields({
                name: '\u200b',
                value: `\u200b**${msg.lanSettings.valid}**:\n${languageOfKey.answers}${
                  languageOfKey.recommended ? `\n\n${languageOfKey.recommended}\n` : ''
                }${languageOfKey.desc ? languageOfKey.desc : ''}`,
              })

              .setTitle(msg.client.ch.stp(languageOfKey.name, { row: row || '--' }));
          } else {
            embed
              .addFields({ name: '\u200b', value: `${msg.language.select.id.desc}` })
              .setTitle(msg.language.id);
          }
          embed.setAuthor({
            name: msg.client.ch.stp(msg.lanSettings.authorEdit, {
              type: languageOfSetting.type,
            }),
            iconURL: msg.client.objectEmotes.settings.link,
            url: msg.client.constants.standard.invite,
          });

          if (editor.requiresMenu) {
            embed.addFields({
              name: msg.language.page,
              value: `\`${
                Math.ceil(passObject.Objects.options.length / 25) ? passObject.Objects.page : 0
              }/${Math.ceil(Objects.options.length / 25)}\``,
            });
          }

          await replier(
            { msg, answer: returnedObject.answer ? returnedObject.answer : interaction },
            {
              rawButtons:
                typeof editor.buttons === 'function'
                  ? await editor.buttons(msg, passObject, insertedValues, required, row)
                  : await standardButtons(msg, passObject, insertedValues, required, row, editor),
              embeds: [embed],
            },
            14,
          );
          break;
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
        buttonsCollector.stop();
        reassignMsg(
          `${msg.client.constants.standard.prefix}${module.exports.name} ${msg.file.name} ${msg.language.edit}`,
          msg,
          7,
        );
      }

      if (comesFromMMR && !Object.keys(row).length) {
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
    if (editor.validator) {
      const valid = editor.validator(msg, message);
      if (!valid) return null;
    }
    const { returnEmbed } = await editor.messageHandler({ msg, message }, insertedValues, required);

    returnEmbed
      .addFields({
        name: '\u200b',
        value: `\u200b**${msg.lanSettings.valid}**:\n${languageOfKey.answers}${
          languageOfKey.recommended ? `\n\n${languageOfKey.recommended}\n` : ''
        }${languageOfKey.desc ? languageOfKey.desc : ''}`,
      })

      .setTitle(msg.client.ch.stp(languageOfKey.name, { row: row || '--' }))
      .setAuthor({
        name: msg.client.ch.stp(msg.lanSettings.authorEdit, {
          type: languageOfSetting.type,
        }),
        iconURL: msg.client.objectEmotes.settings.link,
        url: msg.client.constants.standard.invite,
      });

    if (editor.requiresMenu) {
      returnEmbed.addFields({
        name: msg.language.page,
        value: `\`${
          Math.ceil(passObject.Objects.options.length / 25) ? passObject.Objects.page : 0
        }/${Math.ceil(Objects.options.length / 25)}\``,
      });
    }

    return replier(
      { msg },
      {
        rawButtons:
          typeof editor.buttons === 'function'
            ? await editor.buttons(msg, passObject, insertedValues, required, row)
            : await standardButtons(msg, passObject, insertedValues, required, row, editor),
        embeds: [returnEmbed],
      },
      15,
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
      if (isString) {
        if (insertedValues[required.assinger] === answer.values[0]) {
          insertedValues[required.assinger] = null;
        } else {
          [insertedValues[required.assinger]] = answer.values;
        }
      } else {
        insertedValues[required.assinger] = answer.values;
      }
    }
  }

  const selected =
    typeof editor.getSelected === 'function'
      ? await editor.getSelected(msg, insertedValues, required, preparedData)
      : 'noSelect';

  const returnEmbed = new Builders.UnsafeEmbedBuilder().setDescription(
    `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
  );

  Objects.options.forEach((option) => {
    if (
      (Array.isArray(insertedValues[required.assinger]) &&
        insertedValues[required.assinger]?.includes(option.value)) ||
      insertedValues[required.assinger] === option.value
    ) {
      option.emoji = msg.client.objectEmotes.minusBG;
    } else {
      option.emoji = msg.client.objectEmotes.plusBG;
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
      required.required &&
      (!insertedValues[required.assinger] ||
        insertedValues[required.assinger] === msg.language.none);
  }

  if (editor.requiresMenu) {
    const getMany = required.key.endsWith('s');

    const menu = new Builders.UnsafeSelectMenuBuilder()
      .setCustomId(required.key)
      .addOptions(
        ...(Objects.take.length
          ? Objects.take
          : [new Builders.SelectMenuOptionBuilder().setLabel('--').setValue('0')]),
      )
      .setDisabled(!Objects.take.length)
      .setMinValues(1)
      .setMaxValues(getMany ? Objects.take.length : 1)
      .setPlaceholder(msg.language.select[required.key].select);
    const next = new Builders.UnsafeButtonBuilder()
      .setCustomId('next')
      .setEmoji(msg.client.objectEmotes.forth)
      .setDisabled(
        Objects.page === Math.ceil(Objects.options.length / 25) || !Objects.options.length,
      )
      .setStyle(Discord.ButtonStyle.Primary);
    const prev = new Builders.UnsafeButtonBuilder()
      .setCustomId('prev')
      .setEmoji(msg.client.objectEmotes.back)
      .setDisabled(Objects.page === 1 || !Objects.options.length)
      .setStyle(Discord.ButtonStyle.Danger);

    returnedButtons.push([menu], [prev, next]);
  }

  const done = new Builders.UnsafeButtonBuilder()
    .setCustomId('done')
    .setLabel(msg.language.done)
    .setDisabled(doneDisabled)
    .setStyle(Discord.ButtonStyle.Primary);

  returnedButtons.push([done]);

  return returnedButtons;
};

const setup = async (msg, answer) => {
  const lan = msg.language.commands.settings.setup;

  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: lan.author,
      url: msg.client.constants.standard.invite,
    })
    .setDescription(msg.client.ch.stp(lan.question, { type: msg.lanSettings[msg.file.name].type }));

  const yes = new Builders.UnsafeButtonBuilder()
    .setLabel(msg.language.Yes)
    .setCustomId('yes')
    .setStyle(Discord.ButtonStyle.Primary);
  const no = new Builders.UnsafeButtonBuilder()
    .setLabel(msg.language.No)
    .setCustomId('no')
    .setStyle(Discord.ButtonStyle.Danger);

  await replier({ msg, answer }, { rawButtons: [[yes, no]], embeds: [embed] }, 16);
  if (!msg.m) return;

  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  buttonsCollector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) return msg.client.ch.notYours(interaction);
    switch (interaction.customId) {
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
        const abort = new Builders.UnsafeEmbedBuilder()
          .setAuthor({
            name: lan.author,
            url: msg.client.constants.standard.invite,
          })
          .setDescription(lan.abort);
        return replier({ msg, answer: interaction }, { embeds: [abort] }, 17);
      }
      default: {
        return null;
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
  const settings = getAllSettings().filter((setting) => setting.folder === msg.args[0]);

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
        options.push(
          new Builders.SelectMenuOptionBuilder().setLabel(s.name.slice(0, 100)).setValue(s.name),
        );
      }
    });

    for (let i = 0; i < settingCategories.length; i += 1) {
      const settingsFile = settings.get(settingCategories[i]);

      let textType;
      let objectType;
      if (settingsFile.type) {
        switch (settingsFile.type) {
          case 1: {
            objectType = msg.client.objectEmotes.yellow;
            textType = msg.client.textEmotes.yellow;
            break;
          }
          case 2: {
            objectType = msg.client.objectEmotes.red;
            textType = msg.client.textEmotes.red;
            break;
          }
          case 3: {
            objectType = msg.client.objectEmotes.blue;
            textType = msg.client.textEmotes.blue;
            break;
          }
          case 4: {
            objectType = msg.client.objectEmotes.green;
            textType = msg.client.textEmotes.green;
            break;
          }
          default: {
            objectType = msg.client.objectEmotes.blue;
            textType = msg.client.textEmotes.blue;
            break;
          }
        }
      } else {
        objectType = msg.client.objectEmotes.blue;
        textType = msg.client.textEmotes.blue;
      }
      settingCategories[i] = `${textType}${settingCategories[i]} `;
      settingCategories[i] += new Array(22 - settingCategories[i].length).join(' ');

      const index = options.findIndex((o) => o.data.value === settingsFile.name);
      options[index].setEmoji(objectType);
      options[index].setDescription(category);
    }

    categoryText += `__${category}__:\n${msg.client.ch.makeCodeBlock(
      `${settingCategories.map((s) => `${s}`)}`.replace(/,/g, ''),
    )}\n`;
  });

  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: msg.client.ch.stp(msg.language.commands.settings.author, {
        type: msg.language.commands.settings[settings.first().name].type,
      }),
      iconURL: msg.client.objectEmotes.settings.link,
      url: msg.client.constants.standard.invite,
    })
    .setDescription(
      msg.client.ch.stp(msg.language.commands.settings.settings.desc, {
        prefix: msg.client.constants.standard.prefix,
        commands: categoryText,
      }),
    );

  const rawButtons = [
    new Builders.UnsafeSelectMenuBuilder()
      .addOptions(...options)
      .setCustomId('menu')
      .setMaxValues(1)
      .setMinValues(1)
      .setPlaceholder(msg.language.commands.settings.menu.placeholder),
  ];

  await replier({ msg, answer }, { embeds: [embed], rawButtons }, 18);
  categoryMenuHandler({ msg, answer }, needsBack);
};

const categoryMenuHandler = async ({ msg, answer }, needsBack) => {
  if (!msg.m) return;
  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });

  buttonsCollector.on('collect', (interaction) => {
    if (interaction.user.id !== msg.author.id) return msg.client.ch.notYours(interaction);
    buttonsCollector.stop();
    reassignMsg(
      `${msg.client.constants.standard.prefix}${module.exports.name} ${interaction.values[0]}`,
      msg,
      8,
    );

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

const reassignMsg = (newContent, msg /* debugNumber */) => {
  msg.content = `${newContent}`;
  msg.args = msg.content.replace(/\\n/g, ' ').split(/ +/);

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

  if (!msg.m.reactions.cache.get(msg.client.objectEmotes.back.name)?.me) {
    msg.m.react(msg.client.objectEmotes.back.name).catch(() => {});
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

      if (reaction.emoji.name === msg.client.objectEmotes.back.name) {
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
              9,
            );
            msg.file = undefined;
            reaction.users.remove(user.id);
            module.exports.execute(msg, answer);
            return null;
          }

          switch (sendTo) {
            default: {
              reassignMsg(`${msg.client.constants.standard.prefix}${module.exports.name}`, msg, 10);
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
            11,
          );
          msg.file = undefined;
          reaction.users.remove(user.id);
          module.exports.execute(msg, answer);
        } else {
          reassignMsg(`${msg.client.constants.standard.prefix}${module.exports.name}`, msg, 12);
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

const getRelatedSettingsButtons = (msg) =>
  msg.client.constants.commands.settings.childSettings[msg.file.childOf].map((setting) =>
    new Builders.UnsafeButtonBuilder()
      .setCustomId(setting)
      .setLabel(msg.lanSettings[setting].type)
      .setStyle(
        msg.file.name === setting ? Discord.ButtonStyle.Secondary : Discord.ButtonStyle.Primary,
      )
      .setDisabled(msg.file.name === setting),
  );

const getResRows = async (msg) => {
  let res;
  if (msg.file.manualResGetter) {
    res = await msg.file.manualResGetter(msg);
  } else {
    res = await msg.client.ch.query(
      `SELECT * FROM ${
        msg.client.constants.commands.settings.tablenames[msg.file.name][0]
      } WHERE guildid = $1 AND ${
        msg.client.constants.commands.settings.identifiers[msg.file.childOf]
      } = $2;`,
      [msg.guild.id, msg.args[2]],
    );
  }

  if (res && res.rowCount) return res;
  return null;
};

const getAllSettings = () => {
  const dir = `${require.main.path}/Files/Commands/Settings/Categories`;
  const files = [
    ...fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.js'))
      .map((c) => {
        const file = require(`${dir}/${c}`);
        file.name = c.replace('.js', '');

        return file;
      })
      .filter((f) => f.finished !== false),
    ...getNestedSettings(),
  ];

  return files;
};

const getNestedSettings = () => {
  const mainDir = `${require.main.path}/Files/Commands/Settings/Categories`;
  const folders = fs.readdirSync(mainDir).filter((f) => !f.endsWith('.js'));

  const files = folders
    .map((folder) => {
      const insideFolder = fs.readdirSync(`${mainDir}/${folder}`);

      return insideFolder.map((f) => {
        const file = require(`${mainDir}/${folder}/${f}`);
        file.name = f.replace('.js', '');

        return file;
      });
    })
    .flat(1);

  return files;
};

const getSetting = (name) => {
  const allSettings = getAllSettings();
  return allSettings.find((s) => s.name === name);
};

const getAllEditors = () => {
  const dir = `${require.main.path}/Files/Commands/Settings/Editors`;

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => require(`${dir}/${f}`));

  return files;
};
