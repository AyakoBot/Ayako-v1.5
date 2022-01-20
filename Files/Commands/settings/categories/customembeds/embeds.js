const Discord = require('discord.js');

module.exports = {
  perm: 32n,
  type: 0,
  finished: true,
  setupRequired: false,
  childOf: 'customembeds',
  category: ['none'],
  mmrEmbed(msg, res) {
    const embed = new Discord.MessageEmbed();
    for (let i = 0; i < res.length; i += 1) {
      const r = res[i];

      embed.addFields({
        name: `${msg.language.number}: \`${r.id}\``,
        value: `${msg.language.name}:\n${r.name}`,
        inline: true,
      });
    }
    return embed;
  },
  displayEmbed(msg, r) {
    let currentChars = 0;
    const embed2 = new Discord.MessageEmbed();

    msg.client.constants.customembeds.limits.totalOf.forEach((key) => {
      const chars = r[key];
      if (chars) {
        currentChars += chars;
      }
    });

    const embed = new Discord.MessageEmbed().setDescription(
      `${msg.client.ch.stp(msg.lan.totalLimit, {
        maxLimit: msg.client.constants.customembeds.limits.total,
        currentChars: String(currentChars),
      })}\n\n${msg.client.constants.customembeds.limits.totalOf.map(
        (key) =>
          `${msg.client.ch.stp(`\n${msg.lan.limit}`, {
            name: msg.lan.edit[key].name,
            limit: msg.client.constants.customembeds.limits.fields[key],
          })}`,
      )}`,
    );

    Object.values(msg.lan.edit).forEach((key) => {
      embed.addField(key.name, key.answers, true);
    });

    const errors = [];

    if (r.color) embed2.setColor(r.color);
    if (r.url) embed2.setURL(r.url);
    if (r.thumbnail) embed2.setThumbnail(r.thumbnail);
    if (r.image) embed2.setImage(r.image);
    if (r.timestamp) embed2.setTimestamp(r.timestamp);
    if (r.uniquetimestamp) embed2.setTimestamp(r.uniquetimestamp);

    if (r.title) {
      const limit = msg.client.constants.customembeds.limits.fields.title;
      if (r.title.length <= limit) {
        embed2.setTitle(r.title);
      } else {
        errors.push(
          msg.client.ch.stp(msg.lan.error, {
            name: msg.lan.edit.title.name,
            limit,
            tooMany: limit - r.title.length,
          }),
        );
      }
    }

    if (r['author-name']) {
      const limit = msg.client.constants.customembeds.limits.fields['author-name'];
      if (r['author-name'].length <= limit) {
        embed2.setAuthor({
          name: r['author-name'],
          iconURL: r['author-icon'],
          url: r['author-url'],
        });
      } else {
        errors.push(
          msg.client.ch.stp(msg.lan.error, {
            name: msg.lan.edit['author-name'].name,
            limit,
            tooMany: limit - r['author-name'].length,
          }),
        );
      }
    }

    if (r.description) {
      const limit = msg.client.constants.customembeds.limits.fields.description;
      if (r.description.length <= limit) {
        embed2.setDescription(r.description);
      } else {
        errors.push(
          msg.client.ch.stp(msg.lan.error, {
            name: msg.lan.edit.description.name,
            limit,
            tooMany: limit - r.description.length,
          }),
        );
      }
    }

    if (r['footer-text']) {
      const limit = msg.client.constants.customembeds.limits.fields['footer-text'];
      if (r['footer-text'].length <= limit) {
        embed2.setFooter({ text: r['footer-text'], iconURL: r['footer-iconURL'] });
      } else {
        errors.push(
          msg.client.ch.stp(msg.lan.error, {
            name: msg.lan.edit['footer-text'].name,
            limit,
            tooMany: limit - r['footer-text'].length,
          }),
        );
      }
    }

    if (r['field-names'] && r['field-names'].length) {
      r['field-names'].forEach((fieldName, i) => {
        const fieldValue = r['field-values'][i];
        const fieldInline = r['field-inlines'][i];

        const textLimit = msg.client.constants.customembeds.limits.fields['footer-text'];
        const valueLimit = msg.client.constants.customembeds.limits.fields['footer-values'];

        if (fieldName.length > textLimit) {
          errors.push(
            msg.client.ch.stp(msg.lan.error, {
              name: msg.lan.edit['footer-text'].name,
              limit: textLimit,
              tooMany: textLimit - fieldName.length,
            }),
          );
        }

        if (fieldValue.length > valueLimit) {
          errors.push(
            msg.client.ch.stp(msg.lan.error, {
              name: msg.lan.edit['field-values'].name,
              limit: valueLimit,
              tooMany: valueLimit - r['footer-values'].length,
            }),
          );
        }

        if (fieldValue.length <= valueLimit && r['field-names'][i].length <= textLimit) {
          embed2.addField(fieldName, fieldValue, fieldInline);
        }
      });
    }

    if (
      !r.title &&
      !r['author-name'] &&
      !r.description &&
      !r.thumbnail &&
      !r.image &&
      !r['footer-text'] &&
      !r['footer-iconURL'] &&
      !r['author-iconURL'] &&
      (!r['field-names']?.length || !r['field-values']?.length)
    ) {
      embed2.setDescription(msg.lan.placeholder);
    }

    return [embed, embed2];
  },
  buttons(msg, r) {
    const fields = [];
    const other = [];

    if (r['field-names'] && r['field-names'].length) {
      r['field-names'].forEach((fieldName, i) => {
        const fieldValue = r['field-values'][i];
        const textLimit = msg.client.constants.customembeds.limits.fields['footer-text'];
        const valueLimit = msg.client.constants.customembeds.limits.fields['footer-values'];

        let errors = false;

        if (fieldName.length > textLimit) {
          errors = true;
        }

        if (fieldValue.length > valueLimit) {
          errors = true;
        }

        fields.push({
          label: fieldName.slice(0, 100),
          description: fieldValue.slice(0, 100),
          value: i,
          emoji: errors ? msg.client.constants.emotes.warning : msg.client.constants.emotes.tickBG,
        });
      });
    }

    Object.entries(msg.lan.edit).forEach(([key, value]) => {
      if (key === 'field-names' || key === 'field-values' || key === 'field-inlines') return;

      other.push({
        label: value.name,
        description: value.recommended,
        value: key,
      });
    });

    const fieldsMenu = new Discord.MessageSelectMenu()
      .setCustomId('fields')
      .setOptions(
        fields.length ? fields : [{ label: 'empty', description: 'empty', value: 'empty' }],
      )
      .setMaxValues(1)
      .setMinValues(1)
      .setDisabled(!fields.length)
      .setPlaceholder(msg.lan.fieldsPlaceholder);

    const addField = new Discord.MessageButton()
      .setCustomId('addField')
      .setLabel(msg.lan.addField)
      .setDisabled(fields.length === 25)
      .setStyle('SUCCESS');

    const removeField = new Discord.MessageButton()
      .setCustomId('removeField')
      .setLabel(msg.lan.removeField)
      .setDisabled(!fields.length)
      .setStyle('DANGER');

    const otherMenu = new Discord.MessageSelectMenu()
      .setCustomId('other')
      .setOptions(other)
      .setMaxValues(1)
      .setMinValues(1)
      .setPlaceholder(msg.lan.otherPlaceholder);

    const inheritSettings = new Discord.MessageButton()
      .setCustomId('inheritSettings')
      .setLabel(msg.lan.inheritSettings)
      .setStyle('SECONDARY');

    const viewRaw = new Discord.MessageButton()
      .setCustomId('viewRaw')
      .setLabel(msg.lan.viewRaw)
      .setStyle('SECONDARY');

    const inheritCode = new Discord.MessageButton()
      .setCustomId('inheritCode')
      .setLabel(msg.lan.inheritCode)
      .setStyle('SECONDARY');

    return [
      [fieldsMenu],
      [addField, removeField],
      [otherMenu],
      [inheritSettings],
      [viewRaw, inheritCode],
    ];
  },
};
