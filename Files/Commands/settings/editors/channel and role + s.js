module.exports = {
  key: ['channel', 'channels', 'role', 'roles'],
  requiresInteraction: true,
  requiresMenu: true,
  dataPreparation(msg, editorData) {
    const { insertedValues, required, Objects } = editorData;

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
        Array.isArray(insertedValues[required.assinger]) &&
        insertedValues[required.assinger].includes(element.id)
      ) {
        inserted.emoji = msg.client.constants.emotes.minusBGID;
      } else {
        inserted.emoji = msg.client.constants.emotes.plusBGID;
      }

      Objects.options.push(inserted);
    });

    for (let i = 0; i < 25 && i < Objects.options.length; i += 1) {
      Objects.take.push(Objects.options[i]);
    }

    return { cache, Objects, cacheName };
  },
  getSelected(msg, insertedValues, required, { cacheName }) {
    if (insertedValues[required.assinger]) {
      if (insertedValues[required.assinger]) {
        switch (required.key.endsWith('s')) {
          default: {
            if (cacheName === 'role') {
              return `<@&${insertedValues[required.assinger]}>`;
            }
            if (cacheName === 'channel') {
              return `<#${insertedValues[required.assinger]}>`;
            }
            return null;
          }
          case true: {
            if (cacheName === 'roles') {
              return insertedValues[required.assinger]
                ? insertedValues[required.assinger]
                    .map((value) => {
                      return `<@&${value}>`;
                    })
                    .join(', ')
                : msg.language.none;
            }
            if (cacheName === 'channels') {
              return insertedValues[required.assinger]
                ? insertedValues[required.assinger]
                    .map((value) => {
                      return `<#${value}>`;
                    })
                    .join(', ')
                : msg.language.none;
            }
            return null;
          }
        }
      }
    }
    return null;
  },
};
