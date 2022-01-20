const Discord = require('discord.js');

module.exports = {
  name: 'embedbuilder',
  perm: 2048n,
  dm: true,
  takesFirstArg: false,
  aliases: ['eb'],
  async execute(msg) {
    const embed = await this.builder(msg);
    console.log('returned');
    msg.client.ch.reply(msg, embed);
  },
  async builder(msg, answer, existingEmbed) {
    const lan = msg.language.embedBuilder;
    const finishedEmbed = new Discord.MessageEmbed().setDescription(lan.placeholder);

    const Objects = {
      edit: 'menu',
      category: null,
      data: msg.client.constants.embedBuilder.embed,
      embed: existingEmbed ? existingEmbed : finishedEmbed,
    };

    const m = await replier(
      { msg, answer },
      { embeds: [Objects.embed], components: getComponents(msg, { page: 1, Objects }) },
    );

    return new Promise((resolve) => {
      const buttonsCollector = m.createMessageComponentCollector({ time: 120000 });
      let ended = false;

      buttonsCollector.on('collect', async (interaction) => {
        if (interaction.user.id !== msg.author.id) {
          msg.client.ch.notYours(interaction, msg);
          return;
        }

        buttonsCollector.resetTimer({ time: 120000 });

        switch (interaction.customId) {
          default: {
            buttonsCollector.resetTimer({ time: 180000 });
            await embedButtonsHandler();
            break;
          }
          case 'viewRaw': {
            postCode(Objects, msg, interaction);
            break;
          }
          case 'inheritCode': {
            const embed = new Discord.MessageEmbed().setDescription(lan.inheritCodeDescription);
            interaction.update({ embeds: [Objects.embed, embed] });

            const messageCollector = msg.channel.createMessageCollector({ time: 900000 });
            messageCollector.on('collect', async (message) => {
              if (msg.author.id !== message.author.id) return;

              const code =
                message.content ||
                (await msg.client.ch.convertTxtFileLinkToString(message.attachments.first().url));

              try {
                Objects.embed = new Discord.MessageEmbed(code);
              } catch (e) {
                msg.client.ch.reply(msg, {
                  content: `${e}`,
                });
              }
            });

            messageCollector.on('end', (collected, reason) => {
              if (reason === 'time') {
                ended = true;
                msg.client.ch.collectorEnd(msg);
                postCode(Objects, msg);
              }
            });
            break;
          }
          case 'send': {
            handleSend(msg, interaction, Objects);
            break;
          }
          case 'save': {
            await handleSave(msg, interaction, Objects);
            resolve(Objects.embed);
            break;
          }
        }
      });
      buttonsCollector.on('end', (collected, reason) => {
        if (reason === 'time' && !ended) {
          msg.client.ch.collectorEnd(msg);
          postCode(Objects, msg);
          resolve(null);
        }
      });
    });
  },
};

const replier = async ({ msg, answer }, { embeds, components, content, files }) => {
  components = msg.client.ch.buttonRower(components);

  const warnEmbed = getWarnEmbed(msg);
  if (warnEmbed) embeds.push(warnEmbed);

  embeds[0] = new Discord.MessageEmbed().setDescription(msg.language.commands.embedBuilder.error);

  if (answer && answer.replied) {
    answer.update({
      embeds,
      components,
      content,
      files,
    });
  } else if (msg.m) {
    msg.m.edit({
      embeds,
      components,
      content,
      files,
    });
  } else {
    msg.m = await msg.client.ch.reply(msg, {
      embeds,
      components,
      content,
      files,
    });
  }
};

const getComponents = (msg, { page, Objects }) => {
  const components = [];
  const lan = msg.language.commands.embedBuilder.edit;

  switch (page) {
    default: {
      break;
    }
    case 1: {
      // buttons for , title, url, description, thumbnail, image, footer text, footer icon, color, timestamp
      components.push(
        [
          new Discord.MessageButton()
            .setCustomId('author-name')
            .setLabel(lan['author-name'])
            .setStyle(
              validate('author-name', Objects.embed, msg.client.constants) ? 'secondary' : 'danger',
            ),
          new Discord.MessageButton()
            .setCustomId('author-iconURL')
            .setLabel(lan['author-iconURL'])
            .setStyle('secondary'),
          new Discord.MessageButton()
            .setCustomId('author-url')
            .setLabel(lan['author-url'])
            .setStyle('secondary'),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('title')
            .setLabel(lan.title)
            .setStyle(
              validate('title', Objects.embed, msg.client.constants) ? 'secondary' : 'danger',
            ),
          new Discord.MessageButton().setCustomId('url').setLabel(lan.url).setStyle('secondary'),
          new Discord.MessageButton()
            .setCustomId('description')
            .setLabel(lan.description)
            .setStyle(
              validate('description', Objects.embed, msg.client.constants) ? 'secondary' : 'danger',
            ),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('thumbnail')
            .setLabel(lan.thumbnail)
            .setStyle('secondary'),
          new Discord.MessageButton()
            .setCustomId('image')
            .setLabel(lan.image)
            .setStyle('secondary'),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('footer-text')
            .setLabel(lan['footer-text'])
            .setStyle(
              validate('footer-text', Objects.embed, msg.client.constants) ? 'secondary' : 'danger',
            ),
          new Discord.MessageButton()
            .setCustomId('footer-icon')
            .setLabel(lan['footer-icon'])
            .setStyle('secondary'),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('color')
            .setLabel(lan.color)
            .setStyle('secondary'),
          new Discord.MessageButton()
            .setCustomId('timestamp')
            .setLabel(lan.timestamp)
            .setStyle('secondary'),
        ],
      );
      break;
    }
    case 2: {
      components.push(
        new Discord.MessageButton()
          .setCustomId('add-field')
          .setLabel(lan.addField)
          .setStyle('primary')
          .setDisabled(Objects.embed.fields.length === 25),
        new Discord.MessageButton()
          .setCustomId('remove-field')
          .setLabel(lan.removeField)
          .setStyle('primary')
          .setDisabled(!Objects.embed.fields.length),
        new Discord.MessageSelectMenu()
          .setCustomId('field-select')
          .setMaxValues(1)
          .setMinValues(1)
          .setPlaceholder(lan.fieldsPlaceholder)
          .setDisabled(!!Objects.embed.fields.length)
          .addOptions(
            Objects.embed.fields.length
              ? Objects.embed.fields.map((field, i) => {
                  return {
                    name: field.name.slice(0, 100),
                    description: field.value.slice(0, 100),
                    value: i,
                  };
                })
              : { label: 'placeholder', value: 'placeholder' },
          ),
      );
      break;
    }
    case 3: {
      // inherit code, display code, save, send buttons
      components.push(
        new Discord.MessageButton()
          .setCustomId('inheritCode')
          .setLabel(lan.inheritCode)
          .setStyle('primary'),
        new Discord.MessageButton()
          .setCustomId('viewRaw')
          .setLabel(lan.viewRaw)
          .setStyle('primary'),
        new Discord.MessageButton()
          .setCustomId('save')
          .setLabel(lan.save)
          .setStyle('primary')
          .setDisabled(msg.command.name === this.name),
        new Discord.MessageButton().setCustomId('send').setLabel(lan.send).setStyle('primary'),
      );
      break;
    }
  }

  return components;
};

const validate = (type, embed, constants) => {
  const { limits } = constants.customembeds;

  if (limits.totalOf.includes(type)) {
    let total = 0;

    limits.totalOf.forEach((limit) => {
      switch (limit) {
        default: {
          total += embed[type].length;
          break;
        }
        case 'field-names': {
          embed.fieldNames.forEach((field) => {
            total += field.name.length;
            total += field.value.length;
          });
          break;
        }
        case 'footer-text': {
          total += embed.footer.name.length;
          break;
        }
        case 'author-name': {
          total += embed.author.name.length;
          break;
        }
      }
    });

    if (total > limits.total) return 'total_fail';
  }

  switch (type) {
    default: {
      return embed[type].length <= limits.fields[type];
    }
    case 'author-name': {
      return embed.author.name.length <= limits.fields[type];
    }
    case 'footer-text': {
      return embed.footer.text.length <= limits.fields[type];
    }
    case 'field-names' || 'field-values': {
      const failed = embed.fields
        .map((field, i) => {
          if (field.name.length <= limits.fields[type]) return i;
          if (field.name.length <= limits.fields[type]) return i;
          return undefined;
        })
        .filter((i) => i !== undefined);
      if (failed.lenght) return failed;
      return true;
    }
  }
};

const postCode = (Objects, msg, interaction) => {
  const rawCode = Objects.embed.toJSON();
  if (rawCode.length > 4000) {
    const path = msg.client.ch.txtFileWriter(msg, [rawCode], 'json');

    replier({ msg, answer: interaction }, { files: [path] });
  } else {
    replier({ msg, answer: interaction }, { content: rawCode });
  }
};

const handleSave = async (msg, answer, Objects) => {
  const lan = msg.language.commands.embedBuilder;
  const save = new Discord.MessageButton()
    .setCustomId('save')
    .setLabel(lan.save)
    .setStyle('primary')
    .setDisabled(true);

  const embed = new Discord.MessageEmbed().setDescription(lan.giveName);
  await replier({ msg, answer }, { embeds: [Objects.embed, embed], components: [save] });

  return new Promise((resolve) => {
    let name;
    const messageCollector = msg.channel.createMessageCollector({ time: 60000 });
    const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });

    messageCollector.on('collect', (message) => {
      if (message.author.id !== msg.author.id) return;

      new Discord.MessageButton()
        .setCustomId('save')
        .setLabel(lan.save)
        .setStyle('primary')
        .setDisabled(!message.content.length);

      embed.fields.length = 0;
      embed.addField(msg.language.name, message.content.split(0, 1024));
      name = message.content.split(0, 1024);
    });
    buttonsCollector.on('collect', (interaction) => {
      if (interaction.user.id !== msg.author.id) {
        msg.client.ch.notYours(interaction, msg);
        return;
      }

      const emb = Objects.embed;
      msg.client.ch.query(
        `
      INSERT INTO customembeds (*) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);
      `,
        [
          emb.color,
          emb.title,
          emb.url,
          emb.author.name,
          emb.author.icon_url,
          emb.author.url,
          emb.description,
          emb.thumbnail.url,
          emb.fields.map((f) => f.name),
          emb.fields.map((f) => f.value),
          emb.fields.map((f) => f.inline),
          emb.image.url,
          emb.timestamp,
          emb.footer.text,
          emb.footer.icon_url,
          Date.now(),
          msg.guild.id,
          name,
        ],
      );

      resolve();
    });
    buttonsCollector.on('end', (collected, reason) => {
      if (reason === 'time') {
        postCode(Objects, msg);
        msg.client.ch.collectorEnd(msg);
      }
    });
  });
};

const handleSend = (msg, answer, Objects) => {
  const getButtons = (options) => {
    const next = new Discord.MessageButton()
      .setCustomId('next')
      .setLabel(msg.language.next)
      .setDisabled(options.options.length > 25)
      .setStyle('primary');
    const prev = new Discord.MessageButton()
      .setCustomId('prev')
      .setLabel(msg.language.prev)
      .setDisabled(true)
      .setStyle('primary');
    const send = new Discord.MessageButton()
      .setCustomId('send')
      .setLabel(msg.language.commands.embedBuilder.send)
      .setStyle('primary');
    const channels = new Discord.MessageSelectMenu()
      .setCustomId('channels')
      .addOptions(options.take)
      .setPlaceholder(msg.language.select.select)
      .setMaxValues(options.take.length)
      .setMinValues(1)

    return [prev, next, send, channels];
  };

  const options = {
    page: 1,
    options: msg.guild.channels
      .filter((c) =>
        [
          'GUILD_TEXT',
          'GUILD_NEWS',
          'GUILD_NEWS_THREAD',
          'GUILD_PUBLIC_THEAD',
          'GUILD_PRIVATE_THREAD',
        ].includes(c.type),
      )
      .map((c) => c),
  };
  options.take = options.options.filter((o, i) => i < 25);

  await replier({ msg, answer }, { components: getButtons(options) });
};


// TODO: inherit code form messages (with select of which embed to use if msg has multiple embeds), finish handleSend