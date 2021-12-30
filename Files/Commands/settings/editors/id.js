module.exports = {
  key: ['uniquetimestamp'],
  requiresMenu: true,
  requiresInteraction: true,
  dataPreparation(msg, editorData, row, res) {
    const { insertedValues, required, Objects } = editorData;

    const setupQuery = msg.client.constants.commands.settings.setupQueries[msg.file.name];

    res.rows.forEach((element) => {
      const inserted = {
        label: `${element.id} | ${getIdentifier(msg, setupQuery, element)}`,
        value: `${element.id}`,
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
      return Number.isNaN(+insertedValues[required.assinger])
        ? msg.language.none
        : insertedValues[required.assinger];
    }
    return null;
  },
};

const getIdentifier = (msg, settingsConstant, row) => {
  let identifier;

  switch (settingsConstant.identType) {
    default: {
      identifier = row[settingsConstant.ident] ? row[settingsConstant.ident] : '--';
      break;
    }
    case 'role': {
      const role = msg.guild.roles.cache.get(row[settingsConstant.ident]);
      if (role) {
        identifier = role.name.replace(/\W{2}/gu, '');
      } else {
        identifier = '--';
      }
      break;
    }
    case 'channel': {
      const channel = msg.guild.channels.cache.get(row[settingsConstant.ident]);
      if (channel) {
        identifier = channel.name.replace(/\W{2}/gu, '');
      } else {
        identifier = '--';
      }
      break;
    }
  }

  return identifier;
};
