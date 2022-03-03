const Discord = require('discord.js');

class CustomEmbed extends Discord.UnsafeEmbed {
  constructor(guild, oldEmbed) {
    super();

    if (oldEmbed) {
      this.data = oldEmbed.data;

      if (oldEmbed.author && !oldEmbed.author.link) {
        this.setAuthor({
          url: guild.client.constants.standard.invite,
          name: oldEmbed.author.name,
          iconURL: oldEmbed.author.iconURL,
        });
      }

      if (!oldEmbed.color) {
        this.setColor(
          guild && guild.me ? guild.me.displayColor : guild.client.constants.standard.color,
        );
      }
    }
  }

  /**
   * @param {{ data: any; }} oldEmbed
   */
  set data(oldEmbed) {
    this.data = oldEmbed.data;
  }
}

module.exports = CustomEmbed;
