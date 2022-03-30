module.exports = {
  key: ['command', 'commands'],
  requiresInteraction: true,
  requiresMenu: true,
  dataPreparation(msg, editorData) {
    const { insertedValues, required, Objects } = editorData;

    msg.client.commands.forEach((command) => {
      const desc = command.aliases?.length
        ? command.aliases.map((alias) => `${alias}`).join(', ')
        : undefined;

      const inserted = {
        label: command.name,
        value: command.name,
        description: desc?.length > 100 ? desc.slice(0, 100) : desc,
      };

      if (
        Array.isArray(insertedValues[required.assinger]) &&
        insertedValues[required.assinger].includes(command.name)
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
