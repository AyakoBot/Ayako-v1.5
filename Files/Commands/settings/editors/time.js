
const Discord = require('discord.js');
const ms = require('ms');

module.exports = {
  key: ['time'],
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

    const args = message.content.replace(/\\n/g, ' ').replace(/\D+/g, '').split(/ +/);

    let duration = 0;
    args.forEach((n, i) => {
      if (!Number.isNaN(ms(n))) {
        if (args[i + 1] && Number.isNaN(ms(args[i + 1]))) n = `${n} ${args[i + 1]}`;
        duration = +duration + +ms(n);
      }
    });
    insertedValues[required.assinger] = duration;

    const selected = this.getSelected(msg, insertedValues, required, required.key);

    const returnEmbed = new Discord.MessageEmbed().setDescription(
      `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
    );

    return { returnEmbed };
  },
  getSelected(msg, insertedValues, required) {
    if (insertedValues[required.assinger]) {
      return insertedValues[required.assinger];
    }
    return null;
  },
};
