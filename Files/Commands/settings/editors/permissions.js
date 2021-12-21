const Discord = require('discord.js');

module.exports = {
  key: ['permissions', 'permission'],
  requiresMenu: true,
  requiresInteraction: true,
  dataPreparation(msg, editorData) {
    const { insertedValues, required, Objects } = editorData;

    const perms = Object.entries(Discord.Permissions.FLAGS);
    const permissions = [];
    perms.forEach(([, bits]) => {
      msg.client.ch.permCalc(bits, msg.language).forEach((perm) => {
        permissions.push({ perm, bits: Number(bits) });
      });
    });

    permissions.forEach(({ perm, bits }) => {
      const inserted = {
        label: perm,
        value: `${bits}`,
      };

      if (
        Array.isArray(insertedValues[required.assinger]) &&
        insertedValues[required.assinger].includes(bits)
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
            ? msg.client.ch
                .permCalc(insertedValues[required.assinger], msg.language)
                .map((c) => `\`${c}\``)
                .join(', ')
            : msg.language.none;
        }
        case true: {
          return insertedValues[required.assinger]
            .map((value) => {
              return msg.client.ch
                .permCalc(value, msg.language)
                .map((c) => `\`${c}\``)
                .join(', ');
            })
            .join(', ');
        }
      }
    }
    return null;
  },
};
