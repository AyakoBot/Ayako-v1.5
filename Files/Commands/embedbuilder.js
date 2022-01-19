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
    const lan = msg.language.embedBuilder;
    const finishedEmbed = new Discord.MessageEmbed().setDescription(lan.placeholder);

    const Objects = {
      edit: 'menu',
      category: null,
      data: msg.client.constants.embedBuilder.embed,
      embed: finishedEmbed,
    };

    replier(
      { msg, answer },
      { embeds: [finishedEmbed], components: getComponents(msg, { page: 1 }) },
    );

    return finishedEmbed;
  },
};

const replier = async ({ msg, answer }, { embeds, components }) => {
  const warnEmbed = getWarnEmbed(msg);
  if (warnEmbed) embeds.push(warnEmbed);

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

const getWarnEmbed = (msg) => {
  const lan = msg.language.commands.embedBuilder;
  const lanWarns = lan.warns;
};

const getComponents = (msg, { page }) => {
  const components = [];
  switch (page) {
    default: {
      break;
    }
  }
};
