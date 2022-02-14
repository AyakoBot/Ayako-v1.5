const Discord = require('discord.js');

module.exports = {
  execute: async (interaction) => {
    console.log(interaction.customId);
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
      case 'antiraid_massban': {
        const command = interaction.client.commands.get('massban');
        if ((await interaction.member.fetch()).permissions.has(command.perm)) return;
        const rawContent = await interaction.client.ch.convertTxtFileLinkToString(
          await interaction.message.fetch().attachments.first().url,
        );

        const args = rawContent.replace(new RegExp('\\n', 'g'), ' ').split(/ +/);
        const language = await interaction.client.ch.languageSelector(interaction.guild);

        const msg = {
          client: interaction.client,
          args,
          guild: interaction.guild,
          language,
          lan: language.commands.massban,
          author: interaction.user,
          member: interaction.member,
        };

        msg.logchannels = [];
        const res = await msg.client.ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [
          msg.guild.id,
        ]);
        if (res && res.rowCount > 0) {
          msg.logchannels = res.rows[0].modlogs
            ?.map((id) =>
              typeof msg.client.channels.cache.get(id)?.send === 'function'
                ? msg.client.channels.cache.get(id)
                : null,
            )
            .filter((c) => c !== null);
        }
        interaction.reply({
          ephemeral: true,
          content: language.commands.antiraidHandler.debugMessage,
        });

        command.execute(msg);
        break;
      }
      case 'antiraid_print_ids': {
        const rawContent = await interaction.client.ch.convertTxtFileLinkToString(
          (await interaction.message.fetch()).attachments.first().url,
        );
        const splitContent = Discord.Util.splitMessage(rawContent, {
          maxLength: 3994,
        });

        interaction.reply({
          embeds: [
            new Discord.MessageEmbed()
              .setColor(interaction.client.constants.standard.ephemeralColor)
              .setDescription(interaction.client.ch.makeCodeBlock(splitContent[0])),
          ],
          ephemeral: true,
        });

        splitContent.shift();

        splitContent.forEach((content) => {
          interaction.followUp({
            embeds: [
              new Discord.MessageEmbed()
                .setColor(interaction.client.constants.standard.ephemeralColor)
                .setDescription(interaction.client.ch.makeCodeBlock(content)),
            ],
            ephemeral: true,
          });
        });

        break;
      }
    }
  },
};
