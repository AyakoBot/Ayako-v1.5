const Builders = require('@discordjs/builders');
const fs = require('fs');
const jobs = require('node-schedule');

const nonSlashCommandCooldowns = new Map();

module.exports = async (interaction) => {
  const { args, nonSlashCommand } = getInteraction(interaction);
  if (!nonSlashCommand) return;

  if (nonSlashCommand.cooldown) {
    if (nonSlashCommandCooldowns.has(interaction.user.id)) {
      const timeleft = Math.abs(nonSlashCommandCooldowns.get(interaction.user.id) - Date.now());

      interaction.client.ch.reply(interaction, {
        content: interaction.client.ch.stp(
          interaction.language.commands.commandHandler.pleaseWait,
          {
            time: `${Math.ceil(timeleft / 1000)} ${interaction.language.time.seconds}`,
          },
        ),
        ephemeral: true,
      });
      return;
    }
    nonSlashCommandCooldowns.set(interaction.user.id, Date.now());
    jobs.scheduleJob(new Date(Date.now() + nonSlashCommand.cooldown), () => {
      nonSlashCommandCooldowns.delete(interaction.user.id);
    });
  }

  if (nonSlashCommand.needsLanguage) {
    interaction.language = await interaction.client.ch.languageSelector(interaction.guild);
  }

  if (args && args.length) args.shift();
  interaction.args = args;

  try {
    nonSlashCommand.execute(interaction, interaction.language);
  } catch (e) {
    error(interaction, e);
  }
};

const getInteraction = (interaction) => {
  const nonSlashCommand = getNonSlashCommand(interaction);

  if (!nonSlashCommand) return { args: [], nonSlashCommand: null };

  const args = nonSlashCommand.split
    ? interaction.customId.split(nonSlashCommand.split)
    : [interaction.customId];

  return { args, nonSlashCommand };
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

const getNonSlashCommand = (cmd) => {
  const dir = `${require.main.path}/Files/Interactions/OtherInteractions`;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'));

  const file = files.find((c) => {
    const possibleFile = require(`${dir}/${c}`);
    if (
      possibleFile.name === (possibleFile.split ? cmd.customId?.split(cmd.split)[0] : cmd.customId)
    ) {
      return true;
    }
    return false;
  });

  return file;
};
