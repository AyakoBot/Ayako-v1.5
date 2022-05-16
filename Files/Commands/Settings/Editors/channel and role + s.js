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
  getSelected(msg, insertedValues, required, { cacheName }) {
    if (insertedValues[required.assinger]) {
      if (insertedValues[required.assinger]) {
        switch (required.key.endsWith('s')) {
          case true: {
            if (cacheName === 'roles') {
              return Array.isArray(insertedValues[required.assinger])
                ? insertedValues[required.assinger].map((value) => `<@&${value}>`).join(', ')
                : msg.language.none;
            }
            if (cacheName === 'channels') {
              return Array.isArray(insertedValues[required.assinger])
                ? insertedValues[required.assinger].map((value) => `<#${value}>`).join(', ')
                : msg.language.none;
            }
            return msg.language.none;
          }
          default: {
            if (cacheName === 'roles') {
              return Number.isNaN(+insertedValues[required.assinger])
                ? msg.language.none
                : `<@&${insertedValues[required.assinger]}>`;
            }
            if (cacheName === 'channels') {
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