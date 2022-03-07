const Discord = require('discord.js');

// fix channel rules

module.exports = {
  key: ['permissions'],
  requiresMenu: true,
  requiresInteraction: true,
  dataPreparation(msg, editorData) {
    const { insertedValues, required, Objects } = editorData;
    const permissions = [];

    if (msg.file[required.assinger] && required.assinger === 'rules') {
      const flags = Object.entries(msg.file[required.assinger].Flags);
      flags.forEach(([, bits]) => {
        msg.client.ch.channelRuleCalc(bits, msg.language).forEach((perm) => {
          permissions.push({ perm, bits: Number(bits) });
        });
      });
    } else {
      const flags = Object.entries(Discord.Permissions.Flags);
      flags.forEach(([, bits]) => {
        msg.client.ch.permCalc(bits, msg.language).forEach((perm) => {
          permissions.push({ perm, bits: Number(bits) });
        });
      });
    }

    permissions.forEach(({ perm, bits }) => {
      const inserted = {
        label: perm,
        value: `${bits}`,
      };

      if (new Discord.BitField(Number(insertedValues[required.assinger])).has(Number(bits))) {
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

    const returnEmbed = new Discord.UnsafeEmbed().setDescription(
      `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
    );

    passObject.Objects.options.forEach((option) => {
      if (new Discord.BitField(insertedValues[required.assinger]).has(Number(option.value))) {
        option.emoji = msg.client.objectEmotes.minusBG.id;
      } else {
        option.emoji = msg.client.objectEmotes.plusBG.id;
      }
    });

    return { returnEmbed };
  },
  getSelected(msg, insertedValues, required) {
    if (insertedValues[required.assinger]) {
      switch (required.assinger) {
        case 'rules': {
          return insertedValues[required.assinger]
            ? msg.client.ch
                .channelRuleCalc(insertedValues[required.assinger], msg.language)
                .map((c) => `\`${c}\``)
                .join(', ')
            : msg.language.none;
        }
        default: {
          return insertedValues[required.assinger]
            ? msg.client.ch
                .permCalc(insertedValues[required.assinger], msg.language)
                .map((c) => `\`${c}\``)
                .join(', ')
            : msg.language.none;
        }
      }
    }
    return null;
  },
};
