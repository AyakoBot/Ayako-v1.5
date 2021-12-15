const Discord = require('discord.js');

module.exports = {
  key: ['punishment', 'punishments'],
  requiresInteraction: true,
  dataPreparation(msg, editorData, row) {
    const { insertedValues, required, Objects } = editorData;

    insertedValues[required.assinger] = [
      ...(row[required.assinger]?.length ? row[required.assinger] : []),
    ];

    const numbers = new Array(9999);

    numbers.forEach((element, i) => {
      const inserted = {
        label: i,
        value: i,
      };

      if (insertedValues[required.assinger].includes(i)) {
        inserted.description = msg.language.removeFromList;
        inserted.emoji = msg.client.constants.emotes.minusBGID;
      } else {
        inserted.description = msg.language.addToList;
        inserted.emoji = msg.client.constants.emotes.plusBGID;
      }

      Objects.options.push(inserted);
    });

    for (let i = 0; i < 25 && i < Objects.options.length; i += 1) {
      Objects.take.push(Objects.options[i]);
    }

    return { Objects };
  },
  buttons(msg, preparedData, insertedValues, required, row) {
    const { Objects } = preparedData;

    const getMany = required.key.endsWith('s');

    let doneDisabled = true;
    if (Array.isArray(insertedValues[required.assinger])) {
      doneDisabled = msg.client.ch.arrayEquals(
        insertedValues[required.assinger],
        row[required.assinger],
      );
    } else {
      doneDisabled = !!insertedValues[required.assinger];
    }

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
    const done = new Discord.MessageButton()
      .setCustomId('done')
      .setLabel(msg.language.done)
      .setDisabled(doneDisabled)
      .setStyle('PRIMARY');
    const back = new Discord.MessageButton()
      .setCustomId('back')
      .setLabel(msg.language.back)
      .setEmoji(msg.client.constants.emotes.back)
      .setStyle('DANGER');

    return [[menu], [prev, next], [back, done]];
  },
  interactionHandler(msgData, preparedData, insertedValues, required) {
    const { msg } = msgData;
    const { Objects } = preparedData;

    const selected = this.getSelected(msg, insertedValues, required, required.key);

    const returnEmbed = new Discord.MessageEmbed().setDescription(
      `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
    );

    Objects.options.forEach((option) => {
      if (insertedValues[required.assinger]?.includes(option.value)) {
        option.emoji = msg.client.constants.emotes.minusBGID;
        option.description = msg.language.removeFromList;
      } else {
        option.emoji = msg.client.constants.emotes.plusBGID;
        option.description = msg.language.addToList;
      }
    });

    return { returnEmbed };
  },
  getSelected(msg, insertedValues, required) {
    if (insertedValues[required.assinger]) {
      switch (required.key.endsWith('s')) {
        default: {
          return insertedValues[required.assinger];
        }
        case true: {
          return insertedValues[required.assinger]
            .map((value) => {
              return `${value}`;
            })
            .join(', ');
        }
      }
    }
    return null;
  },

  async execute(
    msg,
    i,
    embed,
    values,
    answer,
    AddRemoveEditView,
    fail,
    srmEditing,
    comesFromSRM,
    answered,
  ) {
    const req = [];
    const punishments = Object.entries(msg.language.autopunish);
    for (let i = 0; i < punishments.length; i++)
      req.push({ value: punishments[i][0], label: punishments[i][1] });
    const options = [];
    req.forEach((r) => {
      options.push({ label: `${r.label}`, value: `${r.value}` });
    });
    const take = [];
    for (let j = 0; j < 25 && j < options.length; j++) take.push(options[j]);
    if (!msg.language.select[msg.property])
      throw new Error(`Couldn't find ${msg.property} in msg.language.select`);
    const menu = new Discord.MessageSelectMenu()
      .setCustomId(msg.property)
      .addOptions(take)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder(msg.language.select[msg.property].select);
    const next = new Discord.MessageButton()
      .setCustomId('next')
      .setLabel(msg.language.next)
      .setDisabled(options.length < 25 ? true : false)
      .setStyle('SUCCESS');
    const prev = new Discord.MessageButton()
      .setCustomId('prev')
      .setLabel(msg.language.prev)
      .setDisabled(true)
      .setStyle('DANGER');
    const done = new Discord.MessageButton()
      .setCustomId('done')
      .setLabel(msg.language.done)
      .setDisabled(true)
      .setStyle('PRIMARY');
    const back = new Discord.MessageButton()
      .setCustomId('back')
      .setLabel(msg.language.back)
      .setEmoji(msg.client.constants.emotes.back)
      .setStyle('DANGER');
    embed = new Discord.MessageEmbed()
      .setAuthor(
        msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
        msg.client.constants.emotes.settingsLink,
        msg.client.constants.standard.invite,
      )
      .setDescription(
        `${msg.language.select[msg.property].desc}\n${msg.language.page}: \`1/${Math.ceil(
          options.length / 25,
        )}\``,
      );
    const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
    if (answer) answer.update({ embeds: [embed], components: rows }).catch(() => {});
    else msg.m.edit({ embeds: [embed], components: rows }).catch(() => {});
    const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
    let interaction;
    const resolved = await new Promise((resolve) => {
      buttonsCollector.on('collect', (clickButton) => {
        if (clickButton.user.id == msg.author.id) {
          if (clickButton.customId == 'next' || clickButton.customId == 'prev') {
            let indexLast;
            let indexFirst;
            for (let j = 0; options.length > j; j++) {
              if (
                options[j] &&
                options[j].value ==
                  clickButton.message.components[0].components[0].options[
                    clickButton.message.components[0].components[0].options.length - 1
                  ].value
              )
                indexLast = j;
              if (
                options[j] &&
                options[j].value == clickButton.message.components[0].components[0].options[0].value
              )
                indexFirst = j;
            }
            take.splice(0, take.length);
            if (clickButton.customId == 'next')
              for (let j = indexLast + 1; j < indexLast + 26; j++) {
                if (options[j]) {
                  take.push(options[j]);
                }
              }
            if (clickButton.customId == 'prev')
              for (let j = indexFirst - 25; j < indexFirst; j++) {
                if (options[j]) {
                  take.push(options[j]);
                }
              }
            let page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
            clickButton.customId == 'next' ? page++ : page--;
            const menu = new Discord.MessageSelectMenu()
              .setCustomId(msg.property)
              .addOptions(take)
              .setMinValues(1)
              .setMaxValues(1)
              .setPlaceholder(msg.language.select[msg.property].select);
            const next = new Discord.MessageButton()
              .setCustomId('next')
              .setLabel(msg.language.next)
              .setDisabled(options.length < page * 25 + 26 ? true : false)
              .setStyle('SUCCESS');
            const prev = new Discord.MessageButton()
              .setCustomId('prev')
              .setLabel(msg.language.prev)
              .setDisabled(page == 1 ? true : false)
              .setStyle('DANGER');
            const done = new Discord.MessageButton()
              .setCustomId('done')
              .setLabel(msg.language.done)
              .setStyle('PRIMARY');
            const back = new Discord.MessageButton()
              .setCustomId('back')
              .setLabel(msg.language.back)
              .setEmoji(msg.client.constants.emotes.back)
              .setStyle('DANGER');
            if (answered.length) done.setDisabled(false);
            else done.setDisabled(true);
            const embed = new Discord.MessageEmbed()
              .setAuthor(
                msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
                msg.client.constants.emotes.settingsLink,
                msg.client.constants.standard.invite,
              )
              .setDescription(
                `${msg.language.select[msg.property].desc}\n${
                  msg.language.page
                }: \`${page}/${Math.ceil(+options.length / 25)}\``,
              );
            if (answered?.length) embed.addField(msg.language.selected, `${answered} `);
            if (page >= Math.ceil(+options.length / 25)) next.setDisabled(true);
            else next.setDisabled(false);
            if (page > 1) prev.setDisabled(false);
            else prev.setDisabled(true);
            const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
            clickButton.update({ embeds: [embed], components: rows }).catch(() => {});
          } else if (clickButton.customId == 'done') {
            if (answered.length) values[msg.assigner] = answered;
            buttonsCollector.stop('finished');
            interaction = clickButton;
            resolve(true);
          } else if (clickButton.customId == msg.property) {
            let page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
            answered = clickButton.values[0];
            const menu = new Discord.MessageSelectMenu()
              .setCustomId(msg.property)
              .addOptions(take)
              .setMinValues(1)
              .setMaxValues(1)
              .setPlaceholder(msg.language.select[msg.property].select);
            const next = new Discord.MessageButton()
              .setCustomId('next')
              .setLabel(msg.language.next)
              .setDisabled(options.length < page * 25 + 26 ? true : false)
              .setStyle('SUCCESS');
            const prev = new Discord.MessageButton()
              .setCustomId('prev')
              .setLabel(msg.language.prev)
              .setDisabled(page == 1 ? true : false)
              .setStyle('DANGER');
            const done = new Discord.MessageButton()
              .setCustomId('done')
              .setLabel(msg.language.done)
              .setStyle('PRIMARY');
            const back = new Discord.MessageButton()
              .setCustomId('back')
              .setLabel(msg.language.back)
              .setEmoji(msg.client.constants.emotes.back)
              .setStyle('DANGER');
            if (answered.length) done.setDisabled(false);
            else done.setDisabled(true);
            page = clickButton.message.embeds[0].description.split(/`+/)[1].split(/\/+/)[0];
            const embed = new Discord.MessageEmbed()
              .setAuthor(
                msg.client.ch.stp(msg.lanSettings.author, { type: msg.lan.type }),
                msg.client.constants.emotes.settingsLink,
                msg.client.constants.standard.invite,
              )
              .setDescription(
                `${msg.language.select[msg.property].desc}\n${
                  msg.language.page
                }: \`${page}/${Math.ceil(+options.length / 25)}\``,
              )
              .addField(msg.language.selected, `${answered} `);
            const rows = msg.client.ch.buttonRower([[menu], [prev, next], [back, done]]);
            clickButton.update({ embeds: [embed], components: rows }).catch(() => {});
          } else if (clickButton.customId == 'back') {
            msg.property = undefined;
            buttonsCollector.stop();
            interaction = clickButton;
            resolve(false);
            if (comesFromSRM)
              return require('../singleRowManager').redirecter(
                msg,
                clickButton,
                AddRemoveEditView,
                fail,
                values,
                values.id ? 'redirecter' : null,
              );
            else return require('../multiRowManager').edit(msg, clickButton, {});
          }
        } else msg.client.ch.notYours(clickButton, msg);
      });
      buttonsCollector.on('end', (collected, reason) => {
        if (reason == 'time') {
          msg.client.ch.collectorEnd(msg);
          resolve(false);
        }
      });
    });
    if (resolved)
      return [
        'repeater',
        msg,
        i + 1,
        embed,
        values,
        interaction,
        AddRemoveEditView,
        fail,
        srmEditing,
        comesFromSRM,
        answered,
      ];
    else return null;
  },
};
