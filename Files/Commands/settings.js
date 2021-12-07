/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const Discord = require('discord.js');
const fs = require('fs');

const editors = new Discord.Collection();
fs.readdirSync('./Files/Commands/settings/editors')
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    const editorfile = require(`./editors/settings/${file}`);
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

          settingCategories[i] = `${type}${settingCategories[i]}⠀`;
          settingCategories[i] += new Array(22 - settingCategories[i].length).join(' ');
        }

        categoryText += `__${category}__:\n${msg.client.ch.makeCodeBlock(
          `${settingCategories.map((s) => `${s}`)}`.replace(/,/g, ''),
        )}\n`;
      });

      const embed = new Discord.MessageEmbed()
        .setAuthor(
          msg.lan.settings.author,
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

      if (!msg.args[1]) this.display(msg);
      else if (
        msg.args[1] &&
        settingsFile.perm &&
        !msg.member.permissions.has(new Discord.Permissions(settingsFile.perm)) &&
        msg.author.id !== '318453143476371456'
      ) {
        return msg.client.ch.reply(msg, {
          content: msg.language.commands.commandHandler.missingPermissions,
        });
      } else {
        if (!msg.file.setupRequired === false) return mmrEditList({ msg }, { res });
        const res = await msg.client.ch.query(
          `SELECT * FROM ${
            msg.client.constants.commands.settings.tablenames[msg.file.name][0]
          } WHERE guildid = $1;`,
          [msg.guild.id],
        );
        singleRowEdit({ msg }, res.rows[0]);
      }
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
      buttonsCollector.on('collect', (clickButton) => {
        if (clickButton.user.id === msg.author.id) {
          if (clickButton.customId === 'edit') {
            buttonsCollector.stop();
            this.edit(msg, clickButton);
          }
        } else msg.client.ch.notYours(clickButton, msg);
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

      let embed = new Discord.MessageEmbed();

      if (res && res.rowCount > 0) {
        msg.rows = res.rows;
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
        if (reason === 'time') {
          msg.client.ch.collectorEnd(msg);
        }
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
    .setAuthor(msg.client.ch.stp(msg.language.commands.settings.noEmbed.author, { type: '' }))
    .setDescription(msg.language.commands.settings.noEmbed.desc)
    .setColor(msg.client.constants.commands.settings.color);
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

  if (answer) {
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

  const mmrAddRepeater = async (answer, embed, addLanguage, steps, insertedValues) => {
    const { requiredSteps, currentStep } = steps;

    if (requiredSteps.length === currentStep + 1) {
      return insertedValues;
    }

    const required = {
      key: msg.client.constants.commands.settings.setupQueries[msg.file.name].add[currentStep],
      value: addLanguage[currentStep],
    };
    required.assinger = msg.client.constants.commands.settings.edit[msg.file.name][required.key];

    const editor = editors.find((f) => f.key.includes(msg.property));
    if (editor.requiresInteraction) {


    }

    if (editor.execute[Symbol.toStringTag] === 'AsyncFunction') {
      editor.execute(msg, required, insertedValues);
    } else {
      await editor.execute(msg, required, insertedValues);
    }

    return mmrAddRepeater(answer, embed, addLanguage, steps, insertedValues);
  };

  const mmrAdd = async (answer) => {
    const addLanguage = msg.lanSettings[msg.file.name].otherEdits.add;
    const requiredSteps = msg.client.constants.commands.settings[msg.file.name].add;

    const embed = new Discord.MessageEmbed().setAuthor(
      addLanguage.name,
      null,
      msg.client.constants.standard.invite,
    );

    const values = await mmrAddRepeater(
      answer,
      embed,
      addLanguage,
      { requiredSteps, currentStep: 0 },
      {},
    );

    values.uniquetimestamp = Date.now();
    values.id = res.rows.length + 1;
    values.guildid = msg.guild.id;

    const tables = msg.client.constants.commands.settings.tablenames[msg.file.name];
    tables.forEach((table, i) => {
      const cols = msg.client.constants.commands.settings.setupQueries.cols[i];
      const vals = msg.client.constants.commands.settings.setupQueries.vals[i];

      const valueIdentifier = [];
      cols.forEach((collumn, j) => {
        valueIdentifier.push(`$${j + 1}`);
      });

      const valuesSTP = [];
      vals.forEach((value) => {
        valuesSTP.push(msg.client.ch.stp(value, { values, msg }));
      });

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
        mmrAdd(interaction);
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
  const settingsConstant = msg.client.constants.commands.settings.setupQueries[msg.file.name];

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

  await replier({ msg, answer }, { rawButtons, embed });

  const buttonsCollector = answer.createMessageComponentCollector({ time: 60000 });
  buttonsCollector.on('collect', (interaction) => {
    if (interaction.user.id !== msg.author.id) return msg.client.ch.notYours(interaction, msg);
    const usedKey = Object.entries(settingsConstant.edit).find((key, value) => {
      if (interaction.customId === value.name) return key;
      return null;
    });

    changing({ msg, interaction }, { usedKey, row, embed, comesFromMMR });

    return null;
  });
  buttonsCollector.on('end', (collected, reason) => {
    if (reason === 'time') msg.client.ch.collectorEnd(msg);
  });
};
