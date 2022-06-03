const fs = require('fs');

module.exports = {
  key: ['command', 'commands'],
  requiresInteraction: true,
  requiresMenu: true,
  dataPreparation(msg, editorData) {
    const { insertedValues, required, Objects } = editorData;

    getAllCommands(msg)
      .filter(
        (c) =>
          !c.unfinished &&
          (!c.thisGuildOnly || c.thisGuildOnly.includes(msg.guild?.id)) &&
          c.type !== 'owner',
      )
      .forEach((command) => {
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

    getAllSlashCommands()
      .filter(
        (c) =>
          !c.unfinished &&
          (!c.thisGuildOnly || c.thisGuildOnly.includes(msg.guild?.id)) &&
          c.type !== 'owner' &&
          !c.notACommand,
      )
      .forEach((command) => {
        const inserted = {
          label: command.name,
          value: command.name,
          description: `(${msg.language.slashCommand})`,
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

const getAllCommands = (msg) => {
  const dir = `${require.main.path}/Files/Commands`;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.js'))
    .map((c) => require(`${dir}/${c}`))
    .filter(
      (c) => c.unfinished !== true && (!c.thisGuildOnly || c.thisGuildOnly.includes(msg.guild?.id)),
    );

  return files;
};

const getAllSlashCommands = () => {
  const dir = `${require.main.path}/Files/Interactions/SlashCommands`;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.js'))
    .map((c) => require(`${dir}/${c}`));

  return files;
};
