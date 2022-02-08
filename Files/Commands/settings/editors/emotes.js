const Discord = require('discord.js');

// TODO: fix standard emotes like 🔨

module.exports = {
  key: ['emote', 'emotes'],
  requiresInteraction: true,
  requiresMenu: false,
  interactionType: 'message',
  buttons: (msg, preparedData, insertedValues, required, row) => {
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

    return [[done]];
  },
  messageHandler: (msgData, insertedValues, required) => {
    const { msg, message } = msgData;

    const args = message.content
      .split(/:+/)
      .map((arg) => arg.replace(/\D+/g, ''))
      .filter((arg) => !!arg.length);

    const unicodeEmojis = message.content
      .match(msg.client.ch.regexes.emojiTester)
      .filter((e) => !!e.length);

    if (unicodeEmojis?.length) {
      args.push(...unicodeEmojis);
    }

    switch (required.key) {
      default: {
        [insertedValues[required.assinger]] = args;
        break;
      }
      case 'emotes': {
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

    const selected = module.exports.getSelected(msg, insertedValues, required, required.key);

    const returnEmbed = new Discord.MessageEmbed().setDescription(
      `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
    );

    return { returnEmbed };
  },
  getSelected: (msg, insertedValues, required) => {
    if (insertedValues[required.assinger]) {
      switch (required.key) {
        default: {
          if (insertedValues[required.assinger]) {
            let emote;
            if (msg.client.emojis.cache.get(insertedValues[required.assinger])) {
              emote = msg.client.emojis.cache.get(insertedValues[required.assinger]);
            } else if (
              insertedValues[required.assinger].match(msg.client.ch.regexes.emojiTester)?.length
            ) {
              emote = insertedValues[required.assinger];
            }

            if (emote) {
              return `${emote}`;
            }
            return msg.language.noAccess;
          }
          return msg.language.none;
        }
        case 'emotes': {
          return insertedValues[required.assinger] &&
            insertedValues[required.assinger].length &&
            Array.isArray(insertedValues[required.assinger])
            ? insertedValues[required.assinger]
                .map((value) => {
                  let emote;
                  if (msg.client.emojis.cache.get(value)) {
                    emote = msg.client.emojis.cache.get(value);
                  } else if (value.match(msg.client.ch.regexes.emojiTester)?.length) {
                    emote = value;
                  }

                  if (emote) {
                    return `${emote}`;
                  }
                  return msg.language.noAccess;
                })
                .join(', ')
            : msg.language.none;
        }
      }
    }
    return null;
  },
  validator: (msg, message) => {
    const args = message.content
      .split(/:+/)
      .map((arg) => arg.replace(/\D+/g, ''))
      .filter((arg) => !!arg.length);

    const noAccessEmotes = args
      .map((arg) => {
        const emote = msg.client.emojis.cache.get(arg);
        if (!emote) {
          const nameArray = message.content.split(arg)[0].split(/:+/);
          return `\`${nameArray[nameArray.length - 2]}\``;
        }
        return null;
      })
      .filter((arg) => !!arg);

    if (noAccessEmotes.length) {
      msg.client.ch
        .reply(message, {
          content: msg.client.ch.stp(msg.lan.lackingAccess, { emotes: noAccessEmotes.join(', ') }),
        })
        .then((m) => setTimeout(() => m.delete(), 10000));
      return false;
    }
    return true;
  },
};
