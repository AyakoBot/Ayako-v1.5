module.exports = {
  key: ['language', 'languages'],
  requiresMenu: true,
  requiresInteraction: true,
  dataPreparation(msg, editorData) {
    const { insertedValues, required, Objects } = editorData;

    Object.entries(msg.language.languages).forEach(([languageKey, language], i) => {
      const inserted = {
        label: `${language.name} | ${language.status} | ${msg.client.textEmotes.flags[languageKey]}`,
        value: languageKey,
      };

      if (
        Array.isArray(insertedValues[required.assinger]) &&
        insertedValues[required.assinger].includes(i)
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

    return { Objects };
  },
  getSelected(msg, insertedValues, required) {
    if (insertedValues[required.assinger]) {
      switch (required.key.endsWith('s')) {
        case true: {
          return insertedValues[required.assinger] &&
            insertedValues[required.assinger].length &&
            Array.isArray(insertedValues[required.assinger])
            ? insertedValues[required.assinger].map((value) => `${value}`).join(', ')
            : msg.language.none;
        }
        default: {
          return insertedValues[required.assinger]
            ? insertedValues[required.assinger]
            : msg.language.none;
        }
      }
    }
    return null;
  },
};
