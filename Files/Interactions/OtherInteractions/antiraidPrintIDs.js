const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  name: 'antiraid_print_ids',
  split: null,
  execute: async (cmd) => {
    const rawContent = await cmd.client.ch.convertTxtFileLinkToString(
      (await cmd.message.fetch()).attachments.first().url,
    );
    const splitContent = Discord.Util.splitMessage(rawContent, {
      maxLength: 3994,
    });

    cmd.reply({
      embeds: [
        new Builders.UnsafeEmbedBuilder()
          .setColor(cmd.client.constants.standard.ephemeralColor)
          .setDescription(cmd.client.ch.makeCodeBlock(splitContent[0])),
      ],
      ephemeral: true,
    });

    splitContent.shift();

    splitContent.forEach((content) => {
      cmd.followUp({
        embeds: [
          new Builders.UnsafeEmbedBuilder()
            .setColor(cmd.client.constants.standard.ephemeralColor)
            .setDescription(cmd.client.ch.makeCodeBlock(content)),
        ],
        ephemeral: true,
      });
    });
  },
};
