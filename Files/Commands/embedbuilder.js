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
  async builder(msg, answer) {
    msg.lang = msg.language.embedBuilder;
    msg.lanEmbed = msg.lang.embed;
    const finishedEmbed = new Discord.MessageEmbed().setDescription(msg.lang.placeholder);

    const Objects = {
      edit: 'menu',
      category: null,
      data: msg.client.constants.embedBuilder.embed,
      embed: finishedEmbed,
    };

    await repeater({ msg, answer }, Objects);

    return finishedEmbed;
  },
};

const replier = async ({ msg, answer }, { embeds, components }) => {
  if (answer && answer.replied) {
    answer.update({ embeds, components });
  } else if (msg.m) {
    msg.client.ch.reply(msg, {
      embeds,
      components,
    });
  } else {
    msg.m = await msg.client.ch.reply(msg, {
      embeds,
      components,
    });
  }
};

const menu = async ({ msg, answer }, Objects) => {
  const settingsEmbed = getSettingsEmbed(msg);

  let buttons = [];
  if (Objects.edit === 'menu') {
    buttons = mainButtons(msg);
  }

  if (!buttons.length) {
    const typeButtons = Object.entries(msg.lanEmbed[Objects.category]).map(([key, lan]) => {
      if (key !== Objects.category) return null;
      return {
        custom_id: lan,
        disabled: false,
        emoji: null,
        label: lan,
        style: 2,
        type: 2,
        url: null,
      };
    });

    buttons.push([
      new Discord.MessageButton()
        .setLabel(msg.language.back)
        .setCustomId('back')
        .setStyle('DANGER')
        .setEmoji(msg.client.constants.emotes.back),
    ]);

    buttons = msg.client.ch.buttonRower(buttons);
  }

  await replier({ msg, answer }, { embeds: [Objects.embed, settingsEmbed], components: buttons });
};

const repeater = async ({ msg, answer }, Objects) => {
  console.log('eb0', Objects);

  if (Objects.edit === 'menu') {
    await menu({ msg, answer }, Objects);
    answer = await buttonsHandler({ msg, answer }, Objects);
  }

  console.log('eb1', Objects);

  if (Objects.category && !Objects.edit) {
    await menu({ msg, answer }, Objects);
    answer = await buttonsHandler({ msg, answer }, Objects);
  }

  console.log('eb2', Objects);

  if (Objects.edit !== 'menu' && Objects.category) {
    answer = await editor({ msg, answer }, Objects);
  }

  console.log('eb3', Objects);
  return;
  return repeater({ msg, answer }, Objects);
};

const buttonsHandler = async ({ msg }, Objects) => {
  const buttonsCollector = msg.m.createMessageComponentCollector({ time: 60000 });

  return new Promise((resolve) => {
    buttonsCollector.on('collect', (interaction) => {
      buttonsCollector.stop();
      switch (interaction.customId) {
        default: {
          if (!Objects.category) {
            Objects.category = interaction.customId;
            Objects.edit = null;
          } else {
            Objects.edit = interaction.customId;
          }
          break;
        }
        case 'back': {
          Objects.edit = 'menu';
          Object.category = null;
          break;
        }
      }
      resolve(interaction);
    });
    buttonsCollector.on('end', (collected, reason) => {
      if (reason === 'time') {
        msg.client.ch.collectorEnd(msg);
        resolve(null);
      }
    });
  });
};

const mainButtons = (msg) => {
  return msg.client.ch.buttonRower([
    [
      {
        custom_id: 'title',
        disabled: false,
        emoji: null,
        label: msg.lanEmbed.title.title,
        style: 2,
        type: 2,
        url: null,
      },
      {
        custom_id: 'author',
        disabled: false,
        emoji: null,
        label: msg.lanEmbed.author.author,
        style: 2,
        type: 2,
        url: null,
      },
      {
        custom_id: 'thumbnail',
        disabled: false,
        emoji: null,
        label: msg.lanEmbed.thumbnail.thumbnail,
        style: 2,
        type: 2,
        url: null,
      },
    ],
    [
      {
        custom_id: 'description',
        disabled: false,
        emoji: null,
        label: msg.lanEmbed.description.description,
        style: 2,
        type: 2,
        url: null,
      },
      {
        custom_id: 'color',
        disabled: false,
        emoji: null,
        label: msg.lanEmbed.color.color,
        style: 2,
        type: 2,
        url: null,
      },
      {
        custom_id: 'image',
        disabled: false,
        emoji: null,
        label: msg.lanEmbed.image.image,
        style: 2,
        type: 2,
        url: null,
      },
      {
        custom_id: 'field',
        disabled: false,
        emoji: null,
        label: msg.lanEmbed.field.field,
        style: 2,
        type: 2,
        url: null,
      },
    ],
    [
      {
        custom_id: 'footer',
        disabled: false,
        emoji: null,
        label: msg.lanEmbed.footer.footer,
        style: 2,
        type: 2,
        url: null,
      },
      {
        custom_id: 'timestamp',
        disabled: false,
        emoji: null,
        label: msg.lanEmbed.timestamp.timestamp,
        style: 2,
        type: 2,
        url: null,
      },
    ],
  ]);
};

const getSettingsEmbed = (msg) => {
  return new Discord.MessageEmbed()
    .setColor(msg.client.constants.commands.settings.color)
    .setAuthor(
      msg.lang.author,
      msg.client.constants.emotes.settingsLink,
      msg.client.constants.standard.invite,
    )
    .setDescription(msg.lang.decide);
};

const editor = async ({ msg, answer }, Objects) => {
  return console.log(Objects);
};
