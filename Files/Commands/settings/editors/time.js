const Discord = require('discord.js');
const ms = require('ms');

module.exports = {
  key: ['time'],
  requiresInteraction: true,
  interactionType: 'message',
  requiresMenu: false,
  messageHandler(msgData, insertedValues, required) {
    const { msg, message } = msgData;

    const args = message.content.replace(/\\n/g, ' ').split(/ +/);

    let duration = 0;
    args.forEach((n, i) => {
      if (!Number.isNaN(ms(n))) {
        if (args[i + 1] && Number.isNaN(+ms(args[i + 1]))) {
          n = `${n} ${args[i + 1]}`;
          args.splice(i + 1, 1);
        }
        duration = Number(duration) + Number(ms(n));
      }
    });
    insertedValues[required.assinger] = duration;

    const selected = this.getSelected(msg, insertedValues, required, required.key);

    const returnEmbed = new Discord.UnsafeEmbed().setDescription(
      `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
    );

    return { returnEmbed };
  },
  getSelected(msg, insertedValues, required) {
    if (insertedValues[required.assinger]) {
      return insertedValues[required.assinger]
        ? `${ms(insertedValues[required.assinger])}`
        : msg.language.none;
    }
    return null;
  },
};
