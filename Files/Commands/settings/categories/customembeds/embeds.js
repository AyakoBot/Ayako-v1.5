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

    if (r.color) embed2.setColor(r.color);
    if (r.title) embed2.setTitle(r.title);
    if (r.url) embed2.setURL(r.url);
    if (r['author-name']) {
      embed2.setAuthor({
        name: r['author-name'],
        iconURL: r['author-icon'],
        url: r['author-url'],
      });
    }
    if (r.description) embed2.setDescription(r.description);
    if (r.thumbnail) embed2.setThumbnail(r.thumbnail);
    if (r.image) embed2.setImage(r.image);
    if (r.timestamp) embed2.setTimestamp(r.timestamp);
    if (r['footer-text']) {
      embed2.setFooter({ text: r['footer-text'], iconURL: r['footer-iconURL'] });
    }
    if (r.uniquetimestamp) embed2.setTimestamp(r.uniquetimestamp);
    if (r.fields && r.fields.length) {
      r['field-names'].forEach((fieldName, i) => {
        embed2.addField(fieldName, r['field-values'][i], r['field-inlines'][i]);
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
  buttons(msg) {
    return [];
  },
};
