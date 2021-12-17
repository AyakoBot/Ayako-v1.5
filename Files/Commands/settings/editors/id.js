module.exports = {
  key: ['id', 'ids'],
  requiresMenu: true,
  requiresInteraction: true,
  dataPreparation(msg, editorData, row, res) {
    const { insertedValues, required, Objects } = editorData;

    const setupQuery = msg.client.constants.commands.settings.setupQueries[msg.file.name];

    res.rows.forEach((element) => {
      const inserted = {
        label: element[setupQuery.ident],
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

    return { Objects, customId: 'id' };
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
          return insertedValues[required.assinger]
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
