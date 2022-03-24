const Discord = require('discord.js');
const Builders = require('@discordjs/builders');

module.exports = {
  execute: async (interaction) => {
    switch (interaction.customId) {
      case 'vote_reminder_disable': {
        interaction.client.ch.query(
          `INSERT INTO users (userid, votereminders) VALUES ($1, $2)
        ON CONFLICT (userid) DO
        UPDATE SET votereminders = $2;`,
          [interaction.user.id, false],
        );

        const msg = await interaction.message.fetch().catch(() => {});
        if (!msg) break;

        const enable = new Discord.UnsafeButtonComponent()
          .setCustomId('vote_reminder_enable')
          .setStyle(Discord.ButtonStyle.Primary)
          .setLabel('Enable Vote Reminder');

        const vote = new Discord.UnsafeButtonComponent()
          .setStyle(Discord.ButtonStyle.Link)
          .setURL('https://top.gg/bot/650691698409734151/vote')
          .setLabel('Vote for Ayako');

        const embed = new Discord.UnsafeEmbed(msg.embeds[0]);

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

        const disable = new Discord.UnsafeButtonComponent()
          .setCustomId('vote_reminder_disable')
          .setStyle(Discord.ButtonStyle.Danger)
          .setLabel('Disable Vote Reminder');

        const vote = new Discord.UnsafeButtonComponent()
          .setStyle(Discord.ButtonStyle.Link)
          .setURL('https://top.gg/bot/650691698409734151/vote')
          .setLabel('Vote for Ayako');

        const embed = new Discord.UnsafeEmbed(msg.embeds[0]);

        interaction.update({
          embeds: [embed],
          components: interaction.client.ch.buttonRower([vote, disable]),
        });

        break;
      }
      case 'antiraid_massban': {
        interaction.deferReply();
        const command = interaction.client.commands.get('massban');

        const language = await interaction.client.ch.languageSelector(interaction.guild);
        interaction.language = language;

        if (!(await interaction.member.fetch()).permissions.has(command.perm)) {
          interaction.client.ch.permError(
            interaction,
            new Discord.PermissionsBitField(command.perm),
            false,
          );
          return;
        }

        const rawContent = await interaction.client.ch.convertTxtFileLinkToString(
          (await interaction.message.fetch()).attachments.first().url,
        );

        const args = rawContent.replace(/\\n/g, ' ').split(/ +/);

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

        command.execute(msg, interaction);
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
            new Builders.UnsafeEmbedBuilder()
              .setColor(interaction.client.constants.standard.ephemeralColor)
              .setDescription(interaction.client.ch.makeCodeBlock(splitContent[0])),
          ],
          ephemeral: true,
        });

        splitContent.shift();

        splitContent.forEach((content) => {
          interaction.followUp({
            embeds: [
              new Builders.UnsafeEmbedBuilder()
                .setColor(interaction.client.constants.standard.ephemeralColor)
                .setDescription(interaction.client.ch.makeCodeBlock(content)),
            ],
            ephemeral: true,
          });
        });

        break;
      }
      case 'AwesomeForm': {
        interaction.reply({ content: 'thanks', ephemeral: true });

        break;
      }
      default: {
        break;
      }
    }
  },
};
