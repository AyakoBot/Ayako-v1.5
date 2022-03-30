module.exports = {
  name: 'reloadinteraction',
  perm: 0,
  dm: true,
  takesFirstArg: true,
  aliases: ['ri'],
  execute(msg) {
    const { args } = msg;
    if (!args.length) {
      return msg.channel.send(`You didn't pass any Interaction to reload, ${msg.author}!`);
    }

    const interactionName = args.slice(0).join(' ').toLowerCase();
    const interaction =
      msg.client.interactions.get(interactionName) ||
      msg.client.interactions.find((i) => i.aliases.includes(interactionName));

    if (!interaction) {
      return msg.channel.send(
        `There is no interaction with name \`${interactionName}\`, ${msg.author}!`,
      );
    }

    delete require.cache[require.resolve(interaction.path)];
    try {
      const newInteraction = require(interaction.path);
      newInteraction.folder = interaction.folder;
      newInteraction.name = interaction.name;
      newInteraction.path = interaction.path;

      msg.client.interactions.set(interactionName, newInteraction);
      msg.channel.send(`Interaction \`${interactionName}\` was reloaded!`);
    } catch (error) {
      msg.channel.send(
        `There was an error while reloading the Interaction \`${interactionName}\`:\n${msg.client.ch.makeCodeBlock(
          error.stack,
        )}`,
      );
    }

    return null;
  },
};
