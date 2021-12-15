const Discord = require('discord.js');

module.exports = {
  key: ['language', 'languages'],
  requiresInteraction: true,
  dataPreparation(msg, editorData, row) {
    const { insertedValues, required, Objects } = editorData;

    insertedValues[required.assinger] = [
      ...(row[required.assinger]?.length ? row[required.assinger] : []),
    ];

    Object.entries(msg.language.languages).forEach(([languageKey, language], i) => {
      const inserted = {
        label: `${language.name} | ${language.status} | ${msg.client.constants.emotes.flags[languageKey]}`,
        value: languageKey,
      };

      if (
        Array.isArray(insertedValues[required.assinger]) &&
        insertedValues[required.assinger].includes(i)
      ) {
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
};
