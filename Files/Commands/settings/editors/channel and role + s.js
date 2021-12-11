/* eslint-disable no-param-reassign */
const Discord = require('discord.js');

module.exports = {
  key: ['channel', 'channels', 'role', 'roles'],
  requiresInteraction: true,
  dataPreparation(msg, editorData) {
    const { insertedValues, required } = editorData;

    if (msg.row) {
      insertedValues[required.key] = msg.row[required.key];
    }

    const cacheName = required.key.endsWith('s') ? required.key : `${required.key}s`;
    const cache = msg.guild[cacheName].cache
      .sort((a, b) => a.rawPosition - b.rawPosition)
      .filter((value) => {
        if (cacheName === 'roles') {
          return value;
        }

        if (cacheName === 'channels') {
          const validChannelTypes = [
            'GUILD_TEXT',
            'GUILD_NEWS',
            'GUILD_NEWS_THREAD',
            'GUILD_PUBLIC_THREAD',
            'GUILD_PRIVATE_THREAD',
          ];

          if (validChannelTypes.inlcudes(value.type)) {
            return value;
          }
        }
        return null;
      });

    const Objects = {
      options: [],
      take: [],
      page: 1,
    };

    cache.forEach((element) => {
      const inserted = {
        label: element.name,
        value: element.id,
      };

      if (insertedValues[required.key].includes(element.id)) {
        inserted.description = msg.language.removeFromList;
        inserted.emoji = msg.client.constants.emotes.crossBGID;
      } else {
        inserted.description = msg.language.addToList;
        inserted.emoji = msg.client.constants.emotes.tickBGID;
      }

      Objects.options.push(inserted);
    });

    for (let i = 0; i < 25 && i < Objects.options.length; i += 1) {
      Objects.take.push(Objects.options[i]);
    }

    return { cache, Objects, cacheName };
  },
  buttons(msg, preparedData, insertedValues, required) {
    const { Objects, cacheName } = preparedData;

    let doneDisabled = true;
    if (Array.isArray(insertedValues[required.key])) {
      doneDisabled = insertedValues[required.key].length === 0;
    } else {
      doneDisabled = !!insertedValues[required.key];
    }

    const menu = new Discord.MessageSelectMenu()
      .setCustomId(cacheName)
      .addOptions(Objects.take)
      .setMinValues(1)
      .setMaxValues(cacheName.includes('s') ? Objects.take.length : 1)
      .setPlaceholder(msg.language.select[cacheName].select);
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

    return [[menu], [next, prev], [back, done]];
  },
  interactionHandler(msgData, preparedData, insertedValues) {
    const { msg, embed, menu } = msgData;
    const { Objects, cacheName } = preparedData;

    const selected = insertedValues[cacheName]
      .map((value) => {
        if (cacheName === 'channels') {
          return `<#${value.id}>`;
        }
        if (cacheName === 'roles') {
          return `<@&${value.id}>`;
        }
        return null;
      })
      .join(', ');

    const returnEmbed = new Discord.MessageEmbed()
      .addField(' \u200b', embed.description)
      .setDescription(
        `${msg.language.selected}:\n${selected.length ? selected : msg.language.none}`,
      );

    Objects.options.forEach((option) => {
      if (insertedValues[cacheName].includes(option.value)) {
        option.emoji = msg.client.constants.emotes.crossBGID;
        option.description = msg.language.removeFromList;
      } else {
        option.emoji = msg.client.constants.emotes.tickBGID;
        option.description = msg.language.addToList;
      }
    });

    const returnMenu = new Discord.MessageSelectMenu(menu).setOptions(Objects.take);

    return { returnEmbed, returnMenu };
  },
};
