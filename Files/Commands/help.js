const Builders = require('@discordjs/builders');

module.exports = {
  name: 'help',
  perm: null,
  dm: true,
  takesFirstArg: false,
  aliases: ['h', 'commands'],
  type: 'info',
  execute: async (msg) => {
    const embed = msg.args[0] ? getEmbed(msg, msg.args[0].toLowerCase()) : getBaseEmbed(msg);

    msg.client.ch.reply(msg, { embeds: [embed], ephemeral: true });
  },
};

const getBaseEmbed = (msg) => {
  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: msg.lan.authorNoType,
      url: msg.client.constants.standard.invite,
    })
    .setColor(msg.client.ch.colorSelector(msg.guild.me))
    .setFooter({
      iconURL:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Patreon_logo.svg/541px-Patreon_logo.svg.png',
      text: msg.client.ch.stp(msg.lan.patreon, { patreon: msg.client.constants.standard.patreon }),
    });

    
};

const getEmbed = (msg, category) => {
  const commands = msg.client.commands.filter(
    (c) =>
      c.type === category &&
      !c.unfinished &&
      (!c.thisGuildOnly || c.thisGuildOnly.includes(msg.guild.id)),
  );

  const settings = msg.client.settings.filter(
    (s) => s.helpCategory === category && (s.finished || typeof s.finished !== 'boolean'),
  );

  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: msg.client.ch.stp(msg.lan.author, { type: msg.lan[category] }),
      url: msg.client.constants.standard.invite,
    })
    .setColor(msg.client.ch.colorSelector(msg.guild.me))
    .setFooter({
      iconURL:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Patreon_logo.svg/541px-Patreon_logo.svg.png',
      text: msg.client.ch.stp(msg.lan.patreon, { patreon: msg.client.constants.standard.patreon }),
    });

  if (settings.length) {
    embed.setDescription(
      `${msg.client.ch.stp(msg.lan.settingsName, { type: msg.lan[category] })}\n`,
    );
  }
  settings.forEach((s) => {
    embed.data.description += `\`${msg.client.constants.standard.prefix}settings ${s.name}\`\n`;
  });

  commands.forEach((c) => {
    const lan = msg.language.commands[c.name];

    embed.addFields({
      name: `\`${c.name}\``,
      value: `${lan.description}`,
      inline: lan.description.length < 50,
    });
  });

  if (!embed.data.fields?.length) {
    embed.addFields({ name: msg.lan.noCommands, value: '\u200b', inline: false });
  }

  if (!embed.data.description?.length) {
    embed.setDescription(msg.lan.noSettings);
  }

  embed.data.description += `\n${msg.client.ch.stp(msg.lan.listSettings, {
    prefix: msg.client.constants.standard.prefix,
  })}`;

  return embed;
};
