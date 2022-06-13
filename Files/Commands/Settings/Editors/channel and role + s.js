const stringSimilarity = require('string-similarity');
const Builders = require('@discordjs/builders');

module.exports = {
  key: ['channel', 'channels', 'role', 'roles'],
  requiresInteraction: true,
  requiresMenu: true,
  dataPreparation(msg, editorData) {
    const { insertedValues, required, Objects } = editorData;

    const cacheName = required.key.endsWith('s') ? required.key : `${required.key}s`;
    const cache = msg.guild[cacheName].cache
      .filter((r) => !r.managed)
      .sort((o, i) => {
        if (cacheName === 'roles') {
          return Number(i.rawPosition) - Number(o.rawPosition);
        }
        return Number(o.rawPosition) - Number(i.rawPosition);
      })
      .filter((value) => {
        if (cacheName === 'roles') {
          return value;
        }

        if (cacheName === 'channels') {
          const validChannelTypes = [0, 5, 10, 11, 12];

          if (validChannelTypes.includes(value.type)) {
            return value;
          }
        }
        return null;
      });

    cache.forEach((element) => {
      const inserted = {
        label: element.name,
        value: element.id,
      };

      if (
        (Array.isArray(insertedValues[required.assinger]) &&
          insertedValues &&
          insertedValues[required.assinger].includes(element.id)) ||
        insertedValues[required.assinger] === element.id
      ) {
        inserted.emoji = msg.client.objectEmotes.minusBG;
      } else {
        inserted.emoji = msg.client.objectEmotes.plusBG;
      }

      Objects.options.push(inserted);
    });

    for (let i = 0; i < 25 && i < Objects.options.length; i += 1) {
      Objects.take.push(Objects.options[i]);
    }

    return { cache, Objects, cacheName };
  },
  interactionType: 'message',
  async messageHandler(msgData, insertedValues, required) {
    const { msg, message } = msgData;

    const fail = (arg) => {
      let text;
      if (Array.isArray(arg)) {
        text = arg.map((c) => c).join(', ');
      } else text = arg;

      const lan = msg.lanSettings.fails[required.key];
      const embed = new Builders.UnsafeEmbedBuilder()
        .setColor(msg.client.constants.error)
        .setDescription(`${lan}\n${text}`);
      msg.client.ch.reply(message, { embeds: [embed], ephemeral: true });
    };

    switch (required.key) {
      case 'roles':
      case 'role': {
        const push = (id) => {
          if (insertedValues[required.assinger]) {
            if (insertedValues[required.assinger].includes(id)) {
              insertedValues[required.assinger].splice(
                insertedValues[required.assinger].indexOf(id),
                1,
              );
            } else {
              insertedValues[required.assinger].push(id);
            }
          } else {
            insertedValues[required.assinger] = [id];
          }
        };

        let role = msg.guild.roles.cache.get(message.content);
        if (role) {
          push(role.id);
        } else {
          role = msg.guild.roles.cache.get(message.content.replace(/\D+/g, ''));
          if (role) {
            push(role.id);
          } else {
            role = msg.guild.roles.cache.find(
              (r) =>
                r.name.toLowerCase() ===
                stringSimilarity.findBestMatch(
                  message.content.toLowerCase(),
                  msg.guild.roles.cache.map((roles) => roles.name.toLowerCase()),
                ).bestMatch.target,
            );
            if (role) {
              push(role.id);
            } else fail(message.content);
          }
        }
        break;
      }
      case 'channels':
      case 'channel': {
        const push = (id) => {
          if (insertedValues[required.assinger]) {
            if (insertedValues[required.assinger].includes(id)) {
              insertedValues[required.assinger].splice(
                insertedValues[required.assinger].indexOf(id),
                1,
              );
            } else {
              insertedValues[required.assinger].push(id);
            }
          } else {
            insertedValues[required.assinger] = [id];
          }
        };

        let channel = msg.guild.channels.cache.get(message.content);
        if (channel) {
          push(channel.id);
        } else {
          channel = msg.guild.channels.cache.get(message.content.replace(/\D+/g, ''));
          if (channel) {
            push(channel.id);
          } else {
            channel = msg.guild.channels.cache.find(
              (r) =>
                r.name.toLowerCase() ===
                stringSimilarity.findBestMatch(
                  message.content.toLowerCase(),
                  msg.guild.channels.cache.map((channels) => channels.name.toLowerCase()),
                ).bestMatch.target,
            );
            if (channel) {
              push(channel.id);
            } else fail(message.content);
          }
        }
        break;
      }
      default: {
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
      if (insertedValues[required.assinger]) {
        switch (required.key.endsWith('s')) {
          case true: {
            if (required.key === 'roles') {
              return Array.isArray(insertedValues[required.assinger])
                ? insertedValues[required.assinger].map((value) => `<@&${value}>`).join(', ')
                : msg.language.none;
            }
            if (required.key === 'channels') {
              return Array.isArray(insertedValues[required.assinger])
                ? insertedValues[required.assinger].map((value) => `<#${value}>`).join(', ')
                : msg.language.none;
            }
            return msg.language.none;
          }
          default: {
            if (required.key === 'role') {
              return Number.isNaN(+insertedValues[required.assinger])
                ? msg.language.none
                : `<@&${insertedValues[required.assinger]}>`;
            }
            if (required.key === 'channel') {
              return Number.isNaN(+insertedValues[required.assinger])
                ? msg.language.none
                : `<#${insertedValues[required.assinger]}>`;
            }
            return msg.language.none;
          }
        }
      }
    }
    return msg.language.none;
  },
};
