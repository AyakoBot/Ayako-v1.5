const Discord = require('discord.js');

module.exports = {
  key: ['messagelink', 'messagelinks'],
  requiresInteraction: true,
  requiresMenu: false,
  interactionType: 'message',
  buttons(msg, preparedData, insertedValues, required, row) {
    let doneDisabled = true;

    if (Array.isArray(insertedValues[required.assinger])) {
      doneDisabled =
        msg.client.ch.arrayEquals(insertedValues[required.assinger], row[required.assinger]) ||
        (!insertedValues[required.assinger].length && required.required);
    } else {
      doneDisabled = !insertedValues[required.assinger];
    }

    const done = new Discord.UnsafeButtonComponent()
      .setCustomId('done')
      .setLabel(msg.language.done)
      .setDisabled(doneDisabled)
      .setStyle(Discord.ButtonStyle.Primary);

    return [[done]];
  },
  async messageHandler(msgData, insertedValues, required) {
    const { msg, message } = msgData;

    const args = message.content.replace(/\\n/g, ' ').split(/ +/);

    switch (required.key) {
      case 'messagelinks': {
        insertedValues[required.assinger] = Array.isArray(insertedValues[required.assinger])
          ? insertedValues[required.assinger]
          : [];

        const notValid = [];

        await Promise.all(
          args.map(async (arg) => {
            const isValidMessageLink = await getMessageLink(msg, arg);

            if (!isValidMessageLink) {
              notValid.push(arg);
            } else if (
              insertedValues[required.assinger] &&
              insertedValues[required.assinger].includes(isValidMessageLink)
            ) {
              const index = insertedValues[required.assinger].indexOf(isValidMessageLink);
              insertedValues[required.assinger].splice(index, 1);
            } else if (
              insertedValues[required.assinger] &&
              insertedValues[required.assinger].length
            ) {
              insertedValues[required.assinger].push(isValidMessageLink);
            } else insertedValues[required.assinger] = [isValidMessageLink];
          }),
        );

        if (notValid.length) {
          msg.client.ch.error(
            msg,
            msg.client.ch.stp(msg.lan.notValidLink, { links: `\`${notValid.join('`\n`')}\`` }),
          );
        }

        break;
      }
      default: {
        const isValidMessageLink = await getMessageLink(msg, message.content);

        if (!isValidMessageLink) {
          msg.client.ch.error(
            msg,
            msg.client.ch.stp(msg.lan.notValidLink, { links: `\`${message.content}\`` }),
          );
        }

        insertedValues[required.assinger] = isValidMessageLink;
        break;
      }
    }

    const selected = this.getSelected(msg, insertedValues, required, required.key);

    const returnEmbed = new Discord.UnsafeEmbed().setDescription(
      `**${msg.language.selected}:**\n${selected?.length ? selected : msg.language.none}`,
    );

    return { returnEmbed };
  },
  getSelected(msg, insertedValues, required) {
    if (insertedValues[required.assinger]) {
      switch (required.key) {
        case 'messagelinks': {
          return insertedValues[required.assinger] &&
            insertedValues[required.assinger].length &&
            Array.isArray(insertedValues[required.assinger])
            ? insertedValues[required.assinger].map((value) => `\`${value}\``).join(', ')
            : msg.language.none;
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

const getMessageLink = async (msg, arg) => {
  const [, , , guildid, channelid, messageid] = arg.split(/\/+/);

  if (guildid !== msg.guild.id) return false;

  const channel = msg.guild.channels.cache.get(channelid);
  if (!channel) return false;

  const message = await channel.messages.fetch(messageid).catch(() => {});
  if (!message) return false;

  return msg.client.ch.stp(msg.client.constants.standard.discordUrlDB, {
    guildid,
    channelid,
    msgid: messageid,
  });
};
