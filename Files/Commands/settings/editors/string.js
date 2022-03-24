const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

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

    const done = new Discord.UnsafeButtonComponent()
      .setCustomId('done')
      .setLabel(msg.language.done)
      .setDisabled(doneDisabled)
      .setStyle(Discord.ButtonStyle.Primary);

    return [[done]];
  },
  messageHandler(msgData, insertedValues, required) {
    const { msg, message } = msgData;

    const args = message.content.replace(/\\n/g, ' ').split(/ ?#+ ?/);

    switch (required.key) {
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
          } else if (
            insertedValues[required.assinger] &&
            insertedValues[required.assinger].length
          ) {
            insertedValues[required.assinger].push(arg);
          } else insertedValues[required.assinger] = [arg];
        });
        break;
      }
      default: {
        insertedValues[required.assinger] = message.content;
        break;
      }
    }

    const selected = this.getSelected(msg, insertedValues, required, required.key);

    const returnEmbed = new Builders.UnsafeEmbedBuilder().setDescription(
      `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
    );

    return { returnEmbed };
  },
  getSelected(msg, insertedValues, required) {
    if (insertedValues[required.assinger]) {
      switch (required.key) {
        case 'stringArray': {
          return insertedValues[required.assinger] &&
            insertedValues[required.assinger].length &&
            Array.isArray(insertedValues[required.assinger])
            ? insertedValues[required.assinger].map((value) => `\`${value}\``).join(', ')
            : msg.language.none;
        }
        default: {
          return insertedValues[required.assinger]
            ? insertedValues[required.assinger]
            : msg.language.none;
        }
      }
    }
    return null;
  },
};
