const Discord = require('discord.js');

const testReg = /(canary\.discord|ptb\.discord|discord)\.com\/channels\//gi;
const colorReg = /[0-9A-Fa-f]{6}/g;

module.exports = {
  name: 'embedbuilder',
  perm: 2048n,
  dm: true,
  takesFirstArg: false,
  aliases: ['eb'],
  async execute(msg) {
    const embed = await this.builder(msg);

    if (embed) {
      msg.client.ch.reply(msg, embed);
    }
  },
  async builder(msg, answer, existingEmbed, page) {
    if (typeof page !== 'number') page = 1;

    const lan = msg.language.commands.embedBuilder;
    const finishedEmbed = new Discord.MessageEmbed().setDescription(lan.placeholder);

    const Objects = {
      edit: 'menu',
      category: null,
      embed: existingEmbed || finishedEmbed,
    };

    const embed = new Discord.MessageEmbed()
      .setDescription(lan.chooseTheEdit)
      .setColor(msg.client.ch.colorSelector(msg.guild.me));

    await replier(
      { msg, answer },
      { embeds: [embed], components: getComponents(msg, { page, Objects }) },
      Objects,
    );

    Objects.embed.description = undefined;

    return new Promise((resolve) => {
      handleBuilderButtons({ msg, answer }, Objects, resolve, lan);
    });
  },
};

const replier = async ({ msg, answer }, { embeds, components, content, files }, Objects) => {
  if (components) components = msg.client.ch.buttonRower(components);

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
        .setDescription(msg.language.commands.embedBuilder.warns.noValue)
        .setColor('FF0000')
        .setThumbnail(msg.client.constants.commands.embedBuilder.error);
    } else {
      finishedEmbed = Objects.embed;
    }

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

const getComponents = (msg, { page, Objects }) => {
  const components = [];
  const lan = msg.language.commands.embedBuilder.edit;
  const baseLan = msg.language.commands.embedBuilder;

  switch (page) {
    default: {
      break;
    }
    case 1: {
      components.push(
        [
          new Discord.MessageButton()
            .setCustomId('author-name')
            .setLabel(lan['author-name'].name)
            .setStyle(
              validate('author-name', Objects.embed, msg.client.constants) ? 'DANGER' : 'SECONDARY',
            ),
          new Discord.MessageButton()
            .setCustomId('author-iconURL')
            .setLabel(lan['author-iconURL'].name)
            .setStyle('SECONDARY'),
          new Discord.MessageButton()
            .setCustomId('author-url')
            .setLabel(lan['author-url'].name)
            .setStyle('SECONDARY'),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('title')
            .setLabel(lan.title.name)
            .setStyle(
              validate('title', Objects.embed, msg.client.constants) ? 'DANGER' : 'SECONDARY',
            ),
          new Discord.MessageButton()
            .setCustomId('url')
            .setLabel(lan.url.name)
            .setStyle('SECONDARY'),
          new Discord.MessageButton()
            .setCustomId('description')
            .setLabel(lan.description.name)
            .setStyle(
              validate('description', Objects.embed, msg.client.constants) ? 'DANGER' : 'SECONDARY',
            ),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('thumbnail')
            .setLabel(lan.thumbnail.name)
            .setStyle('SECONDARY'),
          new Discord.MessageButton()
            .setCustomId('image')
            .setLabel(lan.image.name)
            .setStyle('SECONDARY'),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('footer-text')
            .setLabel(lan['footer-text'].name)
            .setStyle(
              validate('footer-text', Objects.embed, msg.client.constants) ? 'DANGER' : 'SECONDARY',
            ),
          new Discord.MessageButton()
            .setCustomId('footer-iconURL')
            .setLabel(lan['footer-iconURL'].name)
            .setStyle('SECONDARY'),
        ],
        [
          new Discord.MessageButton()
            .setCustomId('color')
            .setLabel(lan.color.name)
            .setStyle('SECONDARY'),
          new Discord.MessageButton()
            .setCustomId('timestamp')
            .setLabel(lan.timestamp.name)
            .setStyle('SECONDARY'),
        ],
      );
      break;
    }
    case 2: {
      components.push(
        [
          new Discord.MessageButton()
            .setCustomId('add-field')
            .setLabel(baseLan.addField)
            .setStyle('PRIMARY')
            .setDisabled(Objects.embed.fields.length === 25),
          new Discord.MessageButton()
            .setCustomId('remove-field')
            .setLabel(baseLan.removeField)
            .setStyle('PRIMARY')
            .setDisabled(!Objects.embed.fields.length),
        ],
        [
          new Discord.MessageSelectMenu()
            .setCustomId('field-select')
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder(baseLan.fieldsPlaceholder)
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
            .setDisabled(msg.command.name === this.name),
          new Discord.MessageButton()
            .setCustomId('send')
            .setLabel(baseLan.send)
            .setStyle('PRIMARY')
            .setDisabled(msg.command.name !== this.name),
        ],
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

const postCode = (Objects, msg, interaction, embed, noRemove) => {
  if (!noRemove) msg.m.reactions.removeAll().catch(() => {});

  const rawCode = Objects.embed.toJSON();
  if (rawCode.length > 4000) {
    const path = msg.client.ch.txtFileWriter(msg, [rawCode], 'json');

    replier({ msg, answer: interaction }, { files: [path], components: [], embeds: [embed] });
  } else {
    const embeds = [];
    

    replier(
      { msg, answer: interaction },
      {
        embeds: [
          embed,
          new Discord.MessageEmbed()
            .setDescription(msg.client.ch.makeCodeBlock(JSON.stringify(rawCode)))
            .setColor('ffffff')
            .setTitle(msg.language.commands.embedBuilder.unsaved)
            .addField('\u200b', msg.language.commands.embedBuilder.unsavedFieldValue),
        ],
        components: [],
      },
    );
  }
};

const handleSave = async (msg, answer, Objects) => {
  const lan = msg.language.commands.embedBuilder;
  const save = new Discord.MessageButton()
    .setCustomId('save')
    .setLabel(lan.save)
    .setStyle('PRIMARY')
    .setDisabled(true);

  const embed = new Discord.MessageEmbed().setDescription(lan.giveName);
  await replier({ msg, answer }, { embeds: [embed], components: [save] }, Objects);

  return new Promise((resolve) => {
    let name;
    const messageCollector = msg.channel.createMessageCollector({ time: 60000 });
    const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });

    messageCollector.on('collect', (message) => {
      if (message.author.id !== msg.author.id) return;

      messageCollector.stop();
      message.delete().catch(() => {});

      new Discord.MessageButton()
        .setCustomId('save')
        .setLabel(lan.save)
        .setStyle('PRIMARY')
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

const handleSend = async (msg, answer, Objects) => {
  const getButtons = (options) => {
    const next = new Discord.MessageButton()
      .setCustomId('next')
      .setLabel(msg.language.next)
      .setDisabled(
        options.options.length > 25 && options.page === Math.ceil(options.options.length / 25),
      )
      .setStyle('PRIMARY');
    const prev = new Discord.MessageButton()
      .setCustomId('prev')
      .setLabel(msg.language.prev)
      .setDisabled(options.page === 1)
      .setStyle('PRIMARY');
    const send = new Discord.MessageButton()
      .setCustomId('send')
      .setLabel(msg.language.commands.embedBuilder.send)
      .setStyle('PRIMARY');
    const channels = new Discord.MessageSelectMenu()
      .setCustomId('channels')
      .addOptions(options.take)
      .setPlaceholder(msg.language.select.select)
      .setMaxValues(options.take.length)
      .setMinValues(1);

    return [prev, next, send, channels];
  };

  const getEmbed = (options) => {
    const embed = new Discord.MessageEmbed()
      .setDescription(
        `${msg.language.commands.embedBuilder.sendWhere}\n\n**${msg.language.selected}**:\n${
          options.selected.lenght
            ? options.selected.map((c) => `<#${c}>`).join(', ')
            : msg.language.none
        }`,
      )
      .addField(msg.language.page, options.page);

    return embed;
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
      .map((c) => {
        return { name: c.name, value: c.id };
      }),
    selected: [],
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
        options.take = options.options.filter((o, i) => i < 25 + 25 * (options.page - 1));
        break;
      }
      case 'prev': {
        options.page -= 1;
        options.take = options.options.filter((o, i) => i < 25 + 25 * (options.page - 1));
        break;
      }
      case 'send': {
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

        const embed = new Discord.MessageEmbed().setDescription(
          `${
            (errors.length
              ? errors
                  .map(
                    (err) =>
                      `${msg.client.ch.stp(`${msg.language.commands.embedBuilder.sendError}`, {
                        channel: `<#${err[0]}>`,
                        error: err[1],
                      })}`,
                  )
                  .join('\n')
              : '',
            successes.map((c) => {
              return msg.client.ch.stp(`${msg.language.commands.embedBuilder.sendSuccess}`, {
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
      { embeds: [getEmbed(options)], components: getComponents(options) },
      Objects,
    );
  });
};

const handleOtherMsgRaw = async (msg, answer, Objects) => {
  const noFound = () => {
    const embed = new Discord.MessageEmbed().setDescription(
      msg.language.commands.embedBuilder.noUrlFound,
    );

    return replier({ msg, answer }, { embeds: [embed], components: [] }, Objects);
  };

  const embed = new Discord.MessageEmbed()
    .setDescription(msg.language.commands.embedBuilder.otherMsg)
    .addField(
      msg.language.Examples,
      msg.client.constants.discordMsgUrls.map((url) => `\`${url}\``).join('\n'),
    );

  replier({ msg, answer }, { embeds: [embed], components: [] }, Objects);

  const messageCollector = msg.m.createMessageCollector({ time: 60000 });
  messageCollector.on('collect', async (message) => {
    if (message.author.id !== msg.author.id) return;

    message.delete().catch(() => {});
    messageCollector.stop();

    if (!testReg.test(message.content)) {
      noFound(msg);
      return;
    }

    const args = message.content.replace(/\n/g, ' ').split(/ +/);
    const messageUrls = [];

    args.forEach((arg) => {
      if (testReg.test(arg)) {
        messageUrls.push(arg);
      }
    });

    const messagePromises = messageUrls.map(async (url) => {
      const path = url.replace(testReg, '');

      const ids = path.split(/\/+/);

      if (Number.isNaN(+ids[0]) && ids[0] === '@me') {
        return (
          await msg.client.guilds.cache.channels
            .fetch(ids[1])
            .catch((e) => e)
            .then((c) => c)
        )?.messages
          ?.fetch(ids[2])
          ?.catch((e) => e)
          ?.then((m) => m);
      }
      return msg.client.channels.cache
        .get(ids[1])
        .messages?.fetch(ids[2])
        .catch((e) => e)
        ?.then((m) => m);
    });

    const messages = await Promise.all(messagePromises);

    const messageEmbedJSONs = [];
    messages.forEach((m) => {
      m.embeds.forEach((membed) => {
        messageEmbedJSONs.push(new Discord.MessageEmbed(membed).toJSON());
      });
    });

    const path = msg.client.ch.txtFileWriter(msg, messageEmbedJSONs, 'json');

    msg.client.ch.send(msg.channel, { files: [path] });
  });
};

const embedButtonsHandler = async (Objects, msg, answer) => {
  const messageHandler = (type) => {
    const messageCollector = msg.channel.createMessageCollector({ time: 60000 });
    const lan = msg.language.commands.embedBuilder.edit[type];

    const embed = new Discord.MessageEmbed().setTitle(lan.name).setDescription(lan.answers);

    if (lan.recommended) {
      embed.addField('\u200b', lan.recommended);
    }

    replier({ msg, answer }, { embeds: [embed], components: [] }, Objects);

    return new Promise((resolve) => {
      messageCollector.on('collect', (message) => {
        if (message.author.id !== msg.author.id) return;

        message.delete().catch(() => {});
        messageCollector.stop();
        resolve(message.content);
      });

      messageCollector.on('end', (collected, reason) => {
        if (reason === 'time') {
          msg.client.ch.collectorEnd(msg);
          resolve();
        }
      });
    });
  };

  const limits = msg.client.constants.customembeds.limits.fields;

  const errorVal = (error, valid) => {
    const lan = msg.language.commands.embedBuilder;
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

    const embed = new Discord.MessageEmbed()
      .setDescription(msg.language.commands.embedBuilder.errorVal)
      .setColor('ff0000');
    if (error) embed.addField(msg.language.error, `${lanError}`);

    replier({ msg, answer }, { embeds: [embed], components: [] }, Objects);
    return true;
  };

  const entered = await messageHandler(answer.customId);
  let errored = false;
  if (!entered) return;

  switch (answer.customId) {
    default: {
      break;
    }
    case 'color': {
      const passesReg = colorReg.test(entered);

      let e;
      if (passesReg) {
        try {
          new Discord.MessageEmbed().setColor(entered);
        } catch (err) {
          e = err;
        }
      }

      if (!passesReg || e) {
        let valid;
        if (!passesReg) valid = 'regFail';

        errored = errorVal(e, valid);
        break;
      }

      Objects.embed.setColor(entered);
      break;
    }
    case 'title': {
      const passesLength = limits.title >= entered.length;

      let e;
      if (!passesLength) {
        try {
          new Discord.MessageEmbed().setTitle(entered);
        } catch (err) {
          e = err;
        }
      }

      if (e || !passesLength) {
        let valid;
        if (!passesLength) valid = 'length';

        errored = errorVal(e, valid);
        break;
      }

      Objects.embed.setTitle(entered);
      break;
    }
    case 'url': {
      let isUrl = false;
      try {
        URL(entered);
        isUrl = true;
      } catch (err) {
        isUrl = false;
      }

      let e;
      if (!isUrl) {
        try {
          new Discord.MessageEmbed().setURL(entered);
        } catch (err) {
          e = err;
        }
      }

      if (e || !isUrl) {
        let valid;
        if (!isUrl) valid = 'noUrl';

        errored = errorVal(e, valid);
        break;
      }

      Objects.embed.setURL(entered);
      break;
    }
    case 'author-name': {
      const passesLength = limits['author-name'] >= entered.length;

      let e;
      if (!passesLength) {
        try {
          new Discord.MessageEmbed().setAuthor({ name: entered });
        } catch (err) {
          e = err;
        }
      }

      if (e || !passesLength) {
        let valid;
        if (!passesLength) valid = 'length';

        errored = errorVal(e, valid);
        break;
      }

      Objects.embed.setAuthor({
        name: entered,
        url: Objects.embed.author?.url,
        iconURL: Objects.embed.author?.iconURL,
      });
      break;
    }
    case 'author-iconURL': {
      let isUrl = false;
      try {
        URL(entered);
        isUrl = true;
      } catch (err) {
        isUrl = false;
      }

      let e;
      if (!isUrl) {
        try {
          new Discord.MessageEmbed().setAuthor({ iconURL: entered });
        } catch (err) {
          e = err;
        }
      }

      if (e || !isUrl) {
        let valid;
        if (!isUrl) valid = 'noUrl';

        errored = errorVal(e, valid);
        break;
      }

      Objects.embed.setAuthor({
        name: Objects.embed.author?.name,
        url: Objects.embed.author?.url,
        iconURL: entered,
      });
      break;
    }
    case 'author-url': {
      let isUrl = false;
      try {
        URL(entered);
        isUrl = true;
      } catch (err) {
        isUrl = false;
      }

      let e;
      if (!isUrl) {
        try {
          new Discord.MessageEmbed().setAuthor({ url: entered });
        } catch (err) {
          e = err;
        }
      }

      if (e || !isUrl) {
        let valid;
        if (!isUrl) valid = 'noUrl';

        errored = errorVal(e, valid);
        break;
      }

      Objects.embed.setAuthor({
        name: Objects.embed.author?.name,
        url: entered,
        iconURL: Objects.embed.author?.iconURL,
      });
      break;
    }
    case 'description': {
      let e;
      try {
        new Discord.MessageEmbed().setDescription(entered);
      } catch (err) {
        e = err;
      }

      if (e) {
        errored = errorVal(e);
        break;
      }

      Objects.embed.setDescription(entered);
      break;
    }
    case 'image': {
      let isUrl = false;
      try {
        URL(entered);
        isUrl = true;
      } catch (err) {
        isUrl = false;
      }

      let e;
      if (!isUrl) {
        try {
          new Discord.MessageEmbed().setImage(entered);
        } catch (err) {
          e = err;
        }
      }

      if (e || !isUrl) {
        let valid;
        if (!isUrl) valid = 'noUrl';

        errored = errorVal(e, valid);
        break;
      }

      Objects.embed.setImage(entered);
      break;
    }
    case 'timestamp': {
      let isTimestamp = false;
      try {
        Date(entered);
        isTimestamp = true;
      } catch (err) {
        isTimestamp = false;
      }

      let e;
      try {
        new Discord.MessageEmbed().setTimestamp(entered);
      } catch (err) {
        e = err;
      }

      if (e || !isTimestamp) {
        let valid;
        if (!isTimestamp) valid = 'noTimestamp';

        errored = errorVal(e, valid);
        break;
      }

      Objects.embed.setTimestamp(entered);
      break;
    }
    case 'footer-text': {
      let e;
      try {
        new Discord.MessageEmbed().setFooter({ text: entered });
      } catch (err) {
        e = err;
      }

      if (e) {
        errored = errorVal(e);
        break;
      }

      Objects.embed.setFooter({ text: entered });
      break;
    }
    case 'footer-iconURL': {
      let isUrl = false;
      try {
        URL(entered);
        isUrl = true;
      } catch (err) {
        isUrl = false;
      }

      let e;
      if (!isUrl) {
        try {
          new Discord.MessageEmbed().setFooter({ iconURL: entered });
        } catch (err) {
          e = err;
        }
      }

      if (e || !isUrl) {
        let valid;
        if (!isUrl) valid = 'noUrl';

        errored = errorVal(e, valid);
        break;
      }

      Objects.embed.setFooter({ iconURL: entered });
      break;
    }
  }

  if (errored) embedButtonsHandler(Objects, msg, answer);
  else module.exports.builder(msg, null, Objects.embed);
};

const handleReactionsCollector = (
  { msg, answer },
  buttonsCollector,
  reactionsCollector,
  Objects,
  { needsBack, needsPages },
) => {
  if (needsBack) {
    if (
      !msg.m.reactions.cache
        .get(msg.client.constants.emotes.back)
        ?.users.cache.has(msg.client.user.id)
    ) {
      msg.m.react(msg.client.constants.emotes.back).catch(() => {});
    }
  }
  if (needsPages && needsPages.length) {
    needsPages.forEach((page, i) => {
      if (
        !msg.m.reactions.cache
          .get(msg.client.constants.emotes.numbers[page])
          ?.users.cache.has(msg.client.user.id)
      ) {
        setTimeout(() => {
          msg.m.react(msg.client.constants.emotes.numbers[page]).catch(() => {});
        }, i * 1000);
      }
    });
  }

  reactionsCollector.on('collect', (reaction, user) => {
    if (user.id === msg.client.user.id) return;
    reaction.users.remove(user.id);
    if (user.id !== msg.author.id && user.id !== msg.client.user.id) {
      return;
    }

    if (buttonsCollector) buttonsCollector.stop();
    reactionsCollector.stop();

    module.exports.builder(msg, answer, Objects.embed, Number(reaction.emoji.name[0]));
  });
};

const handleBuilderButtons = ({ msg, answer }, Objects, resolve, lan) => {
  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 120000 });
  const reactionsCollector = msg.m.createReactionCollector({ time: 120000 });
  let ended = false;

  handleReactionsCollector({ msg, answer }, buttonsCollector, reactionsCollector, Objects, {
    needsBack: false,
    needsPages: [1, 2, 3],
  });

  buttonsCollector.on('collect', async (interaction) => {
    if (interaction.user.id !== msg.author.id) {
      msg.client.ch.notYours(interaction, msg);
      return;
    }

    buttonsCollector.resetTimer();

    switch (interaction.customId) {
      default: {
        await embedButtonsHandler(Objects, msg, interaction);
        break;
      }
      case 'viewRaw': {
        postCode(Objects, msg, interaction, null, true);
        break;
      }
      case 'inheritCode': {
        const inheritCodeEmbed = new Discord.MessageEmbed().setDescription(
          lan.inheritCodeDescription,
        );
        await replier(
          { msg, answer: interaction },
          { embeds: [inheritCodeEmbed], components: [] },
          Objects,
        );

        const messageCollector = msg.channel.createMessageCollector({ time: 900000 });
        messageCollector.on('collect', async (message) => {
          if (msg.author.id !== message.author.id) return;

          message.delete().catch(() => {});
          messageCollector.stop();

          try {
            const code = JSON.parse(
              message.content ||
                (await msg.client.ch.convertTxtFileLinkToString(message.attachments.first().url)),
            );

            Objects.embed = new Discord.MessageEmbed(code);
          } catch (e) {
            msg.client.ch.reply(msg, {
              content: `${e}\n${lan.warns.resolveAndRetry}`,
            });

            handleBuilderButtons({ msg, answer }, Objects, resolve, lan);
            return;
          }
          module.exports.builder(msg, answer, Objects.embed);
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
      case 'viewRawOtherMsg': {
        await handleOtherMsgRaw(msg, interaction, Objects);
        break;
      }
    }
  });
  buttonsCollector.on('end', (collected, reason) => {
    if (reason === 'time' && !ended) {
      const endedCollectorEmbed = msg.client.ch.collectorEnd(msg);
      postCode(Objects, msg, null, endedCollectorEmbed);
      resolve(null);
    }
  });
};
