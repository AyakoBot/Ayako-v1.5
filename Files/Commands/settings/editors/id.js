module.exports = {
  key: ['id', 'ids'],
  requiresMenu: true,
  requiresInteraction: true,
  dataPreparation(msg, editorData, row, res) {
    const { Objects } = editorData;

    const setupQuery = msg.client.constants.commands.settings.setupQueries[msg.file.name];

    res.rows.forEach((element) => {
      const inserted = {
        label: element[setupQuery.ident],
        value: element.id,
      };

      inserted.description = msg.language.addToList;
      inserted.emoji = msg.client.constants.emotes.plusBGID;

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
          return insertedValues[required.assinger];
        }
        case true: {
          return insertedValues[required.assinger]
            .map((value) => {
              return `${value}`;
            })
            .join(', ');
        }
      }
    }
    return null;
  },
};
