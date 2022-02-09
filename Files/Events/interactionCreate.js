const Discord = require('discord.js');

module.exports = {
  async execute(interaction) {
    switch (interaction.customId) {
      default: {
        break;
      }
      case 'vote_reminder_disable': {
        interaction.client.ch.query(
          `INSERT INTO users (userid, votereminders) VALUES ($1, $2)
        ON CONFLICT (userid) DO
        UPDATE SET votereminders = $2;`,
          [interaction.user.id, false],
        );

        const msg = await interaction.message.fetch().catch(() => {});
        if (!msg) break;

        const enable = new Discord.MessageButton()
          .setCustomId('vote_reminder_enable')
          .setStyle('SUCCESS')
          .setLabel('Enable Vote Reminder');

        const vote = new Discord.MessageButton()
          .setStyle('LINK')
          .setURL('https://top.gg/bot/650691698409734151/vote')
          .setLabel('Vote for Ayako');

        const embed = new Discord.MessageEmbed(msg.embeds[0]);

        interaction.update({
          embeds: [embed],
          components: interaction.client.ch.buttonRower([vote, enable]),
        });

        break;
      }
      case 'vote_reminder_enable': {
        interaction.client.ch.query(
          `INSERT INTO users (userid, votereminders) VALUES ($1, $2)
        ON CONFLICT (userid) DO
        UPDATE SET votereminders = $2;`,
          [interaction.user.id, true],
        );

        const msg = await interaction.message.fetch().catch(() => {});
        if (!msg) break;

        const disable = new Discord.MessageButton()
          .setCustomId('vote_reminder_disable')
          .setStyle('DANGER')
          .setLabel('Disable Vote Reminder');

        const vote = new Discord.MessageButton()
          .setStyle('LINK')
          .setURL('https://top.gg/bot/650691698409734151/vote')
          .setLabel('Vote for Ayako');

        const embed = new Discord.MessageEmbed(msg.embeds[0]);

        interaction.update({
          embeds: [embed],
          components: interaction.client.ch.buttonRower([vote, disable]),
        });

        break;
      }
    }
  },
};
