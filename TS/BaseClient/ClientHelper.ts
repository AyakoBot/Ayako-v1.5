import pool from './DataBase';
import type Eris from 'eris';
import type CT from '../typings/CustomTypings';
import jobs from 'node-schedule';

export const query = async (string: string, args?: any[], debug?: boolean) => {
  if (debug) console.log(string, args);
  const res = await pool.query(string, args);
  if (!res || !res.rowCount) return null;
  return res.rows;
};

export const send = async (
  msg: Eris.Message<Eris.PrivateChannel> | Eris.Message<Eris.TextChannel> | void,
  payload: CT.MessagePayload,
  language: CT.Language,
  command?: CT.Command,
  timeout?: number,
) => {
  if (!msg) return;

  if (timeout) {
    combineMessages(msg, payload, timeout, language);
    return;
  }

  const sentMessage = await msg.channel.createMessage(payload, payload.files).catch((err) => {
    console.log('send err', err);
  });

  cooldownHandler(msg, sentMessage, command);
  deleteCommandHandler(msg, sentMessage, language, command);
};

export const reply = async (msg: Eris.Message, payload: CT.MessagePayload) => {};

const combineMessages = async (
  msg: Eris.Message<Eris.PrivateChannel> | Eris.Message<Eris.TextChannel>,
  payload: CT.MessagePayload,
  timeout: number,
  language: CT.Language,
) => {
  const client = require('./ErisClient');

  if (!payload.embeds || !payload.embeds.length || !payload.files || !payload.files.length) {
    send(msg, payload, language);
    return;
  }

  if (!client.channelQueue.has(msg.channel.id)) {
    client.channelQueue.set(msg.channel.id, [payload]);
    client.channelCharLimit.set(msg.channel.id, getEmbedCharLens(payload.embeds));
    client.channelTimeout.get(msg.channel.id)?.cancel();

    queueSend(msg, timeout, client, language);
    return;
  }

  const updatedQueue = client.channelQueue.get(msg.channel.id);
  const charsToPush = getEmbedCharLens(payload.embeds);

  if (
    updatedQueue.length < 10 &&
    client.channelCharLimit.get(msg.channel.id) + charsToPush <= 5000
  ) {
    updatedQueue.push(payload);
    client.channelCharLimit.set(
      msg.channel.id,
      client.channelCharLimit.get(msg.channel.id) + charsToPush,
    );
    client.channelQueue.set(msg.channel.id, updatedQueue);

    client.channelTimeout.get(msg.channel.id)?.cancel();

    queueSend(msg, timeout, client, language);
    return;
  }

  if (
    updatedQueue.length === 10 ||
    client.channelCharLimit.get(msg.channel.id) + charsToPush >= 5000
  ) {
    send(msg, { embeds: updatedQueue.map((p: CT.MessagePayload) => p.embeds).flat(1) }, language);
    client.channelQueue.set(msg.channel.id, [payload]);

    client.channelTimeout.get(msg.channel.id)?.cancel();

    client.channelCharLimit.set(msg.channel.id, getEmbedCharLens(payload.embeds));
    queueSend(msg, timeout, client, language);
  }
};

const getEmbedCharLens = (embeds: Eris.EmbedOptions[]) => {
  let total = 0;
  embeds.forEach((embed) => {
    Object.values(embed).forEach((data) => {
      if (typeof data === 'string') {
        total += data.length;
      }
    });

    for (let i = 0; i < (embed.fields ? embed.fields.length : 0); i += 1) {
      const field = embed.fields ? embed.fields[i] : null;

      if (!field) continue;

      if (typeof field.name === 'string') total += field.name.length;
      if (typeof field.value === 'string') total += field.value.length;
    }
  });
  return total > 6000 ? 1000 : total;
};

const queueSend = (
  msg: Eris.Message<Eris.PrivateChannel> | Eris.Message<Eris.TextChannel>,
  timeout: number,
  client: CT.Client,
  language: CT.Language,
) => {
  client.channelTimeout.set(
    msg.channel.id,
    jobs.scheduleJob(new Date(Date.now() + timeout), () => {
      send(
        msg,
        {
          embeds: client.channelQueue
            .get(msg.channel.id)
            ?.map((p) => (p.embeds && p.embeds.length ? p.embeds : []))
            ?.flat(1)
            .filter((e) => !!e),
          files: client.channelQueue
            .get(msg.channel.id)
            ?.map((p) => (p.files && p.files.length ? p.files : []))
            ?.flat(1)
            .filter((f) => !!f),
        },
        language,
      );

      client.channelQueue.delete(msg.channel.id);
      client.channelTimeout.delete(msg.channel.id);
      client.channelCharLimit.delete(msg.channel.id);
    }),
  );
};

const cooldownHandler = async (
  msg: Eris.Message<Eris.PrivateChannel> | Eris.Message<Eris.TextChannel>,
  sentMessage: Eris.Message<Eris.PrivateChannel> | Eris.Message<Eris.TextChannel> | void,
  command?: CT.Command,
) => {
  if (!sentMessage) return;
  if (!command) return;
  if (!command.cooldownRow) return;
  if (!command.cooldownRow.cooldown) return;

  const r = command.cooldownRow;
  if (r.bpuserid?.includes(msg.author.id)) return;
  if (r.bpchannelid?.includes(msg.channel.id)) return;
  if (r.bproleid?.some((id: string) => msg.member?.roles.includes(id))) return;
  if (r.activechannelid?.length && !r.activechannelid?.includes(msg.channel.id)) return;

  const client = require('./ErisClient');
  let emote: string;

  if (Number(r.cooldown) <= 60000) {
    const emoteToUse = client.objectEmotes.timers[Number(r.cooldown) / 1000];
    emote = `${emoteToUse.name}:${emoteToUse.id}`;
  } else {
    emote = '⌛';
  }

  const reaction = await sentMessage.addReaction(emote).catch(() => null);
  if (reaction === null) return;
  const reactions = [emote];

  if (emote === '⌛') {
    const emoteToUse = client.objectEmotes.timers[60];
    emote = `${emoteToUse.name}:${emoteToUse.id}`;

    jobs.scheduleJob(new Date(Date.now() + (Number(r.cooldown) - 60000)), async () => {
      const secondReaction = await sentMessage.addReaction(emote).catch(() => null);
      if (secondReaction === null) return;
      reactions.push(emote);
    });
  }

  jobs.scheduleJob(new Date(Date.now() + Number(r.cooldown)), async () => {
    reactions.forEach((react) => {
      sentMessage.removeReactionEmoji(react).catch(() => null);
    });
  });
};

const deleteCommandHandler = (
  msg: Eris.Message<Eris.PrivateChannel> | Eris.Message<Eris.TextChannel>,
  sentMessage: Eris.Message<Eris.PrivateChannel> | Eris.Message<Eris.TextChannel> | void,
  language: CT.Language,
  command?: CT.Command,
) => {
  if (!sentMessage) return;
  if (!command) return;

  const r = command.deleteCommandRow;
  if (!r) return;
  if (!r.commands?.includes(command.name)) return;
  if (!r.deletetimeout || Number(r.deletetimeout) === 0) return;

  if (r.deletecommand && r.deletetimeout) {
    jobs.scheduleJob(new Date(Date.now() + Number(r.deletetimeout)), () => {
      msg.delete(language.commands.deleteHandler.reasonCommand).catch(() => null);
    });
  } else if (r.deletecommand) {
    msg.delete(language.commands.deleteHandler.reasonCommand).catch(() => null);
  }

  if (r.deletereply && r.deletetimeout) {
    jobs.scheduleJob(new Date(Date.now() + Number(r.deletetimeout)), () => {
      sentMessage.delete(language.commands.deleteHandler.reasonReply).catch(() => null);
    });
  } else if (r.deletereply) {
    sentMessage.delete(language.commands.deleteHandler.reasonReply).catch(() => null);
  }
};
