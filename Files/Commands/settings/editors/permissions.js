const Discord = require('discord.js');

module.exports = {
  key: ['permissions'],
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

      if (new Discord.BitField(Number(insertedValues[required.assinger])).has(Number(bits))) {
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
  interactionHandler(msgData, passObject, insertedValues, required) {
    const { msg, answer } = msgData;

    if (!insertedValues[required.assinger]) {
      insertedValues[required.assinger] = Number(answer.values[0]);
      answer.values.shift();
    }

    const bitField = new Discord.BitField(insertedValues[required.assinger]);

    answer.values.forEach((value) => {
      const val = Number(value);

      if (bitField.has(val)) {
        insertedValues[required.assinger] = Number(insertedValues[required.assinger]) - Number(val);
      } else {
        insertedValues[required.assinger] = Number(insertedValues[required.assinger]) + Number(val);
      }
    });

    const selected = this.getSelected(msg, insertedValues, required);

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
  getSelected(msg, insertedValues, required) {
    if (insertedValues[required.assinger]) {
      return insertedValues[required.assinger]
        ? msg.client.ch
            .permCalc(insertedValues[required.assinger], msg.language)
            .map((c) => `\`${c}\``)
            .join(', ')
        : msg.language.none;
    }
    return null;
  },
};
