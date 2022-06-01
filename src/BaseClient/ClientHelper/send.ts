import type Eris from 'eris';
import type CT from '../../typings/CustomTypings';
import jobs from 'node-schedule';
import send from './send';
import client from '../ErisClient.js';

export default async (
  channel: Eris.TextChannel | Eris.TextChannel[] | Eris.PrivateChannel,
  payload: CT.MessagePayload,
  language: CT.Language,
  command?: CT.Command,
  timeout?: number,
) => {
  if (!channel) return;

  if (Array.isArray(channel)) {
    channel.forEach((c) => {
      send(c, payload, language, command, timeout);
    });
    return;
  }

  if (timeout) {
    combineMessages({ channel }, payload, timeout, language);
    return;
  }

  const sentMessage = await channel.createMessage(payload, payload.files).catch((err) => {
    console.log('send err', err);
  });

  return sentMessage;
};

const combineMessages = async (
  { channel }: { channel: Eris.PrivateChannel | Eris.TextChannel },
  payload: CT.MessagePayload,
  timeout: number,
  language: CT.Language,
) => {

  if (!payload.embeds || !payload.embeds.length || !payload.files || !payload.files.length) {
    send(channel, payload, language);
    return;
  }

  if (!client.channelQueue.has(channel.id)) {
    client.channelQueue.set(channel.id, [payload]);
    client.channelCharLimit.set(channel.id, getEmbedCharLens(payload.embeds));
    client.channelTimeout.get(channel.id)?.cancel();

    queueSend(channel, timeout, language);
    return;
  }

  const updatedQueue = client.channelQueue.get(channel.id);
  const charsToPush = getEmbedCharLens(payload.embeds);
  const charLimit = client.channelCharLimit.get(channel.id)

  if (updatedQueue && updatedQueue.length < 10 && charLimit && charLimit + charsToPush <= 5000) {
    updatedQueue.push(payload);
    client.channelCharLimit.set(channel.id, charLimit + charsToPush);
    client.channelQueue.set(channel.id, updatedQueue);

    client.channelTimeout.get(channel.id)?.cancel();

    queueSend(channel, timeout, language);
    return;
  }

  if (updatedQueue && (( updatedQueue.length === 10) || (charLimit && charLimit + charsToPush >= 5000))) {
    const embeds = updatedQueue.map((p: CT.MessagePayload) => p.embeds).flat(1).filter((e): e is Eris.EmbedOptions => !!e) || [];
    send(
      channel,
      { embeds: embeds },
      language,
    );

    client.channelQueue.set(channel.id, [payload]);
    client.channelTimeout.get(channel.id)?.cancel();
    client.channelCharLimit.set(channel.id, getEmbedCharLens(payload.embeds));
    
    queueSend(channel, timeout, language);
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
  channel: Eris.PrivateChannel | Eris.TextChannel,
  timeout: number,
  language: CT.Language,
) => {
  client.channelTimeout.set(
    channel.id,
    jobs.scheduleJob(new Date(Date.now() + timeout), () => {
      send(
        channel,
        {
          embeds: client.channelQueue
            .get(channel.id)
            ?.map((p) => (p.embeds && p.embeds.length ? p.embeds : []))
            ?.flat(1)
            .filter((e) => !!e),
          files: client.channelQueue
            .get(channel.id)
            ?.map((p) => (p.files && p.files.length ? p.files : []))
            ?.flat(1)
            .filter((f) => !!f),
        },
        language,
      );

      client.channelQueue.delete(channel.id);
      client.channelTimeout.delete(channel.id);
      client.channelCharLimit.delete(channel.id);
    }),
  );
};
