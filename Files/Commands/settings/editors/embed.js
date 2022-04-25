const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  key: ['embed'],
  requiresMenu: true,
  requiresInteraction: true,
  dataPreparation: async (msg, editorData) => {
    const { insertedValues, required, Objects } = editorData;

    const embeds = await getEmbeds(msg);

    if (embeds.length) {
      embeds.forEach((embed) => {
        const inserted = new Builders.UnsafeSelectMenuOptionBuilder()
          .setLabel(`${embed.name}`)
          .setValue(`${embed.uniquetimestamp}`);

        if (
          Array.isArray(insertedValues[required.assinger]) &&
          insertedValues[required.assinger].includes(embed.uniquetimestamp)
        ) {
          inserted.emoji = msg.client.objectEmotes.minusBG;
        } else {
          inserted.emoji = msg.client.objectEmotes.plusBG;
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
        case true: {
          return Promise.all(
            insertedValues[required.assinger] &&
              insertedValues[required.assinger].length &&
              Array.isArray(insertedValues[required.assinger])
              ? insertedValues[required.assinger]
                  .map((value) => `${getEmbedName(msg, value)}`)
                  .join(', ')
              : msg.language.none,
          );
        }
        default: {
          const returned = insertedValues[required.assinger]
            ? await getEmbedName(msg, insertedValues[required.assinger])
            : msg.language.none;

          return returned;
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

    const menu = new Builders.UnsafeSelectMenuBuilder()
      .setCustomId(required.key)
      .addOptions(
        ...(Objects.take.length
          ? Objects.take
          : new Builders.UnsafeSelectMenuOptionBuilder()
              .setLabel('placeholder')
              .setValue('placeholder')),
      )
      .setDisabled(!Objects.take.length)
      .setMinValues(1)
      .setMaxValues(1)
      .setPlaceholder(msg.language.select[required.key].select);
    const next = new Builders.UnsafeButtonBuilder()
      .setCustomId('next')
      .setLabel(msg.language.next)
      .setDisabled(
        Objects.page === Math.ceil(Objects.options.length / 25) || !Objects.options.length,
      )
      .setStyle(Discord.ButtonStyle.Primary);
    const prev = new Builders.UnsafeButtonBuilder()
      .setCustomId('prev')
      .setLabel(msg.language.prev)
      .setDisabled(Objects.page === 1 || !Objects.options.length)
      .setStyle(Discord.ButtonStyle.Danger);

    returnedButtons.push([menu], [prev, next]);

    const done = new Builders.UnsafeButtonBuilder()
      .setCustomId('done')
      .setLabel(msg.language.done)
      .setDisabled(doneDisabled)
      .setStyle(Discord.ButtonStyle.Primary);

    const create = new Builders.UnsafeButtonBuilder()
      .setCustomId('create')
      .setLabel(msg.language.createNew)
      .setStyle(Discord.ButtonStyle.Primary);

    returnedButtons.push([done, create]);

    return returnedButtons;
  },
  async interactionHandler(msgData, passObject, insertedValues, required, row, collectors) {
    const { msg, answer: interaction } = msgData;

    switch (interaction.customId) {
      case 'embed': {
        [insertedValues[required.assinger]] = interaction.values;

        const selected = await module.exports.getSelected(msg, insertedValues, required);

        const returnEmbed = new Builders.UnsafeEmbedBuilder().setDescription(
          `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
        );
        return { returnEmbed };
      }
      default: {
        if (!msg.language.commands.settings[msg.file.name].options) {
          throw new Error('Missing Options Language Definition');
        }

        const options = Object.entries(msg.language.commands.settings[msg.file.name].options);

        msg.m.reactions.removeAll().catch(() => {});
        collectors.forEach((c) => c.stop());

        const fin = await msg.client.ch.embedBuilder(msg, interaction, options);

        if (!fin) return null;
        const { answer } = fin;

        return { answer, recall: true };
      }
    }
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
