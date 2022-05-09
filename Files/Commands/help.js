const Builders = require('@discordjs/builders');

module.exports = {
  name: 'help',
  perm: null,
  dm: true,
  takesFirstArg: false,
  aliases: ['h', 'commands'],
  type: 'info',
  execute: async (msg) => {
    const embed = getEmbed(msg, msg.args[0].toLowerCase());

    msg.client.ch.reply(msg, { embeds: [embed], ephemeral: true });
  },
};

const getEmbed = (msg, category) => {
  const commands = msg.client.commands.filter((c) => c.type === category);
  const embed = new Builders.UnsafeEmbedBuilder();

  commands.forEach((c) => {
    const lan = msg.language.commands[c.name];
    embed.addFields({ name: `\`${c.name}\``, value: `${lan.description}`, inline: true });
  });

  return embed;
};
