module.exports = {
  key: ['command', 'commands'],
  requiresInteraction: true,
  requiresMenu: true,
  dataPreparation(msg, editorData) {
    const { insertedValues, required, Objects } = editorData;

    const commands = msg.client.commands.map((c) => c.name);

    commands.forEach((element) => {
      const command = msg.client.commands.get(element);

      const inserted = {
        label: command.name,
        value: command.name,
        description: command.aliases.map((alias) => `${alias}`).join(', '),
      };

      if (
        Array.isArray(insertedValues[required.assinger]) &&
        insertedValues[required.assinger].includes(command.name)
      ) {
        inserted.description = msg.language.removeFromList;
        inserted.emoji = msg.client.constants.emotes.minusBGID;
      } else {
        inserted.description = msg.language.addToList;
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
