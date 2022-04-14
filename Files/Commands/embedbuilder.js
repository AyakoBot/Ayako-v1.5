const Discord = require('discord.js');
const Builders = require('@discordjs/builders');
const jobs = require('node-schedule');

const testReg = /discord\.com\/channels\//gi;

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
      embed: existingEmbed
        ? new Builders.UnsafeEmbedBuilder(existingEmbed.data)
        : new Builders.UnsafeEmbedBuilder(),
      page: page || 1,
      options,
    };

    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(lan.chooseTheEdit)
      .setColor(msg.client.ch.colorSelector(msg.guild.me));

    if (Objects.options) {
      embed.addFields({
        name: msg.language.commands.embedbuilder.replacedOptions,
        value: `${Objects.options
          .map((o) =>
            msg.client.ch.stp(msg.language.commands.embedbuilder.replacedOptionsDescription, {
              option: o[0],
              value: o[1],
            }),
          )
          .join('\n')}`,
      });
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
      finishedEmbed = new Builders.UnsafeEmbedBuilder()
        .setDescription(msg.language.commands.embedbuilder.warns.noValue)
        .setColor(16711680)
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
        case 'field-names': {
          embed.data.fieldNames?.forEach((field) => {
            total += field.name.length;
            total += field.value.length;
          });
          break;
        }
        case 'footer-text': {
          total += embed.data.footer?.name?.length || 0;
          break;
        }
        case 'author-name': {
          total += embed.data.author?.name?.length || 0;
          break;
        }
        default: {
          total += embed.data[type]?.length || 0;
          break;
        }
      }
    });

    if (total > limits.total) return 'total_fail';
  }

  switch (type) {
    case 'author-name': {
      return embed.data.author?.name?.length >= limits.fields[type];
    }
    case 'footer-text': {
      return embed.data.footer?.text?.length >= limits.fields[type];
    }
    case 'field-names' || 'field-values': {
      const failed = embed.data.fields
        ?.map((field, i) => {
          if (field.name.length >= limits.fields[type]) return i;
          if (field.name.length >= limits.fields[type]) return i;
          return undefined;
        })
        .filter((i) => i !== undefined);
      if (failed.lenght) return failed;
      return true;
    }
    default: {
      return embed.data[type]?.length >= limits.fields[type];
    }
  }
};

const getComponents = async (msg, { page, Objects }, editing) => {
  const components = [];
  const lan = msg.language.commands.embedbuilder.edit;
  const baseLan = msg.language.commands.embedbuilder;

  switch (page) {
    case 1: {
      let authorNameStyle = Objects.embed.data.author?.name
        ? Discord.ButtonStyle.Secondary
        : Discord.ButtonStyle.Primary;
      authorNameStyle = validate('author-name', Objects.embed, msg.client.constants)
        ? Discord.ButtonStyle.Danger
        : authorNameStyle;
      if (editing === 'author-name') authorNameStyle = Discord.ButtonStyle.Success;

      let titleStyle = Objects.embed.data.title
        ? Discord.ButtonStyle.Secondary
        : Discord.ButtonStyle.Primary;
      titleStyle = validate('title', Objects.embed, msg.client.constants)
        ? Discord.ButtonStyle.Danger
        : titleStyle;
      if (editing === 'title') titleStyle = Discord.ButtonStyle.Success;

      let descriptionStyle = Objects.embed.data.description
        ? Discord.ButtonStyle.Secondary
        : Discord.ButtonStyle.Primary;
      descriptionStyle = validate('description', Objects.embed, msg.client.constants)
        ? Discord.ButtonStyle.Danger
        : descriptionStyle;
      if (editing === 'description') descriptionStyle = Discord.ButtonStyle.Success;

      let footerTextStyle = Objects.embed.data.footer?.text
        ? Discord.ButtonStyle.Secondary
        : Discord.ButtonStyle.Primary;
      footerTextStyle = validate('footer-text', Objects.embed, msg.client.constants)
        ? Discord.ButtonStyle.Danger
        : footerTextStyle;
      if (editing === 'footer-text') footerTextStyle = Discord.ButtonStyle.Success;

      let authorIconUrlStyle = Objects.embed.data.author?.iconURL
        ? Discord.ButtonStyle.Secondary
        : Discord.ButtonStyle.Primary;
      if (editing === 'author-iconURL') authorIconUrlStyle = Discord.ButtonStyle.Success;

      let authorUrlStyle = Objects.embed.data.author?.url
        ? Discord.ButtonStyle.Secondary
        : Discord.ButtonStyle.Primary;
      if (editing === 'author-url') authorUrlStyle = Discord.ButtonStyle.Success;

      let urlStyle = Objects.embed.data.url
        ? Discord.ButtonStyle.Secondary
        : Discord.ButtonStyle.Primary;
      if (editing === 'url') urlStyle = Discord.ButtonStyle.Success;

      let thumbnailStyle = Objects.embed.data.thumbnail?.url
        ? Discord.ButtonStyle.Secondary
        : Discord.ButtonStyle.Primary;
      if (editing === 'thumbnail') thumbnailStyle = Discord.ButtonStyle.Success;

      let imageStyle = Objects.embed.data.image?.url
        ? Discord.ButtonStyle.Secondary
        : Discord.ButtonStyle.Primary;
      if (editing === 'image') imageStyle = Discord.ButtonStyle.Success;

      let footerIconUrlStyle = Objects.embed.data.footer?.iconURL
        ? Discord.ButtonStyle.Secondary
        : Discord.ButtonStyle.Primary;
      if (editing === 'footer-iconURL') footerIconUrlStyle = Discord.ButtonStyle.Success;

      let colorStyle = Objects.embed.data.color
        ? Discord.ButtonStyle.Secondary
        : Discord.ButtonStyle.Primary;
      if (editing === 'color') colorStyle = Discord.ButtonStyle.Success;

      let timestampStyle = Objects.embed.data.timestamp
        ? Discord.ButtonStyle.Secondary
        : Discord.ButtonStyle.Primary;
      if (editing === 'timestamp') timestampStyle = Discord.ButtonStyle.Success;

      components.push(
        [
          new Builders.UnsafeButtonBuilder()
            .setCustomId('author-name')
            .setLabel(lan['author-name'].name)
            .setStyle(authorNameStyle),
          new Builders.UnsafeButtonBuilder()
            .setCustomId('author-iconURL')
            .setLabel(lan['author-iconURL'].name)
            .setStyle(authorIconUrlStyle),
          new Builders.UnsafeButtonBuilder()
            .setCustomId('author-url')
            .setLabel(lan['author-url'].name)
            .setStyle(authorUrlStyle),
        ],
        [
          new Builders.UnsafeButtonBuilder()
            .setCustomId('title')
            .setLabel(lan.title.name)
            .setStyle(titleStyle),
          new Builders.UnsafeButtonBuilder()
            .setCustomId('url')
            .setLabel(lan.url.name)
            .setStyle(urlStyle),
          new Builders.UnsafeButtonBuilder()
            .setCustomId('description')
            .setLabel(lan.description.name)
            .setStyle(descriptionStyle),
        ],
        [
          new Builders.UnsafeButtonBuilder()
            .setCustomId('thumbnail')
            .setLabel(lan.thumbnail.name)
            .setStyle(thumbnailStyle),
          new Builders.UnsafeButtonBuilder()
            .setCustomId('image')
            .setLabel(lan.image.name)
            .setStyle(imageStyle),
          new Builders.UnsafeButtonBuilder()
            .setCustomId('color')
            .setLabel(lan.color.name)
            .setStyle(colorStyle),
        ],
        [
          new Builders.UnsafeButtonBuilder()
            .setCustomId('footer-text')
            .setLabel(lan['footer-text'].name)
            .setStyle(footerTextStyle),
          new Builders.UnsafeButtonBuilder()
            .setCustomId('footer-iconURL')
            .setLabel(lan['footer-iconURL'].name)
            .setStyle(footerIconUrlStyle),
          new Builders.UnsafeButtonBuilder()
            .setCustomId('timestamp')
            .setLabel(lan.timestamp.name)
            .setStyle(timestampStyle),
        ],
      );
      break;
    }
    case 2: {
      const options = Objects.embed.data.fields?.length
        ? Objects.embed.data.fields.map((field, i) =>
            new Builders.UnsafeSelectMenuOptionBuilder()
              .setLabel(field.name === '\u200b' ? msg.language.none : field.name.slice(0, 100))
              .setValue(i)
              .setDescription(
                field.value === '\u200b' ? msg.language.none : field.value.slice(0, 100),
              ),
          )
        : [
            new Builders.UnsafeSelectMenuOptionBuilder()
              .setLabel('placeholder')
              .setValue('placeholder'),
          ];

      components.push(
        [
          new Builders.UnsafeSelectMenuBuilder()
            .setCustomId('field-select')
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder(baseLan.fieldsPlaceholder)
            .setDisabled(!Objects.embed.data.fields?.length)
            .addOptions(...options),
        ],
        [
          new Builders.UnsafeButtonBuilder()
            .setCustomId('add-field')
            .setLabel(baseLan.addFields)
            .setStyle(Discord.ButtonStyle.Primary)
            .setDisabled(Objects.embed.data.fields?.length === 25),
        ],
      );
      break;
    }
    case 3: {
      components.push(
        [
          new Builders.UnsafeButtonBuilder()
            .setCustomId('inheritCode')
            .setLabel(baseLan.inheritCode)
            .setStyle(Discord.ButtonStyle.Primary),
          new Builders.UnsafeButtonBuilder()
            .setCustomId('viewRaw')
            .setLabel(baseLan.viewRaw)
            .setStyle(Discord.ButtonStyle.Primary),
        ],
        [
          new Builders.UnsafeButtonBuilder()
            .setCustomId('viewRawOtherMsg')
            .setLabel(baseLan.viewRawOtherMsg)
            .setStyle(Discord.ButtonStyle.Secondary),
        ],
        [
          new Builders.UnsafeButtonBuilder()
            .setCustomId('save')
            .setLabel(baseLan.save)
            .setStyle(Discord.ButtonStyle.Primary)
            .setDisabled(
              !(
                msg.member.permissions.has(module.exports.insideCommandPerm) && !cantBeSent(Objects)
              ) || !msg.member.permissions.has(32n),
            ),
          new Builders.UnsafeButtonBuilder()
            .setCustomId('send')
            .setLabel(baseLan.send)
            .setStyle(Discord.ButtonStyle.Primary)
            .setDisabled(
              !(msg.command.name === module.exports.name && !cantBeSent(Objects)) ||
                !msg.member.permissions.has(32n),
            ),
          new Builders.UnsafeButtonBuilder()
            .setCustomId('edit')
            .setLabel(baseLan.editMsg)
            .setStyle(Discord.ButtonStyle.Primary)
            .setDisabled(
              !(msg.command.name === module.exports.name && !cantBeSent(Objects)) ||
                !msg.member.permissions.has(32n),
            ),
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
    default: {
      break;
    }
  }

  components.push(getNavigation(msg, page));
  return components;
};

const getMenu = (savedEmbeds, baseLan, msg) => {
  const options = savedEmbeds.length
    ? savedEmbeds
        .map((embed, i) => {
          if (i < 25) {
            return new Builders.SelectMenuOptionBuilder()
              .setLabel(embed.name.slice(0, 100))
              .setValue(String(embed.uniquetimestamp));
          }
          return null;
        })
        .filter((r) => !!r)
    : [new Builders.SelectMenuOptionBuilder().setValue('0').setLabel('0')];

  return [
    new Builders.UnsafeSelectMenuBuilder()
      .setCustomId('savedEmbedSelection')
      .setMaxValues(1)
      .setMinValues(1)
      .setPlaceholder(baseLan.embedPlaceholder)
      .setDisabled(
        !savedEmbeds.length || !msg.member.permissions.has(module.exports.insideCommandPerm),
      )
      .addOptions(...options),
  ];
};

const getNavigation = (msg, page) => [
  new Builders.UnsafeButtonBuilder()
    .setLabel('\u200b')
    .setCustomId('left')
    .setStyle(Discord.ButtonStyle.Secondary)
    .setEmoji(msg.client.objectEmotes.back)
    .setDisabled(page === 1),
  new Builders.UnsafeButtonBuilder()
    .setLabel('\u200b')
    .setCustomId('cross')
    .setStyle(Discord.ButtonStyle.Danger)
    .setEmoji(msg.client.objectEmotes.cross),
  new Builders.UnsafeButtonBuilder()
    .setLabel('\u200b')
    .setCustomId('right')
    .setStyle(Discord.ButtonStyle.Secondary)
    .setEmoji(msg.client.objectEmotes.forth)
    .setDisabled(page === 4),
];

const getArrows = (msg, currentPage, maxPage) => [
  new Builders.UnsafeButtonBuilder()
    .setLabel('\u200b')
    .setCustomId('prev')
    .setStyle(Discord.ButtonStyle.Danger)
    .setEmoji(msg.client.objectEmotes.back)
    .setDisabled(currentPage === 1 || !maxPage),
  new Builders.UnsafeButtonBuilder()
    .setLabel('\u200b')
    .setCustomId('next')
    .setStyle(Discord.ButtonStyle.Primary)
    .setEmoji(msg.client.objectEmotes.forth)
    .setDisabled(currentPage === maxPage || !maxPage),
];

const getOtherButtons = (baseLan) => [
  new Builders.UnsafeButtonBuilder()
    .setCustomId('inheritFromSavedEmbed')
    .setLabel(baseLan.inheritFromSavedEmbed)
    .setStyle(Discord.ButtonStyle.Primary)
    .setDisabled(true),
  new Builders.UnsafeButtonBuilder()
    .setCustomId('deleteSavedEmbed')
    .setLabel(baseLan.deleteSavedEmbed)
    .setStyle(Discord.ButtonStyle.Primary)
    .setDisabled(true),
];

const handleBuilderButtons = async ({ msg, answer }, Objects, lan, { embed, components }) => {
  const reply = async (editing, interaction) => {
    const lang = msg.language.commands.embedbuilder.edit[editing];

    const recommendedEmbed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setTitle(lang.name)
      .setDescription(lang.answers);

    if (Objects.options) {
      recommendedEmbed.addFields({
        name: msg.language.commands.embedbuilder.replacedOptions,
        value: `${Objects.options
          .map((o) =>
            msg.client.ch.stp(msg.language.commands.embedbuilder.replacedOptionsDescription, {
              option: o[0],
              value: o[1],
            }),
          )
          .join('\n')}`,
      });
    }

    if (lang.recommended) {
      recommendedEmbed.addFields({ name: '\u200b', value: lang.recommended });
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

          const inheritCodeEmbed = new Builders.UnsafeEmbedBuilder().setDescription(
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

              Objects.embed = new Builders.UnsafeEmbedBuilder(code);
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
        case 'edit': {
          messageCollector.stop();
          buttonsCollector.stop();
          resolve(await handleEdit(msg, interaction, Objects));
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
          Objects.embed.addFields({ name: '\u200b', value: '\u200b', inline: false });

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
        default: {
          reply(editing, interaction);
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
        case 'color': {
          const int = parseInt(message.content, 16);
          let e;
          try {
            new Builders.UnsafeEmbedBuilder().setColor(int);
          } catch (err) {
            e = err;
          }

          if (e) {
            let valid;

            await errorVal(msg, lan, valid, Objects, e, answer);
            break;
          }

          Objects.embed.setColor(int);
          break;
        }
        case 'title': {
          const passesLength = limits.title >= message.content.length;

          let e;
          if (!passesLength) {
            try {
              new Builders.UnsafeEmbedBuilder().setTitle(message.content);
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
              new Builders.UnsafeEmbedBuilder().setURL(message.content);
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
              new Builders.UnsafeEmbedBuilder().setAuthor({ name: message.content });
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
            url: Objects.embed.data.author?.url,
            iconURL: Objects.embed.data.author?.iconURL,
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
              new Builders.UnsafeEmbedBuilder().setAuthor({
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
              Objects.embed.data.author && Objects.embed.data.author.name
                ? Objects.embed.data.author.name
                : '\u200b',
            url: Objects.embed.data.author?.url,
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
              new Builders.UnsafeEmbedBuilder().setAuthor({ name: '\u200b', url: message.content });
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
              Objects.embed.data.author && Objects.embed.data.author.name
                ? Objects.embed.data.author.name
                : '\u200b',
            url: message.content,
            iconURL: Objects.embed.data.author?.iconURL,
          });
          break;
        }
        case 'description': {
          let e;
          try {
            new Builders.UnsafeEmbedBuilder().setDescription(message.content);
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
              new Builders.UnsafeEmbedBuilder().setImage(message.content);
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
              new Builders.UnsafeEmbedBuilder().setThumbnail(message.content);
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
              new Builders.UnsafeEmbedBuilder().setTimestamp(message.content);
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
            new Builders.UnsafeEmbedBuilder().setFooter({ text: message.content });
          } catch (err) {
            e = err;
          }

          if (e) {
            await errorVal(msg, lan, null, Objects, e, answer);
            break;
          }

          Objects.embed.setFooter({
            text: message.content,
            iconUrl: Objects.embed.data.footer?.iconUrl,
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
              new Builders.UnsafeEmbedBuilder().setFooter({
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
              Objects.embed.data.footer && Objects.embed.data.footer.text
                ? Objects.embed.data.footer.text
                : '\u200b',
          });
          break;
        }
        default: {
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
        new Builders.UnsafeButtonBuilder()
          .setLabel('\u200b')
          .setStyle(Discord.ButtonStyle.Primary)
          .setEmoji(msg.client.objectEmotes.back)
          .setCustomId('back'),
      ],
    ]);
  }

  const rawCode = new Builders.UnsafeEmbedBuilder(Objects.embed.data).toJSON();
  if (rawCode.length > 4000) {
    const attachment = msg.client.ch.txtFileWriter([rawCode]);

    replier({ msg, answer }, { files: [attachment], components, embeds: [embed] });
  } else {
    const embeds = [];
    if (embed) embeds.push(embed);
    embeds.push(
      new Builders.UnsafeEmbedBuilder()
        .setAuthor({
          name: msg.language.commands.embedbuilder.author,
          iconURL: msg.client.constants.commands.embedbuilder.author,
          url: msg.client.constants.standard.invite,
        })
        .setDescription(msg.client.ch.makeCodeBlock(JSON.stringify(rawCode, null, 1)))
        .setColor(16777215)
        .setTitle(msg.language.commands.embedbuilder.unsaved)
        .addFields({ name: '\u200b', value: msg.language.commands.embedbuilder.unsavedFieldValue }),
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
  const save = new Builders.UnsafeButtonBuilder()
    .setCustomId('save')
    .setLabel(lan.save)
    .setStyle(Discord.ButtonStyle.Primary)
    .setDisabled(true);

  const embed = new Builders.UnsafeEmbedBuilder().setDescription(lan.giveName).setAuthor({
    name: msg.language.commands.embedbuilder.author,
    iconURL: msg.client.constants.commands.embedbuilder.author,
    url: msg.client.constants.standard.invite,
  });

  await replier({ msg, answer }, { embeds: [embed], components: [save] }, Objects);

  return new Promise((resolve) => {
    let name;

    const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });
    const messageCollector = msg.channel.createMessageCollector({ time: 60000 });

    const back = new Builders.UnsafeButtonBuilder()
      .setLabel('\u200b')
      .setEmoji(msg.client.objectEmotes.back)
      .setStyle(Discord.ButtonStyle.Primary)
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

      const newSave = new Builders.UnsafeButtonBuilder()
        .setCustomId('save')
        .setLabel(lan.save)
        .setStyle(Discord.ButtonStyle.Primary)
        .setDisabled(!name);

      embed.data.fields = [];
      embed.addFields({
        name: msg.language.name,
        value: `\u200b${message.content.slice(0, 1024)}`,
      });
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

      resolve({
        embed: emb,
        answer: interaction,
        name,
        now,
      });
    });
    buttonsCollector.on('end', (collected, reason) => {
      if (reason === 'time') {
        resolve(null);

        postCode(Objects, msg);
      }
    });
  });
};

const handleEdit = async (msg, answer, Objects) => {
  const getButtons = (options) => {
    const edit = new Builders.UnsafeButtonBuilder()
      .setCustomId('edit')
      .setLabel(msg.language.commands.embedbuilder.editMsg)
      .setStyle(Discord.ButtonStyle.Primary)
      .setDisabled(!options.selected || !msg.member.permissions.has(32n));

    return [edit];
  };

  const getEmbed = (options) => {
    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(
        `${msg.language.commands.embedbuilder.editWhat}\n\n**${msg.language.selected}**:\n${
          options.selected ? options.selected : msg.language.none
        }`,
      );

    return embed;
  };

  const options = {
    selected: null,
  };

  await replier(
    { msg, answer },
    { embeds: [getEmbed(options)], components: getButtons(options) },
    Objects,
  );

  const messageCollector = msg.channel.createMessageCollector({ time: 60000 });
  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });

  messageCollector.on('collect', (m) => {
    if (m.author.id !== msg.author.id) return;

    options.selected = m.content?.toLowerCase();
    m.delete().catch(() => {});

    replier(
      { msg, answer },
      { embeds: [getEmbed(options)], components: getButtons(options) },
      Objects,
    );
  });

  buttonsCollector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) {
      msg.client.ch.notYours(interaction);
      return;
    }
    buttonsCollector.resetTimer();

    switch (interaction.customId) {
      case 'edit': {
        const [, , , guildid, channelid, msgid] = options.selected.split(/\/+/);
        const guild = msg.client.guilds.cache.get(guildid);
        let channel;
        let m;
        let err;

        if (guild) {
          channel = guild.channels.cache.get(channelid);
        } else {
          err = `${msg.language.commands.embedbuilder.notMsgLink}\n${msg.language.commands.embedbuilder.noAccess}`;
        }

        if (channel) {
          if (guild.id !== msg.guild.id) err = msg.language.commands.embedbuilder.notGuild;
          else {
            m = await channel.messages.fetch(msgid).catch((e) => {
              err = e;
            });

            if (m) {
              if (m.author.id !== msg.client.user.id) {
                err = msg.language.commands.embedbuilder.notMine;
              } else {
                m = await m.edit({ embeds: [Objects.embed], content: null }).catch((e) => {
                  err = e;
                });
              }
            } else {
              err = `${msg.language.commands.embedbuilder.notMsgLink}\n${msg.language.commands.embedbuilder.noAccess}`;
            }
          }
        } else {
          err = `${msg.language.commands.embedbuilder.notMsgLink}\n${msg.language.commands.embedbuilder.noAccess}`;
        }

        if (err) {
          interaction.language = msg.language;
          msg.client.ch.error(interaction, err);
          return;
        }
        buttonsCollector.stop();
        messageCollector.stop();

        const embed = new Builders.UnsafeEmbedBuilder()
          .setAuthor({
            name: msg.language.commands.embedbuilder.author,
            iconURL: msg.client.constants.commands.embedbuilder.author,
            url: msg.client.constants.standard.invite,
          })
          .setDescription(
            m
              ? msg.client.ch.stp(`${msg.language.commands.embedbuilder.editSuccess}`, {
                  message: options.selected,
                })
              : '',
          );

        await replier({ msg, answer: interaction }, { embeds: [embed], components: [] }, Objects);
        return;
      }
      default: {
        break;
      }
    }

    await replier(
      { msg, answer: interaction },
      { embeds: [getEmbed(options)], components: getButtons(options) },
      Objects,
    );
  });
};

const handleSend = async (msg, answer, Objects) => {
  const getButtons = (options) => {
    const next = new Builders.UnsafeButtonBuilder()
      .setCustomId('next')
      .setLabel(msg.language.next)
      .setDisabled(
        options.options.length > 25 && options.page === Math.ceil(options.options.length / 25),
      )
      .setStyle(Discord.ButtonStyle.Primary);
    const prev = new Builders.UnsafeButtonBuilder()
      .setCustomId('prev')
      .setLabel(msg.language.prev)
      .setDisabled(options.page === 1)
      .setStyle(Discord.ButtonStyle.Danger);
    const send = new Builders.UnsafeButtonBuilder()
      .setCustomId('send')
      .setLabel(msg.language.commands.embedbuilder.send)
      .setStyle(Discord.ButtonStyle.Primary)
      .setDisabled(!msg.member.permissions.has(32n));
    const channels = new Builders.UnsafeSelectMenuBuilder()
      .setCustomId('channels')
      .addOptions(...options.take)
      .setPlaceholder(msg.language.select.channels.select)
      .setMaxValues(options.take.length)
      .setMinValues(1);

    return [[prev, next], channels, send];
  };

  const getEmbed = (options) => {
    const embed = new Builders.UnsafeEmbedBuilder()
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
      .addFields({
        name: msg.language.page,
        value: `\`${options.page}/${Math.ceil(options.options.length / 25)}\``,
      });

    return embed;
  };

  const options = {
    page: 1,
    options: msg.guild.channels.cache
      .filter((c) => [0, 5, 10, 11, 12].includes(c.type))
      .sort((a, b) => a.rawPosition - b.rawPosition)
      .map((c) => new Builders.SelectMenuOptionBuilder().setLabel(c.name).setValue(String(c.id))),
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

        const embed = new Builders.UnsafeEmbedBuilder()
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
              successes.map((c) =>
                msg.client.ch.stp(`${msg.language.commands.embedbuilder.sendSuccess}`, {
                  channel: `<#${c[0]}>`,
                }),
              ))
            }`,
          );

        await replier({ msg, answer: interaction }, { embeds: [embed], components: [] }, Objects);
        return;
      }
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
    const embed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(msg.language.commands.embedbuilder.noUrlFound);

    return replier({ msg, answer }, { embeds: [embed], components: [] }, Objects);
  };

  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: msg.language.commands.embedbuilder.author,
      iconURL: msg.client.constants.commands.embedbuilder.author,
      url: msg.client.constants.standard.invite,
    })
    .setDescription(msg.language.commands.embedbuilder.otherMsg)
    .addFields({
      name: msg.language.Examples,
      value: msg.client.constants.discordMsgUrls.map((url) => `\`${url}\``).join('\n'),
    });

  const back = new Builders.UnsafeButtonBuilder()
    .setLabel('\u200b')
    .setEmoji(msg.client.objectEmotes.back)
    .setStyle(Discord.ButtonStyle.Primary)
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
    case 'length': {
      lanError = msg.client.ch.stp(lan.lengthFail, { max: valid });
      break;
    }
    case 'noTimestamp': {
      lanError = lan.noTimestamp;
      break;
    }
    default: {
      lanError = error;
      break;
    }
  }

  const errorEmbed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: msg.language.commands.embedbuilder.author,
      iconURL: msg.client.constants.commands.embedbuilder.author,
      url: msg.client.constants.standard.invite,
    })
    .setDescription(msg.language.commands.embedbuilder.errorVal)
    .setColor(16711680);
  if (error) errorEmbed.addFields({ name: msg.language.error, value: `${lanError}` });

  await replier({ msg, answer }, { embeds: [errorEmbed], components: [] }, Objects);

  const reaction = await msg.m.react(msg.client.objectEmotes.timers[3].id);

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
  const selected = Objects.embed.data.fields[index];
  let editing = 'name';

  const getFieldComponents = () => [
    [
      new Builders.UnsafeButtonBuilder()
        .setCustomId('remove-field')
        .setLabel(baseLan.removeField)
        .setStyle(Discord.ButtonStyle.Danger),
    ],
    [
      new Builders.UnsafeButtonBuilder()
        .setCustomId('name')
        .setLabel(baseLan.fieldName)
        .setStyle(editing === 'name' ? Discord.ButtonStyle.Primary : Discord.ButtonStyle.Secondary),
      new Builders.UnsafeButtonBuilder()
        .setCustomId('value')
        .setLabel(baseLan.fieldValue)
        .setStyle(
          editing === 'value' ? Discord.ButtonStyle.Primary : Discord.ButtonStyle.Secondary,
        ),
      new Builders.UnsafeButtonBuilder()
        .setCustomId('inline')
        .setLabel(baseLan.fieldInline)
        .setStyle(selected.inline ? Discord.ButtonStyle.Success : Discord.ButtonStyle.Secondary),
    ],
    [
      new Builders.UnsafeButtonBuilder()
        .setLabel('\u200b')
        .setStyle(Discord.ButtonStyle.Primary)
        .setEmoji(msg.client.objectEmotes.back)
        .setCustomId('back'),
    ],
  ];

  const getEmbed = () => {
    const baseEmbed = new Builders.UnsafeEmbedBuilder()
      .setAuthor({
        name: msg.language.commands.embedbuilder.author,
        iconURL: msg.client.constants.commands.embedbuilder.author,
        url: msg.client.constants.standard.invite,
      })
      .setDescription(baseLan.chooseTheEdit);

    if (Objects.options) {
      baseEmbed.addFields({
        name: msg.language.commands.embedbuilder.replacedOptions,
        value: `${Objects.options
          .map((o) =>
            msg.client.ch.stp(msg.language.commands.embedbuilder.replacedOptionsDescription, {
              option: o[0],
              value: o[1],
            }),
          )
          .join('\n')}`,
      });
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
      if (message.author.id !== msg.author.id) return;

      messageCollector.resetTimer();
      const collected = message.content;

      message.delete().catch(() => {});
      switch (editing) {
        case 'name': {
          try {
            new Builders.UnsafeEmbedBuilder().addFields({ name: collected, value: '\u200b' });
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
            new Builders.UnsafeEmbedBuilder().addFields({ name: '\u200b', value: collected });
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
        default: {
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
        case 'inline': {
          await interaction.deferUpdate().catch(() => {});
          selected.inline = !selected.inline;
          break;
        }
        case 'remove-field': {
          Objects.embed.data.fields.splice(index, 1);
          buttonsCollector.stop();
          messageCollector.stop();
          resolve(
            await module.exports.builder(msg, interaction, Objects.embed, 2, Objects.options),
          );
          return;
        }
        case 'name': {
          await interaction.deferUpdate().catch(() => {});
          editing = 'name';
          break;
        }
        case 'value': {
          await interaction.deferUpdate().catch(() => {});
          editing = 'value';
          break;
        }
        case 'back': {
          buttonsCollector.stop();
          messageCollector.stop();
          resolve(
            await module.exports.builder(msg, interaction, Objects.embed, 2, Objects.options),
          );
          return;
        }
        default: {
          break;
        }
      }

      await replier(
        { msg, answer },
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
    options: embeds.map((e) => ({ name: e.name.slice(0, 100), value: e.uniquetimestamp })),
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

  const newMenu = new Builders.UnsafeSelectMenuBuilder()
    .setCustomId('savedEmbedSelection')
    .setMaxValues(1)
    .setMinValues(1)
    .setPlaceholder(msg.language.commands.embedbuilder.embedPlaceholder)
    .setDisabled(
      !Options.take.length || !msg.member.permissions.has(module.exports.insideCommandPerm),
    )
    .addOptions(
      ...(Options.take.length
        ? Options.take.map((e) =>
            new Builders.SelectMenuOptionBuilder()
              .setLabel(e.name.slice(0, 100))
              .setValue(String(e.value))
              .setDefault(e.default),
          )
        : [new Builders.SelectMenuOptionBuilder().setLabel('0').setValue('0')]),
    );

  const enableButtons = (customId, i, j) => {
    switch (customId) {
      case newMenu.data.custom_id: {
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
        break;
      }
      default: {
        break;
      }
    }
  };

  components.forEach((c, i) => {
    c.forEach((o, j) => {
      enableButtons(o.data.custom_id, i, j);
    });
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

  const selectedValue = menu.data.options.find((o) => o.default === true);
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
    options: embeds.map((e) => ({ name: e.name.slice(0, 100), value: e.uniquetimestamp })),
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

  const newMenu = new Builders.UnsafeSelectMenuBuilder()
    .setCustomId('savedEmbedSelection')
    .setMaxValues(1)
    .setMinValues(1)
    .setPlaceholder(msg.language.commands.embedbuilder.embedPlaceholder)
    .setDisabled(
      !Options.take.length || !msg.member.permissions.has(module.exports.insideCommandPerm),
    )
    .addOptions(
      ...(Options.take?.length
        ? Options.take.map((e) =>
            new Builders.UnsafeSelectMenuOptionBuilder()
              .setLabel(e.name.slice(0, 100))
              .setValue(`${e.value}`)
              .setDefault(e.default),
          )
        : new Builders.UnsafeSelectMenuOptionBuilder()
            .setLabel('placeholder')
            .setValue('placeholder')),
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

const cantBeSent = (Objects) =>
  !Objects.embed.data.title &&
  (!Objects.embed.data.author || !Objects.embed.data.author.name) &&
  !Objects.embed.data.description &&
  (!Objects.embed.data.thumbnail || !Objects.embed.data.thumbnail.url) &&
  !Objects.embed.data.fields?.length &&
  (!Objects.embed.data.image || !Objects.embed.data.image.url) &&
  (!Objects.embed.data.footer || !Objects.embed.data.footer.text);
