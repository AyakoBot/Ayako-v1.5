const Discord = require('discord.js');

class CustomSelectMenuOption extends Discord.SelectMenuOption {
  constructor(options) {
    if (!options.label) {
      throw new Error('Select Menu Option Requires a Label');
    }
    if (!options.value) {
      throw new Error('Select Menu Option Requires a Value');
    }

    super({
      label: String(options.label),
      value: String(options.value),
      description: options.description ? String(options.description) : null,
      emoji: options.emoji ? Object(options.emoji) : null,
      default: options.default ? Boolean(options.default) : false,
    });
  }
}

module.exports = CustomSelectMenuOption;
