const Discord = require('discord.js');
const jobs = require('node-schedule');

const testReg = /discord\.com\/channels\//gi;
const colorReg = /[0-9A-Fa-f]{6}/g;

module.exports = {
  name: 'embedbuilder',
  perm: null,
  insideCommandPerm: 2048n,
  dm: false,
  takesFirstArg: false,
  aliases: ['eb'],
  async execute(msg) {
    const returned = await this.builder(msg);

    if (!returned) return;

    const { embed, answer } = returned;
    if (embed) {
      if (answer && !answer.replied && !answer.deferred) {
        answer.update({ embeds: [embed] });
      } else if (msg.m) {
        msg.m.edit({ embeds: [embed] });
      } else {
        msg.channel.send({ embeds: [embed] });
      }
    }
  },
  async builder(msg, answer, existingEmbed, page, options) {
    if (typeof page !== 'number') page = 1;

    const lan = msg.language.commands.embedbuilder;

    const Objects = {
      edit: 'menu',
      category: null,
      embed: existingEmbed ? new Discord.MessageEmbed(existingEmbed) : new Discord.MessageEmbed(),
      page: page || 1,
      options,
    };

    const embed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(lan.chooseTheEdit)
      .setColor(msg.client.ch.colorSelector(msg.guild.me));

    if (Objects.options) {
      embed.addField(
        msg.language.commands.embedbuilder.replacedOptions,
        `${Objects.options
          .map((o) =>
            msg.client.ch.stp(msg.language.commands.embedbuilder.replacedOptionsDescription, {
              option: o[0],
              value: o[1],
            }),
          )
          .join('\n')}`,
      );
    }

    const components = await getComponents(msg, { page, Objects });

    await replier({ msg, answer }, { embeds: [embed], components, files: [] }, Objects);

    const returned = await handleBuilderButtons({ msg, answer }, Objects, lan, {
      embed,
      components,
    });

    return returned;
  },
};

const replier = async ({ msg, answer }, { embeds, components, content, files }, Objects) => {
  let finishedEmbed;
  if (Objects) {
    if (cantBeSent(Objects)) {
      finishedEmbed = new Discord.MessageEmbed()
        .setDescription(msg.language.commands.embedbuilder.warns.noValue)
        .setColor('FF0000')
        .setThumbnail(msg.client.constants.commands.embedbuilder.error);

      const saveButton =
        components && components[components.length - 1] ? components[components.length - 1] : {};
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

const getComponents = async (msg, { page, Objects }, editing) => {
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
            .setDisabled(!Objects.embed.fields?.length)
            .addOptions(
              Objects.embed.fields?.length
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
            .setDisabled(Objects.embed.fields?.length === 25),
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
            .setStyle('PRIMARY')
            .setDisabled(
              !(
                msg.member.permissions.has(module.exports.insideCommandPerm) && !cantBeSent(Objects)
              ),
            ),
          new Discord.MessageButton()
            .setCustomId('send')
            .setLabel(baseLan.send)
            .setStyle('PRIMARY')
            .setDisabled(!(msg.command.name === module.exports.name && !cantBeSent(Objects))),
        ],
      );
      break;
    }
    case 4: {
      const savedEmbeds = await getSavedEmbeds(msg);

      components.push(
        getMenu(savedEmbeds, baseLan, msg),
        getArrows(msg, 1, Math.ceil(savedEmbeds.length / 25)),
        getOtherButtons(baseLan),
      );
      break;
    }
  }

  components.push(getNavigation(msg, page));
  return components;
};

const getMenu = (savedEmbeds, baseLan, msg) => {
  return [
    new Discord.MessageSelectMenu()
      .setCustomId('savedEmbedSelection')
      .setMaxValues(1)
      .setMinValues(1)
      .setPlaceholder(baseLan.embedPlaceholder)
      .setDisabled(
        !savedEmbeds.length || !msg.member.permissions.has(module.exports.insideCommandPerm),
      )
      .addOptions(
        savedEmbeds.length
          ? savedEmbeds
              .map((embed, i) => {
                if (i < 25) {
                  return {
                    label: embed.name.slice(0, 100),
                    value: `${embed.uniquetimestamp}`,
                  };
                }
                return null;
              })
              .filter((r) => !!r)
          : { label: 'placeholder', value: 'placeholder' },
      ),
  ];
};

const getNavigation = (msg, page) => {
  return [
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
  ];
};

const getArrows = (msg, currentPage, maxPage) => {
  return [
    new Discord.MessageButton()
      .setLabel('\u200b')
      .setCustomId('prev')
      .setStyle('DANGER')
      .setEmoji(msg.client.constants.emotes.back)
      .setDisabled(currentPage === 1 || !maxPage),
    new Discord.MessageButton()
      .setLabel('\u200b')
      .setCustomId('next')
      .setStyle('SUCCESS')
      .setEmoji(msg.client.constants.emotes.forth)
      .setDisabled(currentPage === maxPage || !maxPage),
  ];
};

const getOtherButtons = (baseLan) => {
  return [
    new Discord.MessageButton()
      .setCustomId('inheritFromSavedEmbed')
      .setLabel(baseLan.inheritFromSavedEmbed)
      .setStyle('PRIMARY')
      .setDisabled(true),
    new Discord.MessageButton()
      .setCustomId('deleteSavedEmbed')
      .setLabel(baseLan.deleteSavedEmbed)
      .setStyle('PRIMARY')
      .setDisabled(true),
  ];
};

const handleBuilderButtons = async ({ msg, answer }, Objects, lan, { embed, components }) => {
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

    if (Objects.options) {
      recommendedEmbed.addField(
        msg.language.commands.embedbuilder.replacedOptions,
        `${Objects.options
          .map((o) =>
            msg.client.ch.stp(msg.language.commands.embedbuilder.replacedOptionsDescription, {
              option: o[0],
              value: o[1],
            }),
          )
          .join('\n')}`,
      );
    }

    if (lang.recommended) {
      recommendedEmbed.addField('\u200b', lang.recommended);
    }

    await replier(
      { msg, answer: interaction },
      {
        embeds: [recommendedEmbed],
        components: await getComponents(msg, { page: Objects.page, Objects }, editing),
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
        msg.client.ch.notYours(interaction);
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
        case 'deleteSavedEmbed': {
          buttonsCollector.stop();
          messageCollector.stop();

          resolve(await handleDelete({ msg, answer: interaction }, Objects));
          break;
        }
        case 'inheritFromSavedEmbed': {
          buttonsCollector.stop();
          messageCollector.stop();

          resolve(await handleInherit({ msg, answer: interaction }, Objects));
          break;
        }
        case 'next': {
          await handlePage({ msg, answer: interaction }, Objects, { embed, components }, true);
          break;
        }
        case 'prev': {
          await handlePage({ msg, answer: interaction }, Objects, { embed, components }, false);
          break;
        }
        case 'savedEmbedSelection': {
          await handleEmbedSelection({ msg, answer: interaction }, Objects, { embed, components });
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
          resolve(
            await module.exports.builder(msg, interaction, Objects.embed, page, Objects.options),
          );
          break;
        }
        case 'right': {
          buttonsCollector.stop();
          messageCollector.stop();

          const page = Objects.page + 1;
          resolve(
            await module.exports.builder(msg, interaction, Objects.embed, page, Objects.options),
          );
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
              resolve(
                await module.exports.builder(msg, answer, Objects.embed, null, Objects.options),
              );
            } catch (e) {
              msg.client.ch
                .reply(msg, {
                  content: `${e}\n${lan.warns.resolveAndRetry}`,
                })
                .then((m) => {
                  jobs.scheduleJob(new Date(Date.now() + 10000), () => {
                    m.delete().catch(() => {});
                  });
                });
            }
          });

          inheritCodeEmbedMessageCollector.on('end', (collected, reason) => {
            if (reason === 'time') {
              postCode(Objects, msg);
              resolve();
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

          resolve(await handleSave(msg, interaction, Objects));
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
              components: await getComponents(msg, { page: 2, Objects }),
            },
            Objects,
          );

          resolve(
            await module.exports.builder(msg, interaction, Objects.embed, 2, Objects.options),
          );
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
      if (!editing) return;

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
          if (message.content !== msg.language.now) {
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
          } else {
            Objects.embed.setTimestamp();
          }
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
        { embeds: [embed], components: await getComponents(msg, { page: Objects.page, Objects }) },
        Objects,
      );
    });
    messageCollector.on('end', (collected, reason) => {
      if (reason !== 'time') buttonsCollector.stop();
      else {
        postCode(Objects, msg, answer);
      }
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

  const rawCode = new Discord.MessageEmbed(Objects.embed).toJSON();
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

  if (noRemove) {
    const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
    return new Promise((resolve) => {
      buttonsCollector.on('collect', async (interaction) => {
        if (interaction.user.id !== msg.author.id) {
          msg.client.ch.notYours(interaction);
          return;
        }

        if (interaction.customId === 'back') {
          buttonsCollector.stop();
          resolve(
            await module.exports.builder(msg, interaction, Objects.embed, 3, Objects.options),
          );
        }
      });

      buttonsCollector.on('end', async (collected, reason) => {
        if (reason === 'time') {
          resolve(null);
          postCode(Objects, msg, answer);
        }
      });
    });
  }

  return null;
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
        msg.client.ch.notYours(interaction);
        return;
      }
      if (interaction.customId === 'back') {
        messageCollector.stop();
        buttonsCollector.stop();
        resolve(await module.exports.build({ msg, answer }, Objects, 3));
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
        msg.client.ch.notYours(interaction);
        return;
      }
      messageCollector.stop();
      buttonsCollector.stop();

      const emb = Objects.embed;
      const now = Date.now();

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
          emb.author?.iconURL,
          emb.author?.url,
          emb.description,
          emb.thumbnail?.url,
          emb.fields?.map((f) => f.name),
          emb.fields?.map((f) => f.value),
          emb.fields?.map((f) => f.inline),
          emb.image?.url,
          emb.timestamp,
          emb.footer?.text,
          emb.footer?.iconURL,
          now,
          msg.guild.id,
          name,
        ],
      );

      resolve({ embed: emb, answer: interaction, name, now });
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
          options.selected.length
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
      msg.client.ch.notYours(interaction);
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
        msg.client.ch.notYours(interaction);
        return;
      }
      if (interaction.customId === 'back') {
        messageCollector.stop();
        buttonsCollector.stop();
        resolve(await module.exports.builder(msg, interaction, Objects.embed, 3, Objects.options));
      }
    });

    buttonsCollector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        postCode(Objects, msg, answer);

        resolve();
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
    jobs.scheduleJob(new Date(Date.now() + 3000), () => {
      resolve(true);
      reaction.remove(msg.client.user.id).catch(() => {});
    });
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
    const baseEmbed = new Discord.MessageEmbed()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(baseLan.chooseTheEdit);

    if (Objects.options) {
      baseEmbed.addField(
        msg.language.commands.embedbuilder.replacedOptions,
        `${Objects.options
          .map((o) =>
            msg.client.ch.stp(msg.language.commands.embedbuilder.replacedOptionsDescription, {
              option: o[0],
              value: o[1],
            }),
          )
          .join('\n')}`,
      );
    }

    return baseEmbed;
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
              .then((m) => {
                jobs.scheduleJob(new Date(Date.now() + 10000), () => {
                  m.delete().catch(() => {});
                });
              });
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
              .then((m) => {
                jobs.scheduleJob(new Date(Date.now() + 10000), () => {
                  m.delete().catch(() => {});
                });
              });
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
          resolve(
            await module.exports.builder(msg, interaction, Objects.embed, 2, Objects.options),
          );
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
          resolve(
            await module.exports.builder(msg, interaction, Objects.embed, 2, Objects.options),
          );
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

const getSavedEmbeds = async (msg) => {
  const res = await msg.client.ch.query(
    `SELECT * FROM customembeds WHERE guildid = $1 ORDER BY uniquetimestamp DESC;`,
    [msg.guild.id],
  );
  if (res && res.rowCount) return res.rows;
  return [];
};

const handleEmbedSelection = async ({ msg, answer }, Objects, { embed, components }) => {
  const embeds = await getSavedEmbeds(msg);

  const Options = {
    options: embeds.map((e) => {
      return { name: e.name.slice(0, 100), value: e.uniquetimestamp };
    }),
  };
  Options.page = Math.ceil(embeds.findIndex((e) => e.uniquetimestamp === answer.values[0]) / 25);
  if (Options.page === 0) Options.page = 1;

  Options.take = Options.options
    .map((option, i) =>
      i < 25 * Options.page && i > 25 * Options.page - 26
        ? { name: option.name, value: option.value }
        : null,
    )
    .filter((r) => !!r);

  Options.take.forEach((option, i) => {
    if (`${option.value}` === `${answer.values[0]}`) Options.take[i].default = true;
    else Options.take[i].default = false;
  });

  const newMenu = new Discord.MessageSelectMenu()
    .setCustomId('savedEmbedSelection')
    .setMaxValues(1)
    .setMinValues(1)
    .setPlaceholder(msg.language.commands.embedbuilder.embedPlaceholder)
    .setDisabled(
      !Options.take.length || !msg.member.permissions.has(module.exports.insideCommandPerm),
    )
    .addOptions(
      Options.take.length
        ? Options.take.map((e) => {
            return {
              label: e.name.slice(0, 100),
              value: `${e.value}`,
              default: e.default,
            };
          })
        : { label: 'placeholder', value: 'placeholder' },
    );

  const enableButtons = (customId, i, j) => {
    switch (customId) {
      default: {
        break;
      }
      case newMenu.customId: {
        if (typeof j === 'number') {
          components[i][j] = newMenu;
        } else {
          components[i] = newMenu;
        }
        break;
      }
      case 'inheritFromSavedEmbed': {
        if (typeof j === 'number') {
          components[i][j] = components[i][j].setDisabled(false);
        } else {
          components[i] = components[i].setDisabled(false);
        }
        break;
      }
      case 'deleteSavedEmbed': {
        if (typeof j === 'number') {
          components[i][j] = components[i][j].setDisabled(
            !msg.member.permissions.has(module.exports.insideCommandPerm),
          );
        } else {
          components[i] = components[i].setDisabled(
            !msg.member.permissions.has(module.exports.insideCommandPerm),
          );
        }
      }
    }
  };

  components.forEach((c, i) => {
    if (Array.isArray(c)) {
      c.forEach((o, j) => {
        enableButtons(o.customId, i, j);
      });
    } else if (c.customId === newMenu.customId) {
      enableButtons(c.customId, i);
    }
  });

  await replier({ msg, answer }, { embeds: [embed], components }, Objects);
};

const handleInherit = async ({ msg, answer }, Objects) => {
  const menu = answer.message.components[0].components.find((c) => {
    if (Array.isArray(c)) {
      return c
        .map((o) => {
          if (o.customId === 'savedEmbedSelection') return o;
          return null;
        })
        .filter((o) => !!o);
    }
    if (c.customId === 'savedEmbedSelection') return c;
    return null;
  });

  const selectedValue = menu.options.find((o) => o.default === true);
  const embeds = await getSavedEmbeds(msg);
  const selectedEmbed = embeds.find((e) => e.uniquetimestamp === selectedValue.value);
  const embed = msg.client.ch.getDiscordEmbed(selectedEmbed);

  return module.exports.builder(msg, answer, embed, 4, Objects.options);
};

const handleDelete = async ({ msg, answer }, Objects) => {
  const menu = answer.message.components[0].components.find((c) => {
    if (Array.isArray(c)) {
      return c
        .map((o) => {
          if (o.customId === 'savedEmbedSelection') return o;
          return null;
        })
        .filter((o) => !!o);
    }
    if (c.customId === 'savedEmbedSelection') return c;
    return null;
  });

  const selectedValue = menu.options.find((o) => o.default === true);

  await msg.client.ch.query(
    `DELETE FROM customembeds WHERE guildid = $1 AND uniquetimestamp = $2;`,
    [msg.guild.id, selectedValue.value],
  );

  return module.exports.builder(msg, answer, Objects.embed, 4, Objects.options);
};

const handlePage = async ({ msg, answer }, Objects, { embed }, increasePage) => {
  const embeds = await getSavedEmbeds(msg);

  const menu = answer.message.components[0].components.find((c) => {
    if (Array.isArray(c)) {
      return c
        .map((o) => {
          if (o.customId === 'savedEmbedSelection') return o;
          return null;
        })
        .filter((o) => !!o);
    }
    if (c.customId === 'savedEmbedSelection') return c;
    return null;
  });

  const Options = {
    options: embeds.map((e) => {
      return { name: e.name.slice(0, 100), value: e.uniquetimestamp };
    }),
  };
  Options.page = Math.ceil(
    embeds.findIndex((e) => e.uniquetimestamp === menu.options[10].value) / 25,
  );

  if (Options.page === 0) Options.page = 1;
  if (increasePage) Options.page += 1;
  else Options.page -= 1;

  Options.take = Options.options
    .map((option, i) =>
      i < 25 * Options.page && i > 25 * Options.page - 26
        ? { name: option.name, value: option.value }
        : null,
    )
    .filter((r) => !!r);

  const newMenu = new Discord.MessageSelectMenu()
    .setCustomId('savedEmbedSelection')
    .setMaxValues(1)
    .setMinValues(1)
    .setPlaceholder(msg.language.commands.embedbuilder.embedPlaceholder)
    .setDisabled(
      !Options.take.length || !msg.member.permissions.has(module.exports.insideCommandPerm),
    )
    .addOptions(
      Options.take?.length
        ? Options.take.map((e) => {
            return {
              label: e.name.slice(0, 100),
              value: `${e.value}`,
              default: e.default,
            };
          })
        : { label: 'placeholder', value: 'placeholder' },
    );

  const baseLan = msg.language.commands.embedbuilder;

  await replier(
    { msg, answer },
    {
      embeds: [embed],
      components: [
        [newMenu],
        getArrows(msg, Options.page, Math.ceil(embeds.length / 25)),
        getOtherButtons(baseLan),
        getNavigation(msg, 4),
      ],
    },
    Objects,
  );
};

const cantBeSent = (Objects) => {
  return (
    !Objects.embed.title &&
    (!Objects.embed.author || !Objects.embed.author.name) &&
    !Objects.embed.description &&
    (!Objects.embed.thumbnail || !Objects.embed.thumbnail.url) &&
    !Objects.embed.fields?.length &&
    (!Objects.embed.image || !Objects.embed.image.url) &&
    (!Objects.embed.footer || !Objects.embed.footer.text)
  );
};
