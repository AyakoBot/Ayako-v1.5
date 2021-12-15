const Discord = require('discord.js');

module.exports = {
  key: ['string', 'stringArray'],
  requiresInteraction: true,
  interactionType: 'message',
  dataPreparation(msg, editorData, row) {
    const { insertedValues, required, Objects } = editorData;

    insertedValues[required.assinger] = row[required.assinger]?.length
      ? row[required.assinger]
      : msg.language.none;

    return { Objects };
  },
  buttons(msg, preparedData, insertedValues, required, row) {
    let doneDisabled = true;
    if (Array.isArray(insertedValues[required.assinger])) {
      doneDisabled = msg.client.ch.arrayEquals(
        insertedValues[required.assinger],
        row[required.assinger],
      );
    } else {
      doneDisabled = !!insertedValues[required.assinger];
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
        const assinged = insertedValues[required.assinger];

        args.forEach((arg) => {
          if (assinged && assinged.includes(arg)) {
            const index = assinged.indexOf(arg);
            assinged.splice(index, 1);
          } else if (assinged && assinged.length) assinged.push(arg);
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
          return insertedValues[required.assinger];
        }
        case 'stringArray': {
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
