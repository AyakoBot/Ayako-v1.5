
const Discord = require('discord.js');

module.exports = {
  key: ['user', 'users'],
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

    const fail = (arg) => {
      let text = '';
      if (Array.isArray(arg)) {
        text = arg.join(', ');
      } else text = arg;

      const lan = msg.lanSettings.fails[required.key];
      const embed = new Discord.MessageEmbed()
        .setColor(msg.client.constants.error)
        .setDescription(`${lan}\n${text}`);
      message.reply({ embeds: [embed] });
    };

    const args = message.content.replace(/\\n/g, ' ').replace(/\D+/g, '').split(/ +/);

    switch (required.key) {
      default: {
        const user = msg.client.users.cache.get(message.content);
        if (user) {
          insertedValues[required.assinger] = user.id;
        } else fail(message.content);
        break;
      }
      case 'users': {
        const assinged = insertedValues[required.assinger];
        const notUserArgs = [];

        args.forEach((id) => {
          const user = msg.client.users.cache.get(id);

          if (user) {
            if (assinged && assinged.includes(user.id)) {
              const index = assinged.indexOf(user.id);
              assinged.splice(index, 1);
            } else if (assinged && assinged.length) assinged.push(user.id);
            else insertedValues[required.assinger] = [user.id];
          } else notUserArgs.push(id);

          if (notUserArgs.length) fail(notUserArgs);
        });
        break;
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
        case 'users': {
          return insertedValues[required.assinger]
            .map((value) => {
              return `<@${value}>`;
            })
            .join(', ');
        }
      }
    }
    return null;
  },
};
