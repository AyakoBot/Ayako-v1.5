const Discord = require('discord.js');

const testReg = /discord\.com\/channels\//gi;
const colorReg = /[0-9A-Fa-f]{6}/g;

module.exports = {
  name: 'embedbuilder',
  perm: 2048n,
  dm: false,
  takesFirstArg: false,
  aliases: ['eb'],
  async execute(msg) {
    const returned = await this.builder(msg);

    if (!returned) return;

    const { embed, answer } = returned;
    if (embed) {
      replier({ msg, answer }, { embeds: [embed], components: [] });
    }
  },
  async builder(msg, answer, existingEmbed, page) {
    if (typeof page !== 'number') page = 1;

    const lan = msg.language.commands.embedbuilder;

    const Objects = {
      edit: 'menu',
      category: null,
      embed: existingEmbed || new Discord.MessageEmbed(),
      page: page || 1,
    };

    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(lan.chooseTheEdit)
      .setColor(msg.client.ch.colorSelector(msg.guild.me));

    await replier(
      { msg, answer },
      { embeds: [embed], components: getComponents(msg, { page, Objects }), files: [] },
      Objects,
    );

    const returned = await handleBuilderButtons({ msg, answer }, Objects, lan, embed);

    return returned;
  },
};

const replier = async ({ msg, answer }, { embeds, components, content, files }, Objects) => {
  let finishedEmbed;
  if (Objects) {
    if (
      !Objects.embed.title &&
      (!Objects.embed.author || !Objects.embed.author.name) &&
      !Objects.embed.description &&
      (!Objects.embed.thumbnail || !Objects.embed.thumbnail.url) &&
      !Objects.embed.fields.length &&
      (!Objects.embed.image || !Objects.embed.image.url) &&
      (!Objects.embed.footer || !Objects.embed.footer.text)
    ) {
      finishedEmbed = new Discord.MessageEmbed()
        .setDescription(msg.language.commands.embedbuilder.warns.noValue)
        .setColor('FF0000')
        .setThumbnail(msg.client.constants.commands.embedbuilder.error);

      const saveButton =
        components && components[components.length - 1] ? components[components.length - 1][0] : {};
      if (saveButton.customId === 'save') {
        saveButton.setDisabled(true);
      }
    } else {
      finishedEmbed = Objects.embed;
    }

    if (components) components = msg.client.ch.buttonRower(components);

    if (embeds?.length) embeds = [finishedEmbed, ...embeds];
    else embeds = [finishedEmbed];
  }

  if (answer && !answer.replied) {
    await answer.update({
      embeds,
      components,
      content,
      files,
    });
  } else if (msg.m) {
    await msg.m.edit({
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

const validate = (type, embed, constants) => {
  const { limits } = constants.customembeds;

  if (limits.totalOf.includes(type)) {
    let total = 0;

    limits.totalOf.forEach((limit) => {
      switch (limit) {
        default: {
          total += embed[type]?.length;
          break;
        }
        case 'field-names': {
          embed.fieldNames?.forEach((field) => {
            total += field.name.length;
            total += field.value.length;
          });
          break;
        }
        case 'footer-text': {
          total += embed.footer?.name?.length;
          break;
        }
        case 'author-name': {
          total += embed.author?.name?.length;
          break;
        }
      }
    });

    if (total > limits.total) return 'total_fail';
  }

  switch (type) {
    default: {
      return embed[type]?.length >= limits.fields[type];
    }
    case 'author-name': {
      return embed.author?.name?.length >= limits.fields[type];
    }
    case 'footer-text': {
      return embed.footer?.text?.length >= limits.fields[type];
    }
    case 'field-names' || 'field-values': {
      const failed = embed.fields
        ?.map((field, i) => {
          if (field.name.length >= limits.fields[type]) return i;
          if (field.name.length >= limits.fields[type]) return i;
          return undefined;
        })
        .filter((i) => i !== undefined);
      if (failed.lenght) return failed;
      return true;
    }
  }
};

const getComponents = (msg, { page, Objects }, editing) => {
  const components = [];
  const lan = msg.language.commands.embedbuilder.edit;
  const baseLan = msg.language.commands.embedbuilder;

  switch (page) {
    default: {
      break;
    }
    case 1: {
      let authorNameStyle = Objects.embed.author?.name ? 'SECONDARY' : 'PRIMARY';
      authorNameStyle = validate('author-name', Objects.embed, msg.client.constants)
        ? 'DANGER'
        : authorNameStyle;
      if (editing === 'author-name') authorNameStyle = 'SUCCESS';

      let titleStyle = Objects.embed.title ? 'SECONDARY' : 'PRIMARY';
      titleStyle = validate('title', Objects.embed, msg.client.constants) ? 'DANGER' : titleStyle;
      if (editing === 'title') titleStyle = 'SUCCESS';

      let descriptionStyle = Objects.embed.description ? 'SECONDARY' : 'PRIMARY';
      descriptionStyle = validate('description', Objects.embed, msg.client.constants)
        ? 'DANGER'
        : descriptionStyle;
      if (editing === 'description') descriptionStyle = 'SUCCESS';

      let footerTextStyle = Objects.embed.footer?.text ? 'SECONDARY' : 'PRIMARY';
      footerTextStyle = validate('footer-text', Objects.embed, msg.client.constants)
        ? 'DANGER'
        : footerTextStyle;
      if (editing === 'footer-text') footerTextStyle = 'SUCCESS';

      let authorIconUrlStyle = Objects.embed.author?.iconURL ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'author-iconURL') authorIconUrlStyle = 'SUCCESS';

      let authorUrlStyle = Objects.embed.author?.url ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'author-url') authorUrlStyle = 'SUCCESS';

      let urlStyle = Objects.embed.url ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'url') urlStyle = 'SUCCESS';

      let thumbnailStyle = Objects.embed.thumbnail?.url ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'thumbnail') thumbnailStyle = 'SUCCESS';

      let imageStyle = Objects.embed.image?.url ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'image') imageStyle = 'SUCCESS';

      let footerIconUrlStyle = Objects.embed.footer?.iconURL ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'footer-iconURL') footerIconUrlStyle = 'SUCCESS';

      let colorStyle = Objects.embed.color ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'color') colorStyle = 'SUCCESS';

      let timestampStyle = Objects.embed.timestamp ? 'SECONDARY' : 'PRIMARY';
      if (editing === 'timestamp') timestampStyle = 'SUCCESS';

      components.push(
        [
          new Discord.MessageButton()
            .setCustomId('author-name')
            .setLabel(lan['author-name'].name)
            .setStyle(authorNameStyle),
          new Discord.MessageButton()
            .setCustomId('author-iconURL')
            .setLabel(lan['author-iconURL'].name)
            .setStyle(authorIconUrlStyle),
          new Discord.MessageButton()
            .setCustomId('author-url')
            .setLabel(lan['author-url'].name)
            .setStyle(authorUrlStyle),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('title')
            .setLabel(lan.title.name)
            .setStyle(titleStyle),
          new Discord.MessageButton().setCustomId('url').setLabel(lan.url.name).setStyle(urlStyle),
          new Discord.MessageButton()
            .setCustomId('description')
            .setLabel(lan.description.name)
            .setStyle(descriptionStyle),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('thumbnail')
            .setLabel(lan.thumbnail.name)
            .setStyle(thumbnailStyle),
          new Discord.MessageButton()
            .setCustomId('image')
            .setLabel(lan.image.name)
            .setStyle(imageStyle),
          new Discord.MessageButton()
            .setCustomId('color')
            .setLabel(lan.color.name)
            .setStyle(colorStyle),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('footer-text')
            .setLabel(lan['footer-text'].name)
            .setStyle(footerTextStyle),
          new Discord.MessageButton()
            .setCustomId('footer-iconURL')
            .setLabel(lan['footer-iconURL'].name)
            .setStyle(footerIconUrlStyle),
          new Discord.MessageButton()
            .setCustomId('timestamp')
            .setLabel(lan.timestamp.name)
            .setStyle(timestampStyle),
        ],
      );
      break;
    }
    case 2: {
      components.push(
        [
          new Discord.MessageSelectMenu()
            .setCustomId('field-select')
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder(baseLan.fieldsPlaceholder)
            .setDisabled(!Objects.embed.fields.length)
            .addOptions(
              Objects.embed.fields.length
                ? Objects.embed.fields.map((field, i) => {
                    return {
                      label: field.name === '\u200b' ? msg.language.none : field.name.slice(0, 100),
                      description:
                        field.value === '\u200b' ? msg.language.none : field.value.slice(0, 100),
                      value: `${i}`,
                    };
                  })
                : { label: 'placeholder', value: 'placeholder' },
            ),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('add-field')
            .setLabel(baseLan.addField)
            .setStyle('SUCCESS')
            .setDisabled(Objects.embed.fields.length === 25),
        ],
      );
      break;
    }
    case 3: {
      components.push(
        [
          new Discord.MessageButton()
            .setCustomId('inheritCode')
            .setLabel(baseLan.inheritCode)
            .setStyle('PRIMARY'),
          new Discord.MessageButton()
            .setCustomId('viewRaw')
            .setLabel(baseLan.viewRaw)
            .setStyle('PRIMARY'),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('viewRawOtherMsg')
            .setLabel(baseLan.viewRawOtherMsg)
            .setStyle('SECONDARY'),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('save')
            .setLabel(baseLan.save)
            .setStyle('PRIMARY'),
          new Discord.MessageButton()
            .setCustomId('send')
            .setLabel(baseLan.send)
            .setStyle('PRIMARY')
            .setDisabled(msg.command.name !== module.exports.name),
        ],
      );
    }
  }

  components.push([
    new Discord.MessageButton()
      .setLabel('\u200b')
      .setCustomId('left')
      .setStyle('SECONDARY')
      .setEmoji(msg.client.constants.emotes.back)
      .setDisabled(page === 1),
    new Discord.MessageButton()
      .setLabel('\u200b')
      .setCustomId('cross')
      .setStyle('DANGER')
      .setEmoji(msg.client.constants.emotes.cross),
    new Discord.MessageButton()
      .setLabel('\u200b')
      .setCustomId('right')
      .setStyle('SECONDARY')
      .setEmoji(msg.client.constants.emotes.forth)
      .setDisabled(page === 4),
  ]);
  return components;
};

const handleBuilderButtons = async ({ msg, answer }, Objects, lan, embed) => {
  const reply = async (editing, interaction) => {
    const lang = msg.language.commands.embedbuilder.edit[editing];

    const recommendedEmbed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setTitle(lang.name)
      .setDescription(lang.answers);

    if (lang.recommended) {
      recommendedEmbed.addField('\u200b', lang.recommended);
    }

    await replier(
      { msg, answer: interaction },
      {
        embeds: [recommendedEmbed],
        components: getComponents(msg, { page: Objects.page, Objects }, editing),
      },
      Objects,
    );
  };

  const messageCollector = msg.channel.createMessageCollector({ time: 180000 });
  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 180000 });

  return new Promise((resolve) => {
    let editing = null;

    buttonsCollector.on('collect', async (interaction) => {
      if (interaction.user.id !== msg.author.id) {
        msg.client.ch.notYours(interaction, msg);
        return;
      }

      buttonsCollector.resetTimer();
      messageCollector.resetTimer();

      editing = interaction.customId;
      switch (editing) {
        default: {
          reply(editing, interaction);
          break;
        }
        case 'cross': {
          buttonsCollector.stop();
          messageCollector.stop();

          resolve(null);
          postCode(Objects, msg, interaction);
          break;
        }
        case 'left': {
          buttonsCollector.stop();
          messageCollector.stop();

          const page = Objects.page - 1;
          resolve(await module.exports.builder(msg, interaction, Objects.embed, page));
          break;
        }
        case 'right': {
          buttonsCollector.stop();
          messageCollector.stop();

          const page = Objects.page + 1;
          resolve(await module.exports.builder(msg, interaction, Objects.embed, page));
          break;
        }
        case 'viewRaw': {
          messageCollector.stop();
          buttonsCollector.stop();

          resolve(await postCode(Objects, msg, interaction, null, true));
          break;
        }
        case 'inheritCode': {
          messageCollector.stop();
          buttonsCollector.stop();

          const inheritCodeEmbed = new Discord.MessageEmbed().setDescription(
            lan.inheritCodeDescription,
          );
          await replier(
            { msg, answer: interaction },
            { embeds: [inheritCodeEmbed], components: [] },
            Objects,
          );

          const inheritCodeEmbedMessageCollector = msg.channel.createMessageCollector({
            time: 900000,
          });
          inheritCodeEmbedMessageCollector.on('collect', async (inheritCodeEmbedMessage) => {
            if (msg.author.id !== inheritCodeEmbedMessage.author.id) return;

            inheritCodeEmbedMessage.delete().catch(() => {});

            try {
              const code = JSON.parse(
                inheritCodeEmbedMessage.content ||
                  (await msg.client.ch.convertTxtFileLinkToString(
                    inheritCodeEmbedMessage.attachments.first().url,
                  )),
              );

              Objects.embed = new Discord.MessageEmbed(code);
              inheritCodeEmbedMessageCollector.stop();
              resolve(await module.exports.builder(msg, answer, Objects.embed));
            } catch (e) {
              msg.client.ch
                .reply(msg, {
                  content: `${e}\n${lan.warns.resolveAndRetry}`,
                })
                .then((m) => {
                  setTimeout(() => m.delete().catch(() => {}), 10000);
                });
            }
          });

          inheritCodeEmbedMessageCollector.on('end', (collected, reason) => {
            if (reason === 'time') {
              postCode(Objects, msg);
            }
          });
          break;
        }
        case 'send': {
          messageCollector.stop();
          buttonsCollector.stop();
          resolve(await handleSend(msg, interaction, Objects));
          break;
        }
        case 'save': {
          messageCollector.stop();
          buttonsCollector.stop();
          const emb = await handleSave(msg, interaction, Objects);
          resolve(emb);
          break;
        }
        case 'viewRawOtherMsg': {
          messageCollector.stop();
          buttonsCollector.stop();
          resolve(await handleOtherMsgRaw(msg, interaction, Objects));
          break;
        }
        case 'add-field': {
          Objects.embed.addField('\u200b', '\u200b', false);

          messageCollector.stop();
          buttonsCollector.stop();

          await replier(
            { msg, answer: interaction },
            {
              embeds: [embed],
              components: getComponents(msg, { page: 2, Objects }),
            },
            Objects,
          );

          resolve(await module.exports.builder(msg, interaction, Objects.embed, 2));
          break;
        }
        case 'field-select': {
          messageCollector.stop();
          buttonsCollector.stop();
          resolve(await fieldSelect(msg, interaction, Objects));
          break;
        }
      }
    });

    messageCollector.on('collect', async (message) => {
      if (message.author.id !== msg.author.id) return;

      const limits = msg.client.constants.customembeds.limits.fields;

      message.delete().catch(() => {});
      buttonsCollector.resetTimer();
      messageCollector.resetTimer();

      switch (editing) {
        default: {
          break;
        }
        case 'color': {
          const passesReg = colorReg.test(message.content);

          let e;
          if (passesReg) {
            try {
              new Discord.MessageEmbed().setColor(message.content);
            } catch (err) {
              e = err;
            }
          }

          if (!passesReg || e) {
            let valid;
            if (!passesReg) valid = 'regFail';

            await errorVal(msg, lan, valid, Objects, e, answer);
            break;
          }

          Objects.embed.setColor(message.content);
          break;
        }
        case 'title': {
          const passesLength = limits.title >= message.content.length;

          let e;
          if (!passesLength) {
            try {
              new Discord.MessageEmbed().setTitle(message.content);
            } catch (err) {
              e = err;
            }
          }

          if (e || !passesLength) {
            let valid;
            if (!passesLength) valid = 'length';

            await errorVal(msg, lan, valid, Objects, e, answer);
            break;
          }

          Objects.embed.setTitle(message.content);
          break;
        }
        case 'url': {
          let isUrl = false;
          try {
            // eslint-disable-next-line no-new
            new URL(message.content);
            isUrl = true;
          } catch (err) {
            isUrl = false;
          }

          let e;
          if (!isUrl) {
            try {
              new Discord.MessageEmbed().setURL(message.content);
            } catch (err) {
              e = err;
            }
          }

          if (e || !isUrl) {
            let valid;
            if (!isUrl) valid = 'noUrl';

            await errorVal(msg, lan, valid, Objects, e, answer);
            break;
          }

          Objects.embed.setURL(message.content);
          break;
        }
        case 'author-name': {
          const passesLength = limits['author-name'] >= message.content.length;

          let e;
          if (!passesLength) {
            try {
              new Discord.MessageEmbed().setAuthor({ name: message.content });
            } catch (err) {
              e = err;
            }
          }

          if (e || !passesLength) {
            let valid;
            if (!passesLength) valid = 'length';

            await errorVal(msg, lan, valid, Objects, e, answer);
            break;
          }

          Objects.embed.setAuthor({
            name: message.content,
            url: Objects.embed.author?.url,
            iconURL: Objects.embed.author?.iconURL,
          });
          break;
        }
        case 'author-iconURL': {
          let isUrl = false;
          try {
            // eslint-disable-next-line no-new
            new URL(message.content);
            isUrl = true;
          } catch (err) {
            isUrl = false;
          }

          let e;
          if (!isUrl) {
            try {
              new Discord.MessageEmbed().setAuthor({
                name: '\u200b',
                iconURL: message.content,
              });
            } catch (err) {
              e = err;
            }
          }

          if (e || !isUrl) {
            let valid;
            if (!isUrl) valid = 'noUrl';

            await errorVal(msg, lan, valid, Objects, e, answer);
            break;
          }

          Objects.embed.setAuthor({
            name:
              Objects.embed.author && Objects.embed.author.name
                ? Objects.embed.author.name
                : '\u200b',
            url: Objects.embed.author?.url,
            iconURL: message.content,
          });
          break;
        }
        case 'author-url': {
          let isUrl = false;
          try {
            // eslint-disable-next-line no-new
            new URL(message.content);
            isUrl = true;
          } catch (err) {
            isUrl = false;
          }

          let e;
          if (!isUrl) {
            try {
              new Discord.MessageEmbed().setAuthor({ name: '\u200b', url: message.content });
            } catch (err) {
              e = err;
            }
          }

          if (e || !isUrl) {
            let valid;
            if (!isUrl) valid = 'noUrl';

            await errorVal(msg, lan, valid, Objects, e, answer);
            break;
          }

          Objects.embed.setAuthor({
            name:
              Objects.embed.author && Objects.embed.author.name
                ? Objects.embed.author.name
                : '\u200b',
            url: message.content,
            iconURL: Objects.embed.author?.iconURL,
          });
          break;
        }
        case 'description': {
          let e;
          try {
            new Discord.MessageEmbed().setDescription(message.content);
          } catch (err) {
            e = err;
          }

          if (e) {
            await errorVal(msg, lan, null, Objects, e, answer);
            break;
          }

          Objects.embed.setDescription(message.content);
          break;
        }
        case 'image': {
          let isUrl = false;
          try {
            // eslint-disable-next-line no-new
            new URL(message.content);
            isUrl = true;
          } catch (err) {
            isUrl = false;
          }

          let e;
          if (!isUrl) {
            try {
              new Discord.MessageEmbed().setImage(message.content);
            } catch (err) {
              e = err;
            }
          }

          if (e || !isUrl) {
            let valid;
            if (!isUrl) valid = 'noUrl';

            await errorVal(msg, lan, valid, Objects, e, answer);
            break;
          }

          Objects.embed.setImage(message.content);
          break;
        }
        case 'thumbnail': {
          let isUrl = false;
          try {
            // eslint-disable-next-line no-new
            new URL(message.content);
            isUrl = true;
          } catch (err) {
            isUrl = false;
          }

          let e;
          if (!isUrl) {
            try {
              new Discord.MessageEmbed().setThumbnail(message.content);
            } catch (err) {
              e = err;
            }
          }

          if (e || !isUrl) {
            let valid;
            if (!isUrl) valid = 'noUrl';

            await errorVal(msg, lan, valid, Objects, e, answer);
            break;
          }

          Objects.embed.setThumbnail(message.content);
          break;
        }
        case 'timestamp': {
          let isTimestamp = false;
          try {
            // eslint-disable-next-line no-new
            new Date(Number(message.content));
            isTimestamp = true;
          } catch (err) {
            isTimestamp = false;
          }

          let e;
          try {
            new Discord.MessageEmbed().setTimestamp(message.content);
          } catch (err) {
            e = err;
          }

          if (e || !isTimestamp) {
            let valid;
            if (!isTimestamp) valid = 'noTimestamp';

            await errorVal(msg, lan, valid, Objects, e, answer);
            break;
          }

          Objects.embed.setTimestamp(Number(`${message.content}000`));
          break;
        }
        case 'footer-text': {
          let e;
          try {
            new Discord.MessageEmbed().setFooter({ text: message.content });
          } catch (err) {
            e = err;
          }

          if (e) {
            await errorVal(msg, lan, null, Objects, e, answer);
            break;
          }

          Objects.embed.setFooter({
            text: message.content,
            iconUrl: Objects.embed.footer?.iconUrl,
          });
          break;
        }
        case 'footer-iconURL': {
          let isUrl = false;
          try {
            // eslint-disable-next-line no-new
            new URL(message.content);
            isUrl = true;
          } catch (err) {
            isUrl = false;
          }

          let e;
          if (!isUrl) {
            try {
              new Discord.MessageEmbed().setFooter({
                text: '\u200b',
                iconURL: message.content,
              });
            } catch (err) {
              e = err;
            }
          }

          if (e || !isUrl) {
            let valid;
            if (!isUrl) valid = 'noUrl';

            await errorVal(msg, lan, valid, Objects, e, answer);
            break;
          }

          Objects.embed.setFooter({
            iconURL: message.content,
            text:
              Objects.embed.footer && Objects.embed.footer.text
                ? Objects.embed.footer.text
                : '\u200b',
          });
          break;
        }
      }

      await replier(
        { msg, answer },
        { embeds: [embed], components: getComponents(msg, { page: Objects.page, Objects }) },
        Objects,
      );
    });
    messageCollector.on('end', (collected, reason) => {
      if (reason !== 'time') buttonsCollector.stop();
      else postCode(Objects, msg, answer);
    });
  });
};

const postCode = (Objects, msg, answer, embed, noRemove) => {
  let components = [];
  if (noRemove) {
    components = msg.client.ch.buttonRower([
      [
        new Discord.MessageButton()
          .setLabel('\u200b')
          .setStyle('PRIMARY')
          .setEmoji(msg.client.constants.emotes.back)
          .setCustomId('back'),
      ],
    ]);
  }

  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });

  const rawCode = Objects.embed.toJSON();
  if (rawCode.length > 4000) {
    const attachment = msg.client.ch.txtFileWriter([rawCode]);

    replier({ msg, answer }, { files: [attachment], components, embeds: [embed] });
  } else {
    const embeds = [];
    if (embed) embeds.push(embed);
    embeds.push(
      new Discord.MessageEmbed()
        .setAuthor({
          name: msg.language.commands.embedbuilder.author,
          iconURL: msg.client.constants.commands.embedbuilder.author,
          url: msg.client.constants.standard.invite,
        })
        .setDescription(msg.client.ch.makeCodeBlock(JSON.stringify(rawCode, null, 1)))
        .setColor('ffffff')
        .setTitle(msg.language.commands.embedbuilder.unsaved)
        .addField('\u200b', msg.language.commands.embedbuilder.unsavedFieldValue),
    );

    replier(
      { msg, answer },
      {
        embeds,
        components,
      },
    );
  }

  return new Promise((resolve) => {
    buttonsCollector.on('collect', async (interaction) => {
      if (interaction.user.id !== msg.author.id) {
        msg.client.ch.notYours(interaction, msg);
        return;
      }

      if (interaction.customId === 'back') {
        buttonsCollector.stop();
        resolve(await module.exports.builder(msg, interaction, Objects.embed, 3));
      }
    });

    buttonsCollector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        resolve(await postCode(Objects, msg, answer));
      }
    });
  });
};

const handleSave = async (msg, answer, Objects) => {
  const lan = msg.language.commands.embedbuilder;
  const save = new Discord.MessageButton()
    .setCustomId('save')
    .setLabel(lan.save)
    .setStyle('PRIMARY')
    .setDisabled(true);

  const embed = new Discord.MessageEmbed().setDescription(lan.giveName).setAuthor({
    name: msg.language.commands.embedbuilder.author,
    iconURL: msg.client.constants.commands.embedbuilder.author,
    url: msg.client.constants.standard.invite,
  });
  await replier({ msg, answer }, { embeds: [embed], components: [save] }, Objects);

  return new Promise((resolve) => {
    let name;
    const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
    const messageCollector = msg.channel.createMessageCollector({ time: 60000 });

    const back = new Discord.MessageButton()
      .setLabel('\u200b')
      .setEmoji(msg.client.constants.emotes.back)
      .setStyle('PRIMARY')
      .setCustomId('back');

    buttonsCollector.on('collect', async (interaction) => {
      if (interaction.user.id !== msg.author.id) {
        msg.client.ch.notYours(interaction, msg);
        return;
      }
      if (interaction.customId === 'back') {
        messageCollector.stop();
        buttonsCollector.stop();
        resolve(await module.exports.build({ msg, answer }, Objects, 3));
      }
    });

    buttonsCollector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        resolve(await postCode(Objects, msg, answer));
      }
    });

    messageCollector.on('collect', async (message) => {
      if (message.author.id !== msg.author.id) return;

      name = message.content.slice(0, 1024);

      const newSave = new Discord.MessageButton()
        .setCustomId('save')
        .setLabel(lan.save)
        .setStyle('PRIMARY')
        .setDisabled(!name);

      embed.fields.length = 0;
      embed.addField(msg.language.name, `\u200b${message.content.slice(0, 1024)}`);
      message.delete().catch(() => {});

      await replier({ msg, answer }, { embeds: [embed], components: [newSave, back] }, Objects);
    });

    messageCollector.on('end', (collected, reason) => {
      if (reason !== 'time') {
        buttonsCollector.stop();
      }
    });

    buttonsCollector.on('collect', (interaction) => {
      if (interaction.user.id !== msg.author.id) {
        msg.client.ch.notYours(interaction, msg);
        return;
      }
      messageCollector.stop();
      buttonsCollector.stop();

      const emb = Objects.embed;
      msg.client.ch.query(
        `
      INSERT INTO customembeds 
      (color, title, url, authorname, authoriconurl, authorurl, description, thumbnail, fieldnames, fieldvalues, fieldinlines, image, timestamp, footertext, footericonurl, uniquetimestamp, guildid, name) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);
      `,
        [
          emb.color,
          emb.title,
          emb.url,
          emb.author?.name,
          emb.author?.icon_url,
          emb.author?.url,
          emb.description,
          emb.thumbnail?.url,
          emb.fields?.map((f) => f.name),
          emb.fields?.map((f) => f.value),
          emb.fields?.map((f) => f.inline),
          emb.image?.url,
          emb.timestamp,
          emb.footer?.text,
          emb.footer?.icon_url,
          Date.now(),
          msg.guild.id,
          name,
        ],
      );

      resolve({ embed: emb, answer: interaction });
    });
    buttonsCollector.on('end', (collected, reason) => {
      if (reason === 'time') {
        resolve(null);
        postCode(Objects, msg);
      }
    });
  });
};

const handleSend = async (msg, answer, Objects) => {
  const getButtons = (options) => {
    const next = new Discord.MessageButton()
      .setCustomId('next')
      .setLabel(msg.language.next)
      .setDisabled(
        options.options.length > 25 && options.page === Math.ceil(options.options.length / 25),
      )
      .setStyle('SUCCESS');
    const prev = new Discord.MessageButton()
      .setCustomId('prev')
      .setLabel(msg.language.prev)
      .setDisabled(options.page === 1)
      .setStyle('DANGER');
    const send = new Discord.MessageButton()
      .setCustomId('send')
      .setLabel(msg.language.commands.embedbuilder.send)
      .setStyle('PRIMARY');
    const channels = new Discord.MessageSelectMenu()
      .setCustomId('channels')
      .addOptions(options.take)
      .setPlaceholder(msg.language.select.channels.select)
      .setMaxValues(options.take.length)
      .setMinValues(1);

    return [[prev, next], channels, send];
  };

  const getEmbed = (options) => {
    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(
        `${msg.language.commands.embedbuilder.sendWhere}\n\n**${msg.language.selected}**:\n${
          options.selected.lenght
            ? options.selected.map((c) => `<#${c}>`).join(', ')
            : msg.language.none
        }`,
      )
      .addField(msg.language.page, `\`${options.page}/${Math.ceil(options.options.length / 25)}\``);

    return embed;
  };

  const options = {
    page: 1,
    options: msg.guild.channels.cache
      .filter((c) =>
        [
          'GUILD_TEXT',
          'GUILD_NEWS',
          'GUILD_NEWS_THREAD',
          'GUILD_PUBLIC_THEAD',
          'GUILD_PRIVATE_THREAD',
        ].includes(c.type),
      )
      .sort((a, b) => a.rawPosition - b.rawPosition)
      .map((c) => {
        return { label: `${c.name}`, value: `${c.id}` };
      }),
    selected: [],
  };

  const getTake = () => {
    const neededIndex = options.page * 25 - 25;
    for (let j = neededIndex + 1; j < neededIndex + 26 && j < options.options.length; j += 1) {
      options.take.push(options.options[j]);
    }
  };

  options.take = options.options.filter((o, i) => i < 25);

  await replier(
    { msg, answer },
    { embeds: [getEmbed(options)], components: getButtons(options) },
    Objects,
  );

  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  buttonsCollector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) {
      msg.client.ch.notYours(interaction, msg);
      return;
    }
    buttonsCollector.resetTimer();

    switch (interaction.customId) {
      default: {
        interaction.values.forEach((v) => {
          if (options.selected.includes(v)) {
            const index = options.selected.indexOf(v);
            options.selected.splice(index, 1);
          } else {
            options.selected.push(v);
          }
        });
        break;
      }
      case 'next': {
        options.page += 1;
        options.take.length = 0;
        getTake();
        break;
      }
      case 'prev': {
        options.page -= 1;
        options.take.length = 0;
        getTake();
        break;
      }
      case 'send': {
        buttonsCollector.stop();

        const sendPromises = options.selected.map((c) =>
          msg.client.channels.cache
            .get(c)
            .send({ embeds: [Objects.embed] })
            .catch((e) => [c, e])
            .then(() => [c]),
        );

        const returns = await Promise.all(sendPromises);

        const errors = returns.filter((r) => r[1]);
        const successes = returns.filter((r) => !r[1]);

        const embed = new Discord.MessageEmbed()
          .setAuthor({
            name: msg.language.commands.embedbuilder.author,
            iconURL: msg.client.constants.commands.embedbuilder.author,
            url: msg.client.constants.standard.invite,
          })
          .setDescription(
            `${
              (errors.length
                ? errors
                    .map(
                      (err) =>
                        `${msg.client.ch.stp(`${msg.language.commands.embedbuilder.sendError}`, {
                          channel: `<#${err[0]}>`,
                          error: err[1],
                        })}`,
                    )
                    .join('\n')
                : '',
              successes.map((c) => {
                return msg.client.ch.stp(`${msg.language.commands.embedbuilder.sendSuccess}`, {
                  channel: `<#${c[0]}>`,
                });
              }))
            }`,
          );

        await replier({ msg, answer: interaction }, { embeds: [embed], components: [] }, Objects);
        return;
      }
    }

    await replier(
      { msg, answer: interaction },
      { embeds: [getEmbed(options)], components: getButtons(options) },
      Objects,
    );
  });
};

const handleOtherMsgRaw = async (msg, answer, Objects) => {
  const noFound = () => {
    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(msg.language.commands.embedbuilder.noUrlFound);

    return replier({ msg, answer }, { embeds: [embed], components: [] }, Objects);
  };

  const embed = new Discord.MessageEmbed()
    .setAuthor({
      name: msg.language.commands.embedbuilder.author,
      iconURL: msg.client.constants.commands.embedbuilder.author,
      url: msg.client.constants.standard.invite,
    })
    .setDescription(msg.language.commands.embedbuilder.otherMsg)
    .addField(
      msg.language.Examples,
      msg.client.constants.discordMsgUrls.map((url) => `\`${url}\``).join('\n'),
    );

  const back = new Discord.MessageButton()
    .setLabel('\u200b')
    .setEmoji(msg.client.constants.emotes.back)
    .setStyle('PRIMARY')
    .setCustomId('back');

  await replier({ msg, answer }, { embeds: [embed], components: [back] }, Objects);

  const messageCollector = msg.channel.createMessageCollector({ time: 60000 });
  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
  return new Promise((resolve) => {
    buttonsCollector.on('collect', async (interaction) => {
      if (interaction.user.id !== msg.author.id) {
        msg.client.ch.notYours(interaction, msg);
        return;
      }
      if (interaction.customId === 'back') {
        messageCollector.stop();
        buttonsCollector.stop();
        resolve(await module.exports.build({ msg, answer }, Objects, 3));
      }
    });

    buttonsCollector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        resolve(await postCode(Objects, msg, answer));
      }
    });

    messageCollector.on('collect', async (message) => {
      if (message.author.id !== msg.author.id) return;

      buttonsCollector.resetTimer();
      messageCollector.resetTimer();

      message.delete().catch(() => {});

      if (!testReg.test(message.content)) {
        noFound(msg);
      }

      const args = message.content.replace(/\n/g, ' ').split(/ +/);
      const messageUrls = [];

      args.forEach((arg) => {
        try {
          const url = new URL(arg);
          if (
            (url.hostname === 'discord.com' ||
              url.hostname === 'canary.discord.com' ||
              url.hostname === 'ptb.discord.com') &&
            url.pathname.startsWith('/channels/')
          ) {
            messageUrls.push(arg);
          }
        } catch {
          // empty
        }
      });

      const messagePromises = messageUrls.map(async (url) => {
        const path = url.replace(testReg, '');

        const ids = path.split(/\/+/);
        if (ids[0] === 'https:' || ids[0] === 'http:') ids.shift();

        if (Number.isNaN(+ids[0]) && ids[0] === '@me') {
          return (await msg.client.guilds.cache.channels.fetch(ids[1]).catch((e) => e))?.messages
            ?.fetch(ids[2])
            ?.catch((e) => e);
        }
        return msg.client.channels.cache
          .get(ids[1])
          .messages?.fetch(ids[2])
          .catch((e) => e);
      });

      const messages = await Promise.all(messagePromises);

      const messageEmbedJSONs = [];
      messages.forEach((m) => {
        m.embeds.forEach((membed) => {
          messageEmbedJSONs.push(`${m.url}\n${JSON.stringify(membed, null, 1)}`);
        });
      });

      const attachment = msg.client.ch.txtFileWriter(messageEmbedJSONs);

      await replier({ msg, answer }, { files: [attachment], embeds: [embed] });
    });
  });
};

const errorVal = async (msg, lan, valid, Objects, error, answer) => {
  let lanError;

  switch (error) {
    default: {
      lanError = error;
      break;
    }
    case 'regFail': {
      lanError = lan.regFail;
      break;
    }
    case 'length': {
      lanError = msg.client.ch.stp(lan.lengthFail, { max: valid });
      break;
    }
    case 'noTimestamp': {
      lanError = lan.noTimestamp;
      break;
    }
  }

  const errorEmbed = new Discord.MessageEmbed()
    .setAuthor({
      name: msg.language.commands.embedbuilder.author,
      iconURL: msg.client.constants.commands.embedbuilder.author,
      url: msg.client.constants.standard.invite,
    })
    .setDescription(msg.language.commands.embedbuilder.errorVal)
    .setColor('ff0000');
  if (error) errorEmbed.addField(msg.language.error, `${lanError}`);

  await replier({ msg, answer }, { embeds: [errorEmbed], components: [] }, Objects);

  const reaction = await msg.m.react(msg.client.constants.emotes.timers[3]);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
      reaction.remove(msg.client.user.id).catch(() => {});
    }, 3000);
  });
};

const fieldSelect = async (msg, answer, Objects) => {
  const baseLan = msg.language.commands.embedbuilder;

  const index = answer.values[0];
  const selected = Objects.embed.fields[index];
  let editing = 'name';

  const getFieldComponents = () => {
    return [
      [
        new Discord.MessageButton()
          .setCustomId('remove-field')
          .setLabel(baseLan.removeField)
          .setStyle('DANGER'),
      ],
      [
        new Discord.MessageButton()
          .setCustomId('name')
          .setLabel(baseLan.fieldName)
          .setStyle(editing === 'name' ? 'PRIMARY' : 'SECONDARY'),
        new Discord.MessageButton()
          .setCustomId('value')
          .setLabel(baseLan.fieldValue)
          .setStyle(editing === 'value' ? 'PRIMARY' : 'SECONDARY'),
        new Discord.MessageButton()
          .setCustomId('inline')
          .setLabel(baseLan.fieldInline)
          .setStyle(selected.inline ? 'SUCCESS' : 'SECONDARY'),
      ],
      [
        new Discord.MessageButton()
          .setLabel('\u200b')
          .setStyle('PRIMARY')
          .setEmoji(msg.client.constants.emotes.back)
          .setCustomId('back'),
      ],
    ];
  };

  const getEmbed = () => {
    return new Discord.MessageEmbed()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(baseLan.chooseTheEdit);
  };

  await replier(
    { msg, answer },
    { embeds: [getEmbed()], components: getFieldComponents() },
    Objects,
  );

  return new Promise((resolve) => {
    const buttonsCollector = msg.m.createMessageComponentCollector({
      time: 60000,
    });
    const messageCollector = msg.channel.createMessageCollector({
      time: 60000,
    });

    buttonsCollector.on('end', (collected, reason) => {
      if (reason !== 'time') messageCollector.stop();
      else {
        resolve(null);
        postCode(Objects, msg, answer);
      }
    });

    messageCollector.on('collect', async (message) => {
      messageCollector.resetTimer();
      const collected = message.content;

      message.delete().catch(() => {});
      switch (editing) {
        default: {
          break;
        }
        case 'name': {
          try {
            new Discord.MessageEmbed().addField(collected, '\u200b');
            selected.name = collected;
          } catch (e) {
            msg.client.ch
              .reply(msg, {
                content: `${e}\n${baseLan.warns.resolveAndRetry}`,
              })
              .then((m) => setTimeout(() => m.delete().catch(() => {}), 10000));
          }
          break;
        }
        case 'value': {
          try {
            new Discord.MessageEmbed().addField('\u200b', collected);
            selected.value = collected;
          } catch (e) {
            msg.client.ch
              .reply(msg, {
                content: `${e}\n${baseLan.warns.resolveAndRetry}`,
              })
              .then((m) => setTimeout(() => m.delete().catch(() => {}), 10000));
          }
          break;
        }
      }

      await replier(
        { msg, answer },
        { embeds: [getEmbed()], components: getFieldComponents() },
        Objects,
      );
    });
    buttonsCollector.on('collect', async (interaction) => {
      buttonsCollector.resetTimer();

      switch (interaction.customId) {
        default: {
          break;
        }
        case 'inline': {
          selected.inline = !selected.inline;
          break;
        }
        case 'remove-field': {
          Objects.embed.fields.splice(index, 1);
          buttonsCollector.stop();
          messageCollector.stop();
          resolve(await module.exports.builder(msg, interaction, Objects.embed, 2));
          return;
        }
        case 'name': {
          editing = 'name';
          break;
        }
        case 'value': {
          editing = 'value';
          break;
        }
        case 'back': {
          buttonsCollector.stop();
          messageCollector.stop();
          resolve(await module.exports.builder(msg, interaction, Objects.embed, 2));
          break;
        }
      }

      await replier(
        { msg, answer: interaction },
        { embeds: [getEmbed()], components: getFieldComponents() },
        Objects,
      );
    });
  });
};
