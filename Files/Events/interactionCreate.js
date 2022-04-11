const Builders = require('@discordjs/builders');

module.exports = {
  execute: async (interaction) => {
    if (!interaction.user) return;

    otherInteractionHandler(interaction);
    slashCommandHandler(interaction);
  },
};

const otherInteractionHandler = async (interaction) => {
  const { args, nonSlashCommand } = getInteraction(interaction);
  if (!nonSlashCommand) return;

  const language = await interaction.client.ch.languageSelector(interaction.guild);
  args.shift();
  interaction.args = args;

  try {
    nonSlashCommand.execute(interaction, language);
  } catch (e) {
    error(interaction, e);
  }
};

const getInteraction = (interaction) => {
  const nonSlashCommand = interaction.client.nonSlashCommands.find((cmd) =>
    cmd.name === cmd.split ? interaction.customId.split(cmd.split) : interaction.customId,
  );

  const args = nonSlashCommand.split
    ? interaction.customId.split(nonSlashCommand.split)
    : interaction.customId;

  return { args, nonSlashCommand };
};

const slashCommandHandler = async (interaction) => {
  const slashCommand =
    interaction.client.slashCommands.get(interaction.customId) ||
    interaction.client.slashCommands.get(interaction.commandName);
  if (!slashCommand) return;
  const language = await interaction.client.ch.languageSelector(interaction.guild);

  // eslint-disable-next-line no-console
  console.log('Slash Command executed: ', slashCommand.name);
  try {
    slashCommand.execute(interaction, language);
  } catch (e) {
    error(interaction, e);
  }
};

const error = (interaction, e) => {
  // eslint-disable-next-line no-console
  console.log(e);

  const channel = interaction.client.channels.cache.get(interaction.client.constants.errorchannel);

  const embed = new Builders.UnsafeEmbedBuilder()
    .setAuthor({
      name: 'Interaction Error',
      iconURL: interaction.client.objectEmotes.cross.link,
      url: interaction.url,
    })
    .setTimestamp()
    .setDescription(`${interaction.client.ch.makeCodeBlock(e.stack)}`)
    .addFields({
      name: 'Message',
      value: `${interaction.client.ch.makeCodeBlock(interaction)}`,
    })
    .addFields({
      name: 'Guild',
      value: `${interaction.guild?.name} | ${interaction.guild?.id}`,
    })
    .addFields({
      name: 'Channel',
      value: `${interaction.channel?.name} | ${interaction.channel?.id}`,
    })
    .addFields({ name: 'Message Link', value: interaction.url })
    .setColor(16711680);
  if (channel) interaction.client.ch.send(channel, { embeds: [embed] });
};
