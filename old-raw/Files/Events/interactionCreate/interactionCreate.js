module.exports = {
  execute: async (interaction) => {
    if (!interaction.user) return;

    require('./otherInteractionHandler')(interaction);
    require('./slashCommandHandler')(interaction);
  },
};
