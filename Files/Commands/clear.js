const jobs = require('node-schedule');

/* eslint-disable no-await-in-loop */
module.exports = {
  name: 'clear',
  perm: 8192n,
  dm: false,
  takesFirstArg: true,
  aliases: ['prune', 'purge'],
  type: 'mod',
  execute: async (msg) => {
    const channel = await msg.client.eris.getRESTChannel(msg.channel.id);

    if (!Number.isNaN(Number(msg.args[0]))) {
      const isUser = await msg.client.users.fetch(msg.args[0].replace(/\D+/g, '')).catch(() => {});
      if (!isUser) {
        delMsgs(msg, Number(msg.args[0]), channel);
        return;
      }
    }

    let messages = [];
    let forceStop = false;
    let filterBy;
    let fetches = 0;
    let amountArg = 1;

    switch (msg.args[0]) {
      case 'user': {
        filterBy = await msg.client.users.fetch(msg.args[1].replace(/\D+/g, '')).catch(() => {});

        if (!filterBy) {
          msg.client.ch.error(msg, msg.language.errors.userNotFound);
          return;
        }

        amountArg = 2;

        break;
      }
      case 'between': {
        const msg1 = await msg.channel.messages
          .fetch(msg.args[1].replace(/\D+/g, ''))
          .catch(() => {});

        const msg2 = await msg.channel.messages
          .fetch(msg.args[2].replace(/\D+/g, ''))
          .catch(() => {});

        amountArg = undefined;

        if (!msg1 || !msg2) {
          msg.client.ch.error(
            msg,
            msg.client.ch.stp(msg.lan.invalidMessage, { ID: !msg2 ? msg.args[2] : msg.args[1] }),
          );
          return;
        }

        if (msg2.createdTimestamp < msg1.createdTimestamp) filterBy = [msg2, msg1];
        else filterBy = [msg1, msg2];
        break;
      }
      default: {
        break;
      }
    }

    if (amountArg && Number(msg.args[amountArg]) > 100) {
      msg.client.ch.error(msg, msg.lan.tooMany);
      return;
    }

    if (amountArg && (!msg.args[amountArg] || Number(msg.args[amountArg]) < 1)) {
      msg.client.ch.error(msg, msg.lan.tooLittle);
      return;
    }

    while (messages.length !== 100 && !forceStop) {
      fetches += 1;
      messages = messages.sort((a, b) => a.createdAt - b.createdAt);
      const lastMessage = messages[messages.length - 1];

      const normalFetch = () =>
        channel.getMessages({
          limit: 100,
          before: lastMessage ? lastMessage.id : null,
        });

      switch (msg.args[0]) {
        case 'user': {
          const next100Msgs = await normalFetch();

          messages.push(
            ...next100Msgs.filter((m) => m.author.id === filterBy.id && m.id !== msg.id),
          );

          break;
        }
        case 'between': {
          const [start, end] = filterBy;

          const next100Msgs = await channel.getMessages({
            limit: 500,
            before: end.id,
          });

          forceStop = true;
          messages.push(
            ...next100Msgs.filter(
              (m) =>
                m.id !== start.id &&
                m.id !== end.id &&
                m.createdAt > start.createdTimestamp &&
                m.id !== msg.id,
            ),
          );
          break;
        }
        case 'match': {
          const next100Msgs = await normalFetch();

          messages.push(
            ...next100Msgs.filter(
              (m) =>
                m.content.toLowerCase() === msg.args.slice(2).join(' ').toLowerCase() &&
                m.id !== msg.id,
            ),
          );
          break;
        }
        case 'notmatch': {
          const next100Msgs = await normalFetch();

          messages.push(
            ...next100Msgs.filter(
              (m) =>
                m.content.toLowerCase() !== msg.args.slice(2).join(' ').toLowerCase() &&
                m.id !== msg.id,
            ),
          );
          break;
        }
        case 'startswith': {
          const next100Msgs = await normalFetch();

          messages.push(
            ...next100Msgs.filter(
              (m) =>
                m.content.toLowerCase().startsWith(msg.args.slice(2).join(' ').toLowerCase()) &&
                m.id !== msg.id,
            ),
          );
          break;
        }
        case 'endswith': {
          const next100Msgs = await normalFetch();

          messages.push(
            ...next100Msgs.filter(
              (m) =>
                m.content.toLowerCase().endsWith(msg.args.slice(2).join(' ').toLowerCase()) &&
                m.id !== msg.id,
            ),
          );
          break;
        }
        case 'includes': {
          const next100Msgs = await normalFetch();

          messages.push(
            ...next100Msgs.filter(
              (m) =>
                m.content.toLowerCase().includes(msg.args.slice(2).join(' ').toLowerCase()) &&
                m.id !== msg.id,
            ),
          );
          break;
        }
        case 'links': {
          const next100Msgs = await normalFetch();

          messages.push(
            ...next100Msgs.filter(
              (m) =>
                m.content.toLowerCase().includes('https://') ||
                m.content.toLowerCase().includes('http://'),
            ),
          );
          break;
        }
        case 'invites': {
          const next100Msgs = await normalFetch();

          messages.push(
            ...next100Msgs.filter(
              (m) =>
                m.content.toLowerCase().includes('discord.gg/') ||
                m.content.toLowerCase().includes('discord.com/invite/') ||
                m.content.toLowerCase().includes('discordapp.com/invite/'),
            ),
          );
          break;
        }
        case 'images': {
          const next100Msgs = await normalFetch();

          messages.push(
            ...next100Msgs.filter((m) =>
              m.attachments.some((attachment) => attachment.content_type?.startsWith('image')),
            ),
          );
          break;
        }
        case 'files': {
          const next100Msgs = await normalFetch();

          messages.push(...next100Msgs.filter((m) => m.attachments.length));
          break;
        }
        case 'videos': {
          const next100Msgs = await normalFetch();

          messages.push(
            ...next100Msgs.filter((m) =>
              m.attachments.some((attachment) => attachment.content_type?.startsWith('video')),
            ),
          );
          break;
        }
        case 'audio': {
          const next100Msgs = await normalFetch();

          messages.push(
            ...next100Msgs.filter((m) =>
              m.attachments.some((attachment) => attachment.content_type?.startsWith('audio')),
            ),
          );
          break;
        }
        case 'mentions': {
          const next100Msgs = await normalFetch();

          messages.push(
            ...next100Msgs.filter(
              (m) =>
                m.channelMentions.length ||
                m.mentionEveryone ||
                m.mentions.length ||
                m.roleMentions.length,
            ),
          );
          break;
        }
        case 'embeds': {
          const next100Msgs = await normalFetch();

          messages.push(...next100Msgs.filter((m) => m.embeds.length));
          break;
        }
        case 'stickers': {
          const next100Msgs = await normalFetch();

          messages.push(...next100Msgs.filter((m) => m.stickerItems?.length));
          break;
        }
        case 'text': {
          const next100Msgs = await normalFetch();

          messages.push(...next100Msgs.filter((m) => m.content?.length && m.id !== msg.id));
          break;
        }
        case 'humans': {
          const next100Msgs = await normalFetch();

          messages.push(...next100Msgs.filter((m) => !m.author.bot && m.id !== msg.id));
          break;
        }
        case 'bots': {
          const next100Msgs = await normalFetch();

          messages.push(...next100Msgs.filter((m) => m.author.bot));
          break;
        }
        default: {
          break;
        }
      }

      if (messages.length >= Number(msg.args[amountArg])) forceStop = true;
      if (fetches === 5) forceStop = true;

      messages = messages.filter(
        (value, index, self) => index === self.findIndex((t) => t.id === value.id),
      );

      messages = messages.splice(0, amountArg ? msg.args[amountArg] : 100);
    }

    delMsgs(msg, messages, channel, msg.args[amountArg]);
  },
};

const delMsgs = async (msg, amountOrMessages, channel, requestedAmount) => {
  let messages;

  if (typeof amountOrMessages === 'number') {
    if (amountOrMessages > 100) {
      msg.client.ch.error(msg, msg.lan.tooMany);
      return;
    }

    if (amountOrMessages < 1) {
      msg.client.ch.error(msg, msg.lan.tooLittle);
      return;
    }

    let amount;
    if (amountOrMessages === 100) amount = amountOrMessages;
    else amount = amountOrMessages + 1;

    requestedAmount = amountOrMessages;

    messages = await channel.getMessages({ limit: amount }).catch(() => {});
  }

  if (!messages || !messages.length) messages = amountOrMessages;

  messages = messages.filter((m) => {
    if (m.createdAt > Date.now() - 1209600000) return true;
    return false;
  });

  if (!messages || !messages.length) {
    msg.client.ch.error(msg, msg.lan.noMessages);
    return;
  }

  channel
    .deleteMessages(
      messages.map((m) => m.id),
      `${msg.author.tag} / ${msg.author.id}`,
    )
    .catch(() => {
    });

  let m;
  if (messages.length !== Number(requestedAmount)) {
    m = await msg.client.ch.reply(
      msg,
      msg.client.ch.stp(msg.lan.limitedSuccess, { amount: messages.length }),
    );
  } else {
    m = await msg.client.ch.reply(
      msg,
      msg.client.ch.stp(msg.lan.success, { amount: messages.length }),
    );
  }

  if (m) {
    m.react(msg.client.objectEmotes.timers[10]).catch(() => {});

    jobs.scheduleJob(new Date(Date.now() + 10000), () => {
      if (msg) msg.delete().catch(() => {});
      if (m) m.delete().catch(() => {});
    });
  }
};
