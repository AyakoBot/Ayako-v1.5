module.exports = {
  key: ['embed'],
  requiresMenu: true,
  requiresInteraction: true,
  async dataPreparation(msg, editorData) {
    const { insertedValues, required, Objects } = editorData;

    const embeds = await getEmbeds(msg);

    embeds.forEach((embed) => {
      const inserted = {
        label: `${embed.name}`,
        value: `${embed.uniquetimestamp}`,
      };

      if (
        Array.isArray(insertedValues[required.assinger]) &&
        insertedValues[required.assinger].includes(embed.uniquetimestamp)
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
  async getSelected(msg, insertedValues, required) {
    if (insertedValues[required.assinger]) {
      switch (required.key.endsWith('s')) {
        default: {
          const returned = insertedValues[required.assinger]
            ? await getEmbedName(msg, insertedValues[required.assinger])
            : msg.language.none;

          return returned;
        }
        case true: {
          return Promise.all(
            insertedValues[required.assinger] &&
              insertedValues[required.assinger].length &&
              Array.isArray(insertedValues[required.assinger])
              ? insertedValues[required.assinger]
                  .map((value) => {
                    return `${getEmbedName(msg, value)}`;
                  })
                  .join(', ')
              : msg.language.none,
          );
        }
      }
    }
    return null;
  },
};

const getEmbedName = async (msg, uniquetimestamp) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM customembeds WHERE guildid = $1 AND uniquetimestamp = $2;`,
    [msg.guild.id, uniquetimestamp],
  );
  if (res && res.rowCount) return res.rows[0].name;
  return msg.language.none;
};

const getEmbeds = async (msg) => {
  const res = await msg.client.ch.query(`SELECT * FROM customembeds WHERE guildid = $1;`, [
    msg.guild.id,
  ]);
  if (res && res.rowCount) return res.rows;
  return msg.language.none;
};
