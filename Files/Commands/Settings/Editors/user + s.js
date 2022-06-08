const Builders = require('@discordjs/builders');

module.exports = {
  key: ['user', 'users'],
  requiresInteraction: true,
  requiresMenu: false,
  interactionType: 'message',
  async messageHandler(msgData, insertedValues, required) {
    const { msg, message } = msgData;

    const fail = (arg) => {
      let text;
      if (Array.isArray(arg)) {
        text = arg.map((c) => c).join(', ');
      } else text = arg;

      const lan = msg.lanSettings.fails[required.key];
      const embed = new Builders.UnsafeEmbedBuilder()
        .setColor(msg.client.constants.error)
        .setDescription(`${lan}\n${text}`);
      msg.client.ch.reply(message, { embeds: [embed], ephemeral: true });
    };

    const args = message.content
      .replace(/\\n/g, ' ')
      .replace(/[^\d\s]/g, '')
      .split(/ +/);

    switch (required.key) {
      case 'users': {
        insertedValues[required.assinger] = Array.isArray(insertedValues[required.assinger])
          ? insertedValues[required.assinger]
          : [];

        const notUserArgs = [];

        await Promise.all(args.map((id) => msg.client.users.fetch(id).catch(() => null)));

        args.forEach((id) => {
          const user = msg.client.users.cache.get(id);

          if (user) {
            if (
              insertedValues[required.assinger] &&
              insertedValues[required.assinger].includes(user.id)
            ) {
              const index = insertedValues[required.assinger].indexOf(user.id);
              insertedValues[required.assinger].splice(index, 1);
            } else if (
              insertedValues[required.assinger] &&
              insertedValues[required.assinger].length
            ) {
              insertedValues[required.assinger].push(user.id);
            } else insertedValues[required.assinger] = [user.id];
          } else notUserArgs.push(id);

          if (notUserArgs.length) fail(notUserArgs);
        });
        break;
      }
      default: {
        const user = msg.client.users.cache.get(message.content);
        if (user) {
          insertedValues[required.assinger] = user.id;
        } else fail(message.content);
        break;
      }
    }

    const selected = this.getSelected(msg, insertedValues, required, required.key);

    const returnEmbed = new Builders.UnsafeEmbedBuilder().setDescription(
      `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
    );

    return { returnEmbed };
  },
  getSelected(msg, insertedValues, required) {
    if (insertedValues[required.assinger]) {
      switch (required.key) {
        case 'users': {
          if (
            insertedValues[required.assinger] &&
            insertedValues[required.assinger].length &&
            Array.isArray(insertedValues[required.assinger])
          ) {
            return insertedValues[required.assinger].map((value) => `<@${value}>`).join(', ');
          }
          return msg.language.none;
        }
        default: {
          return insertedValues[required.assinger]
            ? insertedValues[required.assinger]
            : msg.language.none;
        }
      }
    }
    return null;
  },
};
