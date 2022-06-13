const Discord = require('discord.js');
const jobs = require('node-schedule');
const Builders = require('@discordjs/builders');

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

    const done = new Builders.UnsafeButtonBuilder()
      .setCustomId('done')
      .setLabel(msg.language.done)
      .setDisabled(doneDisabled)
      .setStyle(Discord.ButtonStyle.Primary);

    return [[done]];
  },
  messageHandler: (msgData, insertedValues, required) => {
    const { msg, message } = msgData;

    const args = message.content.match(/\d{17,19}/g) || [];

    const unicodeEmojis = message.content
      .match(msg.client.ch.regexes.emojiTester)
      ?.filter((e) => !!e.length);

    if (unicodeEmojis?.length) {
      args.push(...unicodeEmojis);
    }

    switch (required.key) {
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
        if (!args) break;
        [insertedValues[required.assinger]] = args;
        break;
      }
    }

    const selected = module.exports.getSelected(msg, insertedValues, required, required.key);

    const returnEmbed = new Builders.UnsafeEmbedBuilder().setDescription(
      `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
    );

    return { returnEmbed };
  },
  getSelected: (msg, insertedValues, required) => {
    if (insertedValues[required.assinger]) {
      switch (required.key) {
        case 'emotes': {
          return insertedValues[required.assinger] &&
            insertedValues[required.assinger].length &&
            Array.isArray(insertedValues[required.assinger])
            ? insertedValues[required.assinger]
                .map((value) => {
                  let emote;
                  if (msg.client.emojis.cache.get(value.match(/\d{17,19}/g)?.[0])) {
                    emote = msg.client.emojis.cache.get(value.match(/\d{17,19}/g)?.[0]);
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
        default: {
          if (insertedValues[required.assinger]) {
            let emote;
            if (
              msg.client.emojis.cache.get(
                insertedValues[required.assinger].match(/\d{17,19}/g)?.[0],
              )
            ) {
              emote = msg.client.emojis.cache.get(
                insertedValues[required.assinger].match(/\d{17,19}/g)?.[0],
              );
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
        if (!arg.match(/\d{17,19}/g)?.[0]) return null;
        const emote = msg.client.emojis.cache.get(arg.match(/\d{17,19}/g)?.[0]);
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
          content: msg.client.ch.stp(msg.language.errors.lackingAccess, {
            emotes: noAccessEmotes.join(', '),
          }),
        })
        .then((m) => {
          jobs.scheduleJob(new Date(Date.now() + 10000), async () => {
            m.delete().catch(() => {});
          });
        });
      return false;
    }
    return true;
  },
};
