const Discord = require('discord.js');

module.exports = {
  key: ['string', 'stringArray'],
  requiresInteraction: true,
  requiresMenu: false,
  interactionType: 'message',
  buttons(msg, preparedData, insertedValues, required, row) {
    let doneDisabled = true;

    if (Array.isArray(insertedValues[required.assinger])) {
      doneDisabled =
        msg.client.ch.arrayEquals(insertedValues[required.assinger], row[required.assinger]) ||
        (!insertedValues[required.assinger].length && required.required);
    } else {
      doneDisabled = !insertedValues[required.assinger];
    }

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

    return [[back, done]];
  },
  messageHandler(msgData, insertedValues, required) {
    const { msg, message } = msgData;

    const args = message.content.replace(/\\n/g, ' ').split(/#+/);

    switch (required.key) {
      default: {
        insertedValues[required.assinger] = message.content;
        break;
      }
      case 'stringArray': {
        insertedValues[required.assinger] = Array.isArray(insertedValues[required.assinger])
          ? insertedValues[required.assinger]
          : [];

        args.forEach((arg) => {
          if (
            insertedValues[required.assinger] &&
            insertedValues[required.assinger].includes(arg)
          ) {
            const index = insertedValues[required.assinger].indexOf(arg);
            insertedValues[required.assinger].splice(index, 1);
          } else if (insertedValues[required.assinger] && insertedValues[required.assinger].length)
            insertedValues[required.assinger].push(arg);
          else insertedValues[required.assinger] = [arg];
        });
      }
    }

    const selected = this.getSelected(msg, insertedValues, required, required.key);

    const returnEmbed = new Discord.MessageEmbed().setDescription(
      `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
    );

    return { returnEmbed };
  },
  getSelected(msg, insertedValues, required) {
    if (insertedValues[required.assinger]) {
      switch (required.key) {
        default: {
          return insertedValues[required.assinger]
            ? insertedValues[required.assinger]
            : msg.language.none;
        }
        case 'stringArray': {
          return insertedValues[required.assinger] &&
            insertedValues[required.assinger].length &&
            Array.isArray(insertedValues[required.assinger])
            ? insertedValues[required.assinger]
                .map((value) => {
                  return `${value}`;
                })
                .join(', ')
            : msg.language.none;
        }
      }
    }
    return null;
  },
};
