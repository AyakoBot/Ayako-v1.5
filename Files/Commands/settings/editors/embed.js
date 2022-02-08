const Discord = require('discord.js');

module.exports = {
  key: ['embed'],
  requiresMenu: true,
  requiresInteraction: true,
  dataPreparation: async (msg, editorData) => {
    const { insertedValues, required, Objects } = editorData;

    const embeds = await getEmbeds(msg);

    if (embeds.length) {
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
    }

    for (let i = 0; i < 25 && i < Objects.options.length; i += 1) {
      Objects.take.push(Objects.options[i]);
    }

    return { Objects };
  },
  getSelected: async (msg, insertedValues, required) => {
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
  buttons: async (msg, preparedData, insertedValues, required, row) => {
    const { Objects } = preparedData;
    const returnedButtons = [];

    let doneDisabled = false;
    let isString = true;

    if (required.assinger !== 'id' && Object.keys(row).includes(required.assinger)) {
      const typeRes = await msg.client.ch.query(
        `SELECT pg_typeof(${required.assinger}) FROM ${
          msg.client.constants.commands.settings.tablenames[msg.file.name][0]
        } LIMIT 1;`,
      );
      if (typeRes && typeRes.rowCount > 0) {
        isString = !typeRes.rows[0].pg_typeof.endsWith('[]');
      }
    } else {
      isString = true;
    }

    if (!isString) {
      doneDisabled =
        msg.client.ch.arrayEquals(insertedValues[required.assinger], row[required.assinger]) ||
        (insertedValues[required.assinger] &&
          !insertedValues[required.assinger].length &&
          required.required);
    } else {
      doneDisabled =
        !insertedValues[required.assinger] ||
        insertedValues[required.assinger] === msg.language.none;
    }

    const menu = new Discord.MessageSelectMenu()
      .setCustomId(required.key)
      .addOptions(
        Objects.take.length ? Objects.take : { label: 'placeholder', value: 'placeholder' },
      )
      .setDisabled(!Objects.take.length)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder(msg.language.select[required.key].select);
    const next = new Discord.MessageButton()
      .setCustomId('next')
      .setLabel(msg.language.next)
      .setDisabled(
        Objects.page === Math.ceil(Objects.options.length / 25) || !Objects.options.length,
      )
      .setStyle('SUCCESS');
    const prev = new Discord.MessageButton()
      .setCustomId('prev')
      .setLabel(msg.language.prev)
      .setDisabled(Objects.page === 1 || !Objects.options.length)
      .setStyle('DANGER');

    returnedButtons.push([menu], [prev, next]);

    const done = new Discord.MessageButton()
      .setCustomId('done')
      .setLabel(msg.language.done)
      .setDisabled(doneDisabled)
      .setStyle('PRIMARY');

    const create = new Discord.MessageButton()
      .setCustomId('create')
      .setLabel(msg.language.createNew)
      .setStyle('SUCCESS');

    returnedButtons.push([done, create]);

    return returnedButtons;
  },
  async interactionHandler(msgData, passObject, insertedValues, required) {
    const { msg, interaction } = msgData;

    const options = Object.entries(msg.language.commands.settings[msg.file.name].options);

    const { embed, answer, name } = await msg.client.ch.embedBuilder(msg, interaction, options);

    if (!insertedValues[required.assinger]) {
      insertedValues[required.assinger] = Number(answer.values[0]);
      answer.values.shift();
    }

    const selected = module.exports.getSelected(msg, insertedValues, required);

    const returnEmbed = new Discord.MessageEmbed().setDescription(
      `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
    );

    passObject.Objects.options.forEach((option) => {
      if (new Discord.BitField(insertedValues[required.assinger]).has(Number(option.value))) {
        option.emoji = msg.client.constants.emotes.minusBGID;
      } else {
        option.emoji = msg.client.constants.emotes.plusBGID;
      }
    });

    return { returnEmbed };
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
  return [];
};
