/* eslint-disable no-param-reassign */
const Discord = require('discord.js');

module.exports = {
  key: ['user', 'users'],
  requiresInteraction: true,
  interactionType: 'message',
  dataPreparation(msg, editorData, row) {
    const { insertedValues, required, Objects } = editorData;

    insertedValues[required.assinger] = [
      ...(row[required.assinger]?.length ? row[required.assinger] : []),
    ];

    return { Objects };
  },
  buttons(msg, preparedData, insertedValues, required, row) {
    const { Objects } = preparedData;

    let doneDisabled = true;
    if (Array.isArray(insertedValues[required.assinger])) {
      doneDisabled = msg.client.ch.arrayEquals(
        insertedValues[required.assinger],
        row[required.assinger],
      );
    } else {
      doneDisabled = !!insertedValues[required.assinger];
    }

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

    return [
      [prev, next],
      [back, done],
    ];
  },
  messageHandler(msgData, insertedValues, required) {
    const { msg, message } = msgData;

    const args = message.content.replace(/\n/g, '').replace(/\D+/g, '').split(/ +/);

    args.forEach((id) => {
      const user = msg.client.users.cache.get(id);
      if (user) {
        insertedValues[required.assinger].push(user);
      }
    });

    const selected = this.getSelected(msg, insertedValues, required, required.key);

    const returnEmbed = new Discord.MessageEmbed().setDescription(
      `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
    );

    return { returnEmbed };
  },
  getSelected(msg, insertedValues, required) {
    if (insertedValues[required.assinger]) {
      return insertedValues[required.assinger]
        .map((value) => {
          return `${value}`;
        })
        .join(', ');
    }
    return null;
  },
};
