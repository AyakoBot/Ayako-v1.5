module.exports = {
  key: ['minute', 'minutes', 'second', 'seconds', 'number', 'numbers'],
  requiresMenu: true,
  requiresInteraction: true,
  dataPreparation(msg, editorData) {
    const { insertedValues, required, Objects } = editorData;

    const numbers = new Array(999).fill(null);

    numbers.forEach((element, i) => {
      let inserted;

      if (msg.file[required.assinger] && Array.isArray(msg.file[required.assinger])) {
        if (i > msg.file[required.assinger].length - 1) return;

        inserted = {
          label: `${msg.file[required.assinger][i]}`,
          value: `${msg.file[required.assinger][i]}`,
        };
      } else {
        inserted = {
          label: `${i}`,
          value: `${i}`,
        };
      }

      if (
        Array.isArray(insertedValues[required.assinger]) &&
        insertedValues[required.assinger].includes(i)
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

    return { Objects };
  },
  getSelected(msg, insertedValues, required) {
    if (insertedValues[required.assinger]) {
      switch (required.key.endsWith('s')) {
        default: {
          return insertedValues[required.assinger]
            ? insertedValues[required.assinger]
            : msg.language.none;
        }
        case true: {
          return insertedValues[required.assinger] &&
            insertedValues[required.assinger].length &&
            Array.isArray(insertedValues[required.assinger])
            ? insertedValues[required.assinger]
                .map((value) => {
                  return `${value}`;
                })
                .join(', ')
            : msg.language.none;
        }
      }
    }
    return null;
  },
};
